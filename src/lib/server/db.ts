import Database from 'better-sqlite3';
import { building } from '$app/environment';
import { SERVICIOS, getServicio, type Servicio } from '$lib/servicios';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Horario del centro: reservas de inicio permitidas entre estas horas.
// Como cada servicio dura 3 horas, la última hora de inicio (18:00) termina a las 21:00.
export const HORA_APERTURA = '10:00';
export const HORA_ULTIMO_INICIO = '18:00';
const DURACION_MIN = 180; // 3 horas, igual para todos los servicios por ahora
const EXPIRACION_PENDIENTE_MIN = 20; // minutos que tiene el cliente para pagar antes de liberar el cupo

// Ruta del archivo de base de datos. En producción, asegúrate de que la carpeta
// "data/" esté en un disco persistente (no funciona en hosting serverless tipo Vercel).
const DB_PATH = process.env.DATABASE_PATH ?? 'data/reservas.db';

// `building` es true durante `vite build` (SvelteKit prerenderiza), evitamos abrir el archivo ahí.
// Nos aseguramos de que la carpeta que contiene el archivo .db exista (better-sqlite3 no la crea sola).
if (!building) {
	const carpeta = dirname(DB_PATH);
	if (carpeta && !existsSync(carpeta)) {
		mkdirSync(carpeta, { recursive: true });
	}
}
const db = building ? null : new Database(DB_PATH);

if (db) {
	db.pragma('journal_mode = WAL');
	db.exec(`
		CREATE TABLE IF NOT EXISTS reservas (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			correo TEXT NOT NULL,
			telefono TEXT NOT NULL,
			servicio_id TEXT NOT NULL,
			fecha TEXT NOT NULL,          -- formato YYYY-MM-DD
			hora TEXT NOT NULL,           -- formato HH:MM (hora de inicio)
			duracion_min INTEGER NOT NULL,
			precio INTEGER NOT NULL,
			estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | pagado | fallido | cancelado | expirado
			mp_preference_id TEXT,
			mp_payment_id TEXT,
			creado_en TEXT NOT NULL DEFAULT (datetime('now'))
		);
	`);
}

export type Reserva = {
	id: number;
	nombre: string;
	correo: string;
	telefono: string;
	servicio_id: string;
	fecha: string;
	hora: string;
	duracion_min: number;
	precio: number;
	estado: 'pendiente' | 'pagado' | 'fallido' | 'cancelado' | 'expirado';
	mp_preference_id: string | null;
	mp_payment_id: string | null;
	creado_en: string;
};

function toMinutes(hhmm: string): number {
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
}

// Valida que la hora esté dentro del horario de atención (10:00 a 18:00 de inicio).
export function horaEnRangoValido(hora: string): boolean {
	const min = toMinutes(hora);
	return min >= toMinutes(HORA_APERTURA) && min <= toMinutes(HORA_ULTIMO_INICIO);
}

// Marca como "expirado" cualquier reserva que lleve pendiente (sin pagar) más de
// EXPIRACION_PENDIENTE_MIN minutos, liberando así el cupo automáticamente.
// Se ejecuta cada vez que se consulta disponibilidad o se crea una reserva nueva,
// así no necesitamos un proceso aparte (cron) corriendo en segundo plano.
export function expirarReservasPendientesAntiguas(): void {
	if (!db) return;
	db.prepare(
		`UPDATE reservas
		 SET estado = 'expirado'
		 WHERE estado = 'pendiente'
		   AND datetime(creado_en, '+${EXPIRACION_PENDIENTE_MIN} minutes') < datetime('now')`
	).run();
}

// Revisa si ya existe una reserva (pagada o pendiente reciente) que se superponga
// en fecha + horario para el mismo servicio, para no doblar el cupo.
export function horarioDisponible(
	servicioId: string,
	fecha: string,
	hora: string,
	excluirId?: number
): boolean {
	if (!db) return true;
	expirarReservasPendientesAntiguas();

	const nuevoInicio = toMinutes(hora);
	const nuevoFin = nuevoInicio + DURACION_MIN;

	const existentes = db
		.prepare(
			`SELECT id, hora, duracion_min FROM reservas
			 WHERE servicio_id = ? AND fecha = ? AND estado IN ('pendiente', 'pagado')`
		)
		.all(servicioId, fecha) as { id: number; hora: string; duracion_min: number }[];

	for (const r of existentes) {
		if (excluirId && r.id === excluirId) continue;
		const inicio = toMinutes(r.hora);
		const fin = inicio + r.duracion_min;
		const seSuperpone = nuevoInicio < fin && nuevoFin > inicio;
		if (seSuperpone) return false;
	}
	return true;
}

type NuevaReserva = {
	nombre: string;
	correo: string;
	telefono: string;
	servicio: Servicio;
	fecha: string;
	hora: string;
};

export function crearReservaPendiente(datos: NuevaReserva): Reserva {
	if (!db) throw new Error('Base de datos no disponible');
	const info = db
		.prepare(
			`INSERT INTO reservas (nombre, correo, telefono, servicio_id, fecha, hora, duracion_min, precio, estado)
			 VALUES (@nombre, @correo, @telefono, @servicio_id, @fecha, @hora, @duracion_min, @precio, 'pendiente')`
		)
		.run({
			nombre: datos.nombre,
			correo: datos.correo,
			telefono: datos.telefono,
			servicio_id: datos.servicio.id,
			fecha: datos.fecha,
			hora: datos.hora,
			duracion_min: DURACION_MIN,
			precio: datos.servicio.precio
		});
	return obtenerReservaPorId(info.lastInsertRowid as number)!;
}

export function obtenerReservaPorId(id: number): Reserva | undefined {
	if (!db) return undefined;
	return db.prepare('SELECT * FROM reservas WHERE id = ?').get(id) as Reserva | undefined;
}

export function guardarPreferenceId(id: number, preferenceId: string): void {
	if (!db) return;
	db.prepare('UPDATE reservas SET mp_preference_id = ? WHERE id = ?').run(preferenceId, id);
}

export function marcarPagoReserva(
	id: number,
	estado: 'pagado' | 'fallido',
	paymentId: string
): void {
	if (!db) return;
	db.prepare('UPDATE reservas SET estado = ?, mp_payment_id = ? WHERE id = ?').run(
		estado,
		paymentId,
		id
	);
}

// Busca una reserva a partir del external_reference que le pasamos a Mercado Pago (es el id de la reserva).
export function buscarPorReferenciaExterna(externalReference: string): Reserva | undefined {
	return obtenerReservaPorId(Number(externalReference));
}

// Los horarios de inicio que ofrecemos en el calendario: cada hora en punto,
// desde la apertura hasta la última hora de inicio permitida.
export function horariosCandidatos(): string[] {
	const inicio = toMinutes(HORA_APERTURA);
	const fin = toMinutes(HORA_ULTIMO_INICIO);
	const horarios: string[] = [];
	for (let m = inicio; m <= fin; m += 60) {
		const h = Math.floor(m / 60)
			.toString()
			.padStart(2, '0');
		horarios.push(`${h}:00`);
	}
	return horarios;
}

// De los horarios candidatos, cuáles ya están ocupados (pendientes o pagados)
// para un servicio y fecha específicos. Esto es lo que pinta de rosado el calendario.
export function horariosOcupadosDia(servicioId: string, fecha: string): string[] {
	return horariosCandidatos().filter((hora) => !horarioDisponible(servicioId, fecha, hora));
}

// Formatea una fecha (año, mes 0-indexado, día) a "YYYY-MM-DD".
function formatearFechaISO(anio: number, mesIndex: number, dia: number): string {
	const mm = String(mesIndex + 1).padStart(2, '0');
	const dd = String(dia).padStart(2, '0');
	return `${anio}-${mm}-${dd}`;
}

// Revisa un mes completo y devuelve qué fechas quedan totalmente sin cupo
// (todos los horarios candidatos ocupados) para un servicio, así el calendario
// puede pintar esos días enteros de rosado/rojizo.
export function diasCompletosDelMes(servicioId: string, anio: number, mesIndex: number): string[] {
	const diasEnElMes = new Date(anio, mesIndex + 1, 0).getDate();
	const candidatos = horariosCandidatos();
	const completos: string[] = [];

	for (let dia = 1; dia <= diasEnElMes; dia++) {
		const fecha = formatearFechaISO(anio, mesIndex, dia);
		const ocupados = candidatos.filter((hora) => !horarioDisponible(servicioId, fecha, hora));
		if (ocupados.length === candidatos.length) {
			completos.push(fecha);
		}
	}
	return completos;
}

// --- Funciones para el panel de administrador ---

export type FiltroReservas = {
	estado?: Reserva['estado'];
};

// Lista reservas para el panel de administrador, opcionalmente filtradas por estado.
// Antes de listar, liberamos cupos vencidos para que el panel siempre muestre el estado real.
export function listarReservas(filtro: FiltroReservas = {}): Reserva[] {
	if (!db) return [];
	expirarReservasPendientesAntiguas();

	if (filtro.estado) {
		return db
			.prepare('SELECT * FROM reservas WHERE estado = ? ORDER BY fecha DESC, hora DESC')
			.all(filtro.estado) as Reserva[];
	}
	return db.prepare('SELECT * FROM reservas ORDER BY fecha DESC, hora DESC').all() as Reserva[];
}

type DatosEdicionReserva = {
	nombre: string;
	correo: string;
	telefono: string;
	servicio_id: string;
	fecha: string;
	hora: string;
	estado: Reserva['estado'];
};

// Actualiza todos los campos editables de una reserva desde el panel de administrador.
// El precio se recalcula desde el catálogo de servicios (nunca se edita a mano).
export function actualizarReserva(id: number, datos: DatosEdicionReserva): Reserva | undefined {
	if (!db) return undefined;
	const servicio = getServicio(datos.servicio_id);
	if (!servicio) throw new Error('Servicio inválido');

	db.prepare(
		`UPDATE reservas
		 SET nombre = @nombre, correo = @correo, telefono = @telefono,
		     servicio_id = @servicio_id, fecha = @fecha, hora = @hora,
		     precio = @precio, estado = @estado
		 WHERE id = @id`
	).run({
		id,
		nombre: datos.nombre,
		correo: datos.correo,
		telefono: datos.telefono,
		servicio_id: datos.servicio_id,
		fecha: datos.fecha,
		hora: datos.hora,
		precio: servicio.precio,
		estado: datos.estado
	});
	return obtenerReservaPorId(id);
}

// Elimina una reserva por completo (a diferencia de "cancelado", que solo cambia el estado).
export function eliminarReserva(id: number): void {
	if (!db) return;
	db.prepare('DELETE FROM reservas WHERE id = ?').run(id);
}

type DatosReservaManual = {
	nombre: string;
	correo: string;
	telefono: string;
	servicio: Servicio;
	fecha: string;
	hora: string;
	estado: Reserva['estado'];
};

// Crea una reserva directamente desde el panel de administrador (sin pasar por Mercado Pago),
// por ejemplo para bloquear un horario a mano o registrar un pago recibido en efectivo.
export function crearReservaManual(datos: DatosReservaManual): Reserva {
	if (!db) throw new Error('Base de datos no disponible');
	const info = db
		.prepare(
			`INSERT INTO reservas (nombre, correo, telefono, servicio_id, fecha, hora, duracion_min, precio, estado)
			 VALUES (@nombre, @correo, @telefono, @servicio_id, @fecha, @hora, @duracion_min, @precio, @estado)`
		)
		.run({
			nombre: datos.nombre,
			correo: datos.correo,
			telefono: datos.telefono,
			servicio_id: datos.servicio.id,
			fecha: datos.fecha,
			hora: datos.hora,
			duracion_min: DURACION_MIN,
			precio: datos.servicio.precio,
			estado: datos.estado
		});
	return obtenerReservaPorId(info.lastInsertRowid as number)!;
}

export { SERVICIOS };