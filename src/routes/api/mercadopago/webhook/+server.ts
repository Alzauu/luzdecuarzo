import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { obtenerPago } from '$lib/server/mercadopago';
import { buscarPorReferenciaExterna, marcarPagoReserva, type Reserva } from '$lib/server/db';
import { enviarCorreoConfirmacion } from '$lib/server/email';
import { enviarWhatsappDueña } from '$lib/server/whatsapp';

// Mercado Pago llama a esta URL cada vez que hay novedades sobre un pago.
// Puede llegar más de una vez para el mismo pago (reintentos), así que el código
// debe ser seguro de ejecutar varias veces sin duplicar correos/whatsapps (ver más abajo).
export const POST: RequestHandler = async ({ request, url }) => {
	// Mercado Pago manda el aviso de dos formas posibles: por query params o en el body.
	const topic = url.searchParams.get('topic') ?? url.searchParams.get('type');
	const idQuery = url.searchParams.get('id') ?? url.searchParams.get('data.id');

	let paymentId = idQuery;

	if (!paymentId) {
		const body = await request.json().catch(() => null);
		if (body?.type === 'payment' || body?.action?.startsWith('payment')) {
			paymentId = body?.data?.id ?? null;
		}
	}

	// Si la notificación no es de un pago, la ignoramos respondiendo 200 igual
	// (para que Mercado Pago no siga reintentando).
	if ((topic && topic !== 'payment') || !paymentId) {
		return json({ recibido: true });
	}

	try {
		const pago = await obtenerPago(String(paymentId));
		const externalReference = pago.external_reference;
		if (!externalReference) {
			return json({ recibido: true });
		}

		const reserva = buscarPorReferenciaExterna(externalReference);
		if (!reserva) {
			console.warn('Webhook: no se encontró la reserva', externalReference);
			return json({ recibido: true });
		}

		// Si ya estaba marcada como pagada, no repetimos el correo/whatsapp
		// (Mercado Pago puede reenviar la misma notificación varias veces).
		if (reserva.estado === 'pagado') {
			return json({ recibido: true });
		}

		if (pago.status === 'approved') {
			marcarPagoReserva(reserva.id, 'pagado', String(paymentId));
			const reservaActualizada: Reserva = { ...reserva, estado: 'pagado', mp_payment_id: String(paymentId) };

			// Enviamos el correo y el WhatsApp en paralelo. Si alguno falla, lo registramos
			// en el log pero no rompemos la respuesta al webhook (el pago ya quedó guardado).
			const resultados = await Promise.allSettled([
				enviarCorreoConfirmacion(reservaActualizada),
				enviarWhatsappDueña(reservaActualizada)
			]);
			resultados.forEach((r) => {
				if (r.status === 'rejected') {
					console.error('Error enviando notificación de reserva pagada:', r.reason);
				}
			});
		} else if (pago.status === 'rejected') {
			marcarPagoReserva(reserva.id, 'fallido', String(paymentId));
		}
		// Otros estados (in_process, pending) los dejamos como están; el webhook volverá a llamar
		// cuando cambie el estado definitivo.

		return json({ recibido: true });
	} catch (err) {
		console.error('Error procesando webhook de Mercado Pago:', err);
		// Igual respondemos 200 para que Mercado Pago no entre en un loop de reintentos
		// por un error nuestro; el log nos permite revisar manualmente.
		return json({ recibido: true });
	}
};
