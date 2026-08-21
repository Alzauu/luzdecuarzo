import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { COOKIE_SESION, sesionValida } from '$lib/server/auth';

// Protege todo lo que empiece con /admin (excepto la propia página de login):
// sin una cookie de sesión válida, redirige al login.
export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const esRutaAdmin = pathname.startsWith('/admin');
	const esPaginaLogin = pathname === '/admin/login';

	const cookieSesion = event.cookies.get(COOKIE_SESION);
	const estaAutenticada = sesionValida(cookieSesion);

	if (esRutaAdmin && !esPaginaLogin && !estaAutenticada) {
		const destino = `/admin/login?redirigidoDesde=${encodeURIComponent(pathname)}`;
		throw redirect(303, destino);
	}

	// Si ya inició sesión y visita el login directamente, la mandamos al panel.
	if (esPaginaLogin && estaAutenticada && event.request.method === 'GET') {
		throw redirect(303, '/admin');
	}

	return resolve(event);
};
