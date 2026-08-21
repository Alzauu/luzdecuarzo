// Catálogo central de servicios. Se usa tanto en el formulario (cliente)
// como en el servidor para calcular el precio real (nunca confiar en el precio que manda el navegador).
export type Servicio = {
	id: string;
	nombre: string;
	precio: number; // CLP
	duracionMin: number;
};

export const SERVICIOS: Servicio[] = [
	{ id: 'jacuzzi', nombre: 'Jacuzzi', precio: 10, duracionMin: 180 },
	{ id: 'piedras-calientes', nombre: 'Masaje con piedras calientes', precio: 10000, duracionMin: 180 },
	{ id: 'camas-cuarzo', nombre: 'Camas de cuarzo', precio: 10000, duracionMin: 180 }
];

export function getServicio(id: string): Servicio | undefined {
	return SERVICIOS.find((s) => s.id === id);
}
