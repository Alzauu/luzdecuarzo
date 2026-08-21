<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Reserva confirmada | Luz de Cuarzo</title>
</svelte:head>

<section class="flex min-h-[70vh] flex-col items-center justify-center bg-base-100 px-6 text-center">
  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-salvia">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-crema" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <h1 class="font-display mb-2 text-2xl font-bold text-verde-profundo md:text-3xl">
    ¡Tu reserva está confirmada!
  </h1>
  <p class="max-w-md text-texto-suave">
    Te enviamos un correo con todos los detalles de tu reserva
    {#if $page.url.searchParams.get('id')}
      (N° {$page.url.searchParams.get('id')})
    {/if}. Te esperamos en Luz de Cuarzo.
  </p>
  <a href="/" class="btn mt-8 rounded-full bg-salvia text-crema hover:bg-salvia-oscuro">
    Volver al inicio
  </a>
</section>
