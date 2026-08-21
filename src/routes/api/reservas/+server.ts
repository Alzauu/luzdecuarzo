import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServicio } from '$lib/servicios';
import {
	crearReservaPendiente,
	horaEnRangoValido,
	horarioDisponible,
	guardarPreferenceId
} from '$lib/server/db';
import { crearPreferenciaPago } from '$lib/server/mercadopago';

// Valida fecha en formato YYYY-MM-DD y que no sea en el pasado.
function fechaValida(fecha: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);
	const [y, m, d] = fecha.split('-').map(Number);
	const fechaReserva = new Date(y, m - 1, d);
	return fechaReserva >= hoy;
}

function horaValidaFormato(hora: string): boolean {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body) {
		throw error(400, 'Cuerpo de la solicitud inválido');
	}

	const { nombre, correo, telefono, servicioId, fecha, hora } = body as Record<string, string>;

	// --- Validaciones básicas de los datos del formulario ---
	if (!nombre || nombre.trim().length < 2) {
		throw error(400, 'El nombre es obligatorio');
	}
	if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
		throw error(400, 'El correo no es válido');
	}
	if (!telefono || telefono.trim().length < 8) {
		throw error(400, 'El teléfono no es válido');
	}
	const servicio = getServicio(servicioId);
	if (!servicio) {
		throw error(400, 'Servicio no válido');
	}
	if (!fechaValida(fecha)) {
		throw error(400, 'Fecha no válida');
	}
	if (!horaValidaFormato(hora) || !horaEnRangoValido(hora)) {
		throw error(400, 'La hora debe estar entre 10:00 y 18:00');
	}

	// --- Revisamos que el horario siga disponible (por si dos personas reservan a la vez) ---
	if (!horarioDisponible(servicio.id, fecha, hora)) {
		throw error(409, 'Ese horario ya no está disponible, por favor elige otro');
	}

	// --- Creamos la reserva como "pendiente" ANTES de mandar a pagar ---
	const reserva = crearReservaPendiente({
		nombre: nombre.trim(),
		correo: correo.trim(),
		telefono: telefono.trim(),
		servicio,
		fecha,
		hora
	});

	// --- Generamos el link de pago en Mercado Pago ---
	try {
		const preferencia = await crearPreferenciaPago(reserva);
		guardarPreferenceId(reserva.id, preferencia.id);
		return json({ initPoint: preferencia.initPoint });
	} catch (err) {
		console.error('Error creando preferencia de Mercado Pago:', err);
		throw error(502, 'No se pudo generar el link de pago. Intenta nuevamente.');
	}
};
