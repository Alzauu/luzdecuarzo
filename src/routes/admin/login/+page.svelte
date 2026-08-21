<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Ingreso administrador · Luz de Cuarzo</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-crema px-6">
	<div class="w-full max-w-sm rounded-2xl border border-madera-borde bg-white p-8 shadow-sm">
		<h1 class="font-display mb-1 text-center text-2xl font-bold text-verde-profundo">
			Panel de administración
		</h1>
		<p class="mb-6 text-center text-sm text-texto-suave">Luz de Cuarzo</p>

		<form method="POST" class="flex flex-col gap-4">
			<label class="form-control">
				<span class="label-text mb-1 block text-sm text-texto-suave">Contraseña</span>
				<input
					type="password"
					name="password"
					required
					class="input input-bordered w-full"
				/>
			</label>

			{#if form?.error}
				<p class="text-sm text-error">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="btn mt-2 rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
			>
				Ingresar
			</button>
		</form>
	</div>
</main>
