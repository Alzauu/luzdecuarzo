import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { dev } from '$app/environment';
import { COOKIE_SESION, DURACION_SESION_SEGUNDOS, contraseñaValida, crearValorSesion } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const datos = await request.formData();
		const password = String(datos.get('password') ?? '');

		if (!contraseñaValida(password)) {
			return fail(401, { error: 'Contraseña incorrecta' });
		}

		cookies.set(COOKIE_SESION, crearValorSesion(), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: DURACION_SESION_SEGUNDOS
		});

		const destino = url.searchParams.get('redirigidoDesde') || '/admin';
		// Evitamos redirigir de vuelta al propio login en caso de que venga en el parámetro.
		throw redirect(303, destino.startsWith('/admin/login') ? '/admin' : destino);
	}
};
