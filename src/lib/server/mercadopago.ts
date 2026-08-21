import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { env } from '$env/dynamic/private';
import type { Reserva } from './db';
import { getServicio } from '$lib/servicios';

function client() {
	const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
	if (!accessToken) {
		throw new Error('Falta MERCADOPAGO_ACCESS_TOKEN en el archivo .env');
	}
	return new MercadoPagoConfig({ accessToken });
}

// Crea una "preferencia de pago": el link de Mercado Pago Checkout Pro al que
// redirigimos al cliente para que pague. external_reference es el id de la reserva
// en NUESTRA base de datos, así podemos identificarla cuando llegue el webhook.
export async function crearPreferenciaPago(reserva: Reserva): Promise<{ id: string; initPoint: string }> {
	const servicio = getServicio(reserva.servicio_id);
	if (!servicio) throw new Error('Servicio inválido');

	const siteUrl = env.SITE_URL ?? 'http://localhost:5173';
	const preference = new Preference(client());

	const resultado = await preference.create({
		body: {
			items: [
				{
					id: servicio.id,
					title: `${servicio.nombre} - Luz de Cuarzo`,
					description: `Reserva ${reserva.fecha} ${reserva.hora}`,
					quantity: 1,
					unit_price: servicio.precio,
					currency_id: 'CLP'
				}
			],
			payer: {
				name: reserva.nombre,
				email: reserva.correo
			},
			external_reference: String(reserva.id),
			back_urls: {
				success: `${siteUrl}/reserva-exitosa?id=${reserva.id}`,
				pending: `${siteUrl}/reserva-pendiente?id=${reserva.id}`,
				failure: `${siteUrl}/reserva-fallida?id=${reserva.id}`
			},
			auto_return: 'approved',
			notification_url: `${siteUrl}/api/mercadopago/webhook`
		}
	});

	if (!resultado.id || !resultado.init_point) {
		throw new Error('Mercado Pago no devolvió una preferencia válida');
	}

	return { id: resultado.id, initPoint: resultado.init_point };
}

// Consulta el estado real de un pago directamente a la API de Mercado Pago
// (nunca confiamos ciegamente en los datos que vienen en la notificación del webhook).
export async function obtenerPago(paymentId: string) {
	const payment = new Payment(client());
	return payment.get({ id: paymentId });
}
