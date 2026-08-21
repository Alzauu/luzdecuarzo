<script lang="ts">
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<div class="min-h-screen bg-crema">
	{#if $page.url.pathname !== '/admin/login'}
		<header class="border-b border-madera-borde bg-white px-4 py-4 md:px-6">
			<div class="mx-auto flex max-w-6xl items-center justify-between">
				<span class="font-display text-lg font-bold text-verde-profundo">
					Panel · Luz de Cuarzo
				</span>
				<form method="POST" action="/admin/logout">
					<button
						class="btn btn-sm rounded-full border-none bg-base-200 text-verde-profundo hover:bg-base-300"
					>
						Cerrar sesión
					</button>
				</form>
			</div>
		</header>
	{/if}

	{@render children()}
</div>
