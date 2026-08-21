<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const ESTADOS: { valor: string; etiqueta: string }[] = [
		{ valor: 'pendiente', etiqueta: 'Pendiente' },
		{ valor: 'pagado', etiqueta: 'Pagado' },
		{ valor: 'fallido', etiqueta: 'Fallido' },
		{ valor: 'cancelado', etiqueta: 'Cancelado' },
		{ valor: 'expirado', etiqueta: 'Expirado' }
	];

	type FilaReserva = PageData['reservas'][number];

	let dialogoAbierto = $state(false);
	let modoEdicion = $state(false);
	let guardando = $state(false);
	let errorFormulario = $state('');

	let idEnEdicion = $state<number | null>(null);
	let nombre = $state('');
	let correo = $state('');
	let telefono = $state('');
	let servicioId = $state('');
	let fecha = $state('');
	let hora = $state('10:00');
	let estado = $state('pagado');

	function formatearPrecio(precio: number): string {
		return precio.toLocaleString('es-CL', {
			style: 'currency',
			currency: 'CLP',
			maximumFractionDigits: 0
		});
	}

	function nombreServicio(idServicio: string): string {
		return data.servicios.find((s) => s.id === idServicio)?.nombre ?? idServicio;
	}

	function claseBadge(valorEstado: string): string {
		if (valorEstado === 'pagado') return 'badge-success';
		if (valorEstado === 'pendiente') return 'badge-warning';
		if (valorEstado === 'fallido' || valorEstado === 'cancelado') return 'badge-error';
		return 'badge-ghost';
	}

	function abrirCrear() {
		modoEdicion = false;
		idEnEdicion = null;
		nombre = '';
		correo = '';
		telefono = '';
		servicioId = data.servicios[0]?.id ?? '';
		fecha = '';
		hora = '10:00';
		estado = 'pagado';
		errorFormulario = '';
		dialogoAbierto = true;
	}

	function abrirEditar(r: FilaReserva) {
		modoEdicion = true;
		idEnEdicion = r.id;
		nombre = r.nombre;
		correo = r.correo;
		telefono = r.telefono;
		servicioId = r.servicio_id;
		fecha = r.fecha;
		hora = r.hora;
		estado = r.estado;
		errorFormulario = '';
		dialogoAbierto = true;
	}

	function cerrarDialogo() {
		dialogoAbierto = false;
	}

	function cambiarFiltro(nuevoEstado: string) {
		const params = new URLSearchParams();
		if (nuevoEstado) params.set('estado', nuevoEstado);
		const query = params.toString();
		goto(query ? `/admin?${query}` : '/admin', { keepFocus: true });
	}
</script>

<svelte:head>
	<title>Reservas · Panel administrador</title>
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-8 md:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="font-display text-2xl font-bold text-verde-profundo md:text-3xl">Reservas</h1>
			<p class="text-sm text-texto-suave">{data.reservas.length} reserva(s)</p>
		</div>
		<button
			class="btn rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
			onclick={abrirCrear}
		>
			+ Nueva reserva
		</button>
	</div>

	<div class="mb-4 flex flex-wrap gap-2">
		<button
			class="btn btn-sm rounded-full {data.filtroEstado === ''
				? 'border-none bg-salvia-oscuro text-crema'
				: 'btn-outline'}"
			onclick={() => cambiarFiltro('')}
		>
			Todas
		</button>
		{#each ESTADOS as e (e.valor)}
			<button
				class="btn btn-sm rounded-full {data.filtroEstado === e.valor
					? 'border-none bg-salvia-oscuro text-crema'
					: 'btn-outline'}"
				onclick={() => cambiarFiltro(e.valor)}
			>
				{e.etiqueta}
			</button>
		{/each}
	</div>

	<div class="overflow-x-auto rounded-2xl border border-madera-borde bg-white">
		<table class="table">
			<thead>
				<tr class="text-texto-suave">
					<th>Cliente</th>
					<th>Servicio</th>
					<th>Fecha</th>
					<th>Hora</th>
					<th>Precio</th>
					<th>Estado</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.reservas as r (r.id)}
					<tr>
						<td>
							<div class="font-medium text-verde-profundo">{r.nombre}</div>
							<div class="text-xs text-texto-suave">{r.correo} · {r.telefono}</div>
						</td>
						<td>{nombreServicio(r.servicio_id)}</td>
						<td>{r.fecha}</td>
						<td>{r.hora}</td>
						<td>{formatearPrecio(r.precio)}</td>
						<td>
							<span class="badge {claseBadge(r.estado)}">{r.estado}</span>
						</td>
						<td class="whitespace-nowrap text-right">
							<button class="btn btn-xs btn-outline rounded-full" onclick={() => abrirEditar(r)}>
								Editar
							</button>
							<form
								method="POST"
								action="?/eliminar"
								class="inline"
								use:enhance={({ cancel }) => {
									if (!confirm(`¿Eliminar la reserva de ${r.nombre}? Esta acción no se puede deshacer.`)) {
										cancel();
									}
								}}
							>
								<input type="hidden" name="id" value={r.id} />
								<button class="btn btn-xs btn-outline btn-error ml-1 rounded-full" type="submit">
									Eliminar
								</button>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="py-10 text-center text-texto-suave">
							No hay reservas con este filtro.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

{#if dialogoAbierto}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-verde-profundo/40 px-4"
		role="dialog"
		aria-modal="true"
	>
		<div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
			<h2 class="font-display mb-4 text-xl font-bold text-verde-profundo">
				{modoEdicion ? 'Editar reserva' : 'Nueva reserva'}
			</h2>

			<form
				method="POST"
				action={modoEdicion ? '?/actualizar' : '?/crear'}
				class="flex flex-col gap-3"
				use:enhance={() => {
					guardando = true;
					errorFormulario = '';
					return async ({ result, update }) => {
						guardando = false;
						if (result.type === 'failure') {
							errorFormulario = (result.data?.error as string) ?? 'Ocurrió un error, intenta de nuevo';
							return;
						}
						await update();
						dialogoAbierto = false;
					};
				}}
			>
				{#if modoEdicion}
					<input type="hidden" name="id" value={idEnEdicion} />
				{/if}

				<label class="form-control">
					<span class="label-text mb-1 block text-sm text-texto-suave">Nombre</span>
					<input class="input input-bordered w-full" name="nombre" bind:value={nombre} required />
				</label>

				<label class="form-control">
					<span class="label-text mb-1 block text-sm text-texto-suave">Correo</span>
					<input
						class="input input-bordered w-full"
						type="email"
						name="correo"
						bind:value={correo}
						required
					/>
				</label>

				<label class="form-control">
					<span class="label-text mb-1 block text-sm text-texto-suave">Teléfono</span>
					<input class="input input-bordered w-full" name="telefono" bind:value={telefono} required />
				</label>

				<label class="form-control">
					<span class="label-text mb-1 block text-sm text-texto-suave">Servicio</span>
					<select class="select select-bordered w-full" name="servicio_id" bind:value={servicioId}>
						{#each data.servicios as s (s.id)}
							<option value={s.id}>{s.nombre}</option>
						{/each}
					</select>
				</label>

				<div class="flex gap-3">
					<label class="form-control flex-1">
						<span class="label-text mb-1 block text-sm text-texto-suave">Fecha</span>
						<input
							class="input input-bordered w-full"
							type="date"
							name="fecha"
							bind:value={fecha}
							required
						/>
					</label>
					<label class="form-control flex-1">
						<span class="label-text mb-1 block text-sm text-texto-suave">Hora</span>
						<input
							class="input input-bordered w-full"
							type="time"
							name="hora"
							bind:value={hora}
							required
						/>
					</label>
				</div>
				<p class="-mt-2 text-xs text-texto-suave">Horario de atención: 10:00 a 18:00 (hora de inicio).</p>

				<label class="form-control">
					<span class="label-text mb-1 block text-sm text-texto-suave">Estado</span>
					<select class="select select-bordered w-full" name="estado" bind:value={estado}>
						{#each ESTADOS as e (e.valor)}
							<option value={e.valor}>{e.etiqueta}</option>
						{/each}
					</select>
				</label>

				{#if errorFormulario}
					<p class="text-sm text-error">{errorFormulario}</p>
				{/if}

				<div class="mt-2 flex justify-end gap-2">
					<button type="button" class="btn btn-ghost rounded-full" onclick={cerrarDialogo}>
						Cancelar
					</button>
					<button
						type="submit"
						class="btn rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
						disabled={guardando}
					>
						{guardando ? 'Guardando…' : 'Guardar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
