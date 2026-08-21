import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

// Nombre de la cookie de sesión del panel de administrador.
export const COOKIE_SESION = 'admin_session';

// Cuánto dura una sesión antes de que la dueña tenga que volver a ingresar la contraseña.
const DURACION_SESION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días
export const DURACION_SESION_SEGUNDOS = DURACION_SESION_MS / 1000;

// Solo hay una "cuenta" (la dueña del negocio), así que no usamos una tabla de usuarios:
// basta con una contraseña compartida (ADMIN_PASSWORD) y un secreto para firmar la cookie
// de sesión (SESSION_SECRET). Si no defines SESSION_SECRET, usamos ADMIN_PASSWORD como
// secreto de respaldo, pero en producción es mejor tener uno dedicado.
function obtenerSecreto(): string {
	return env.SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

// Compara dos strings sin filtrar información por "timing" (cuánto tarda la comparación),
// que es la forma correcta de comparar contraseñas o firmas.
function compararSeguro(a: string, b: string): boolean {
	const largo = Math.max(a.length, b.length, 1);
	const bufA = Buffer.alloc(largo);
	const bufB = Buffer.alloc(largo);
	bufA.write(a);
	bufB.write(b);
	return a.length === b.length && timingSafeEqual(bufA, bufB);
}

// Revisa si la contraseña ingresada en el formulario de login coincide con ADMIN_PASSWORD.
export function contraseñaValida(intento: string): boolean {
	const real = env.ADMIN_PASSWORD || '';
	if (!real || !intento) return false;
	return compararSeguro(intento, real);
}

function firmar(payload: string): string {
	return createHmac('sha256', obtenerSecreto()).update(payload).digest('hex');
}

// Genera el valor de la cookie de sesión: una fecha de expiración más una firma que
// demuestra que la generamos nosotros (nadie puede fabricar una cookie válida sin
// conocer SESSION_SECRET/ADMIN_PASSWORD).
export function crearValorSesion(): string {
	const expira = Date.now() + DURACION_SESION_MS;
	return `${expira}.${firmar(String(expira))}`;
}

// Verifica que la cookie de sesión sea válida: bien formada, no vencida, y con firma correcta.
export function sesionValida(valorCookie: string | undefined): boolean {
	if (!valorCookie) return false;
	const [expiraStr, firma] = valorCookie.split('.');
	if (!expiraStr || !firma) return false;

	const expira = Number(expiraStr);
	if (!Number.isFinite(expira) || expira < Date.now()) return false;

	return compararSeguro(firmar(expiraStr), firma);
}
