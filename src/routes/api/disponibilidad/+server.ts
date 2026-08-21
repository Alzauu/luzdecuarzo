import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServicio } from '$lib/servicios';
import { horariosOcupadosDia, diasCompletosDelMes, horariosCandidatos } from '$lib/server/db';

// GET /api/disponibilidad?servicioId=jacuzzi&fecha=2026-08-20
//   -> horarios ocupados ese día específico (para pintar los botones de hora).
// GET /api/disponibilidad?servicioId=jacuzzi&mes=2026-08
//   -> fechas completamente sin cupo en ese mes (para pintar el calendario).
// Se puede pedir cualquiera de los dos, o ambos juntos en la misma llamada.
export const GET: RequestHandler = async ({ url }) => {
	const servicioId = url.searchParams.get('servicioId') ?? '';
	const fecha = url.searchParams.get('fecha');
	const mes = url.searchParams.get('mes');

	const servicio = getServicio(servicioId);
	if (!servicio) {
		throw error(400, 'Servicio no válido');
	}

	const respuesta: {
		horarios: string[];
		horariosOcupados?: string[];
		diasCompletos?: string[];
	} = {
		horarios: horariosCandidatos()
	};

	if (fecha) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
			throw error(400, 'Fecha no válida');
		}
		respuesta.horariosOcupados = horariosOcupadosDia(servicio.id, fecha);
	}

	if (mes) {
		if (!/^\d{4}-\d{2}$/.test(mes)) {
			throw error(400, 'Mes no válido, usa el formato YYYY-MM');
		}
		const [anioStr, mesStr] = mes.split('-');
		const anio = Number(anioStr);
		const mesIndex = Number(mesStr) - 1; // JS usa meses 0-indexados internamente
		respuesta.diasCompletos = diasCompletosDelMes(servicio.id, anio, mesIndex);
	}

	return json(respuesta);
};