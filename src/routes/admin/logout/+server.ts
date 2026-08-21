import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COOKIE_SESION } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(COOKIE_SESION, { path: '/' });
	throw redirect(303, '/admin/login');
};
