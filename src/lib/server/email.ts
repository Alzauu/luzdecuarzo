import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import type { Reserva } from './db';
import { getServicio } from '$lib/servicios';

// Dirección física del centro, se incluye en el correo para que el cliente sepa dónde ir.
const DIRECCION_CENTRO = 'Alfalfares, parcela 32, La Serena, Chile 1700000';

// Colores de la marca, los mismos que usa la página web.
const COLOR_VERDE_OSCURO = '#4A5A4C';
const COLOR_VERDE_PROFUNDO = '#2E3A2F';
const COLOR_SALVIA = '#8FA491';
const COLOR_CREMA = '#F7F7F4';
const COLOR_MADERA_CLARA = '#F7F1E6';
const COLOR_MADERA_BORDE = '#D8C7A8';
const COLOR_MADERA_TEXTO = '#8A7455';

function formatearPrecio(precio: number): string {
	return precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function formatearFecha(fecha: string): string {
	const [y, m, d] = fecha.split('-').map(Number);
	const f = new Date(y, m - 1, d);
	return f.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function clienteResend(): Resend {
	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		throw new Error('Falta RESEND_API_KEY en el archivo .env');
	}
	return new Resend(apiKey);
}

// Fila de la tabla de detalles de la reserva.
function filaDetalle(etiqueta: string, valor: string): string {
	return `
		<tr>
			<td style="padding: 10px 0; border-bottom: 1px solid ${COLOR_MADERA_BORDE}; font-size: 14px; color: ${COLOR_MADERA_TEXTO}; white-space: nowrap;">
				${etiqueta}
			</td>
			<td style="padding: 10px 0 10px 16px; border-bottom: 1px solid ${COLOR_MADERA_BORDE}; font-size: 14px; font-weight: 600; color: ${COLOR_VERDE_PROFUNDO}; text-align: right;">
				${valor}
			</td>
		</tr>
	`;
}

// Envía el correo de confirmación al cliente (y copia a la dueña, si EMAIL_DUEÑA está configurado)
// una vez que el pago fue aprobado por Mercado Pago.
export async function enviarCorreoConfirmacion(reserva: Reserva): Promise<void> {
	const servicio = getServicio(reserva.servicio_id);
	const remitente = env.EMAIL_REMITENTE ?? 'onboarding@resend.dev';
	const correoDueña = env.EMAIL_DUEÑA;
	const siteUrl = env.SITE_URL ?? '';
	const logoUrl = `${siteUrl}/logo.jpg`;
	const linkMapa = `https://maps.app.goo.gl/SztyQyZy2CP153Db6`;

	const asunto = `🌿 Reserva #${reserva.id} confirmada — Luz de Cuarzo, ${formatearFecha(reserva.fecha)}`;

	const filas = [
		filaDetalle('N° de reserva', `#${reserva.id}`),
		filaDetalle('Servicio', servicio?.nombre ?? reserva.servicio_id),
		filaDetalle('Fecha', formatearFecha(reserva.fecha)),
		filaDetalle('Hora', `${reserva.hora} hrs · ${reserva.duracion_min / 60} hrs de duración`),
		filaDetalle('Ubicación', DIRECCION_CENTRO),
		filaDetalle('Monto pagado', formatearPrecio(reserva.precio))
	].join('');

	const html = `
		<div style="background-color: ${COLOR_CREMA}; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
			<div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${COLOR_MADERA_BORDE};">

				<!-- Encabezado con logo -->
				<div style="background-color: ${COLOR_VERDE_OSCURO}; padding: 28px 24px; text-align: center;">
					<img src="${logoUrl}" alt="Luz de Cuarzo" width="72" height="72" style="border-radius: 50%; background-color: #ffffff; display: block; margin: 0 auto 12px auto;" />
					<p style="color: ${COLOR_CREMA}; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; opacity: 0.85;">
						Centro de Relajación
					</p>
				</div>

				<!-- Cuerpo -->
				<div style="padding: 28px 24px;">
					<h1 style="color: ${COLOR_VERDE_PROFUNDO}; font-size: 22px; margin: 0 0 12px 0;">
						¡Tu reserva está confirmada! 🌿
					</h1>
					<p style="color: ${COLOR_VERDE_PROFUNDO}; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
						Hola ${reserva.nombre}, ya tenemos todo listo para recibirte. Este es un pequeño espacio
						reservado solo para ti, para desconectarte y regalarte un momento de calma. Aquí están
						los detalles de tu visita:
					</p>

					<table style="width: 100%; border-collapse: collapse; background-color: ${COLOR_MADERA_CLARA}; border: 1px solid ${COLOR_MADERA_BORDE}; border-radius: 12px; padding: 4px 16px;">
						${filas}
					</table>

					<div style="text-align: center; margin: 24px 0 8px 0;">
						<a href="${linkMapa}" style="display: inline-block; background-color: ${COLOR_SALVIA}; color: ${COLOR_VERDE_PROFUNDO}; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 999px;">
							Ver ubicación en el mapa
						</a>
					</div>

					<p style="color: ${COLOR_MADERA_TEXTO}; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
						Te sugerimos llegar unos minutos antes de tu hora para que puedas acomodarte con calma.
						Si necesitas reprogramar o tienes alguna duda, solo hablanos por whatsapp indicandonos el N° de tu reserva y te ayudamos.
					</p>
				</div>

				<!-- Pie -->
				<div style="background-color: ${COLOR_MADERA_CLARA}; padding: 18px 24px; text-align: center; border-top: 1px solid ${COLOR_MADERA_BORDE};">
					<p style="color: ${COLOR_MADERA_TEXTO}; font-size: 12px; margin: 0;">
						Con calma, el equipo de <strong>Luz de Cuarzo</strong> 🌿
					</p>
				</div>
			</div>
		</div>
	`;

	await clienteResend().emails.send({
		from: remitente,
		to: reserva.correo,
		bcc: correoDueña ? [correoDueña] : undefined,
		subject: asunto,
		html
	});
}