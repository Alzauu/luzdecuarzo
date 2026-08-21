<script lang="ts">
</script>

<svelte:head>
  <title>Reserva pendiente | Luz de Cuarzo</title>
</svelte:head>

<section class="flex min-h-[70vh] flex-col items-center justify-center bg-base-100 px-6 text-center">
  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/90">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
  <h1 class="font-display mb-2 text-2xl font-bold text-verde-profundo md:text-3xl">
    Tu pago está en proceso
  </h1>
  <p class="max-w-md text-texto-suave">
    Mercado Pago todavía está confirmando tu pago (esto pasa con algunos medios como
    transferencia bancaria). Apenas se confirme, te enviaremos el correo con los
    detalles de tu reserva. No es necesario que vuelvas a intentarlo.
  </p>
  <a href="/" class="btn mt-8 rounded-full bg-salvia text-crema hover:bg-salvia-oscuro">
    Volver al inicio
  </a>
</section>
