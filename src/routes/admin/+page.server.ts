import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	listarReservas,
	actualizarReserva,
	eliminarReserva,
	crearReservaManual,
	horarioDisponible,
	horaEnRangoValido,
	type Reserva
} from '$lib/server/db';
import { getServicio, SERVICIOS } from '$lib/servicios';

const ESTADOS_VALIDOS: Reserva['estado'][] = ['pendiente', 'pagado', 'fallido', 'cancelado', 'expirado'];

function horaValidaFormato(hora: string): boolean {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

function fechaValidaFormato(fecha: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}

function correoValido(correo: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Lee y valida los campos comunes del formulario de crear/editar reserva.
// Devuelve un mensaje de error (string) si algo no es válido, o los datos ya limpios.
function leerYValidarDatosReserva(datos: FormData) {
	const nombre = String(datos.get('nombre') ?? '').trim();
	const correo = String(datos.get('correo') ?? '').trim();
	const telefono = String(datos.get('telefono') ?? '').trim();
	const servicioId = String(datos.get('servicio_id') ?? '');
	const fecha = String(datos.get('fecha') ?? '');
	const hora = String(datos.get('hora') ?? '');
	const estado = String(datos.get('estado') ?? '') as Reserva['estado'];

	if (nombre.length < 2) return { error: 'El nombre es obligatorio' } as const;
	if (!correoValido(correo)) return { error: 'El correo no es válido' } as const;
	if (telefono.length < 8) return { error: 'El teléfono no es válido' } as const;
	const servicio = getServicio(servicioId);
	if (!servicio) return { error: 'Servicio no válido' } as const;
	if (!fechaValidaFormato(fecha)) return { error: 'Fecha no válida' } as const;
	if (!horaValidaFormato(hora) || !horaEnRangoValido(hora)) {
		return { error: 'La hora debe estar entre 10:00 y 18:00' } as const;
	}
	if (!ESTADOS_VALIDOS.includes(estado)) return { error: 'Estado no válido' } as const;

	return { nombre, correo, telefono, servicio, fecha, hora, estado } as const;
}

export const load: PageServerLoad = async ({ url }) => {
	const estadoFiltro = url.searchParams.get('estado') ?? '';
	const filtro = ESTADOS_VALIDOS.includes(estadoFiltro as Reserva['estado'])
		? { estado: estadoFiltro as Reserva['estado'] }
		: {};

	return {
		reservas: listarReservas(filtro),
		servicios: SERVICIOS,
		filtroEstado: filtro.estado ?? ''
	};
};

export const actions: Actions = {
	crear: async ({ request }) => {
		const datos = leerYValidarDatosReserva(await request.formData());
		if ('error' in datos) return fail(400, { error: datos.error });

		if (!horarioDisponible(datos.servicio.id, datos.fecha, datos.hora)) {
			return fail(409, { error: 'Ese horario ya está ocupado' });
		}

		crearReservaManual(datos);
		return { exito: true };
	},

	actualizar: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'Reserva no válida' });

		const datos = leerYValidarDatosReserva(formData);
		if ('error' in datos) return fail(400, { error: datos.error });

		if (!horarioDisponible(datos.servicio.id, datos.fecha, datos.hora, id)) {
			return fail(409, { error: 'Ese horario ya está ocupado' });
		}

		actualizarReserva(id, {
			nombre: datos.nombre,
			correo: datos.correo,
			telefono: datos.telefono,
			servicio_id: datos.servicio.id,
			fecha: datos.fecha,
			hora: datos.hora,
			estado: datos.estado
		});
		return { exito: true };
	},

	eliminar: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'Reserva no válida' });

		eliminarReserva(id);
		return { exito: true };
	}
};
