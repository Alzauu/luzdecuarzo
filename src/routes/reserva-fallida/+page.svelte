<script lang="ts">
</script>

<svelte:head>
  <title>Pago no completado | Luz de Cuarzo</title>
</svelte:head>

<section class="flex min-h-[70vh] flex-col items-center justify-center bg-base-100 px-6 text-center">
  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-400/90">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
  <h1 class="font-display mb-2 text-2xl font-bold text-verde-profundo md:text-3xl">
    Tu pago no se pudo completar
  </h1>
  <p class="max-w-md text-texto-suave">
    No te preocupes, no se realizó ningún cobro. Puedes intentar de nuevo desde el
    formulario de reservas, o escribirnos por WhatsApp si prefieres que te ayudemos
    a coordinar directamente.
  </p>
  <div class="mt-8 flex gap-3">
    <a href="/#reservas" class="btn rounded-full bg-salvia text-crema hover:bg-salvia-oscuro">
      Intentar de nuevo
    </a>
    <a href="https://wa.me/56900000000" target="_blank" rel="noopener" class="btn btn-outline rounded-full border-salvia text-salvia-oscuro hover:bg-salvia hover:text-crema">
      Escribir por WhatsApp
    </a>
  </div>
</section>
