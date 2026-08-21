import { env } from '$env/dynamic/private';
import type { Reserva } from './db';
import { getServicio } from '$lib/servicios';

// URL base de la API oficial de Meta (WhatsApp Business Cloud API).
// v20.0 es la versión vigente al momento de escribir esto; Meta suele mantener
// versiones anteriores funcionando por un buen tiempo, pero conviene revisarla cada tanto.
const GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

function formatearPrecio(precio: number): string {
	return precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

/**
 * Envía un WhatsApp a la dueña avisando de una nueva reserva pagada.
 *
 * IMPORTANTE sobre cómo funciona la API oficial de Meta:
 * Los mensajes que el NEGOCIO inicia (como este, avisando de una reserva) deben usar
 * una "plantilla de mensaje" (message template) previamente creada y aprobada en
 * Meta Business Manager. No se puede mandar texto libre a menos que la dueña le
 * haya escrito primero al número de WhatsApp Business dentro de las últimas 24 horas.
 *
 * Este código asume que ya creaste una plantilla llamada "nueva_reserva" con 4
 * variables de texto en ese orden: {{1}} nombre, {{2}} servicio, {{3}} fecha, {{4}} hora.
 * Te explico cómo crearla paso a paso en la guía final.
 */
export async function enviarWhatsappDueña(reserva: Reserva): Promise<void> {
	const token = env.WHATSAPP_TOKEN;
	const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
	const numeroDueña = env.WHATSAPP_NUMERO_DUEÑA;
	const nombrePlantilla = env.WHATSAPP_PLANTILLA_NOMBRE ?? 'nueva_reserva';

	if (!token || !phoneNumberId || !numeroDueña) {
		console.warn('WhatsApp no configurado (faltan variables de entorno), se omite el envío.');
		return;
	}

	const servicio = getServicio(reserva.servicio_id);
	const precioFormateado = formatearPrecio(reserva.precio);

	const respuesta = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			messaging_product: 'whatsapp',
			to: numeroDueña,
			type: 'template',
			template: {
				name: nombrePlantilla,
				language: { code: 'es' },
				components: [
					{
						type: 'body',
						parameters: [
							{ type: 'text', text: reserva.nombre },
							{ type: 'text', text: servicio?.nombre ?? reserva.servicio_id },
							{ type: 'text', text: reserva.fecha },
							{ type: 'text', text: `${reserva.hora} hrs (${precioFormateado})` }
						]
					}
				]
			}
		})
	});

	if (!respuesta.ok) {
		const detalle = await respuesta.text();
		throw new Error(`Meta WhatsApp API respondió ${respuesta.status}: ${detalle}`);
	}
}
