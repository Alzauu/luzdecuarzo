<script lang="ts">
  import { reveal } from '$lib/actions/reveal';
</script>

<section id="reservas" class="bg-reservas-texture py-16 text-center md:py-20">
  <div class="mx-auto max-w-md px-6" data-reveal use:reveal>
    <h2 class="font-display mb-3 text-2xl font-bold text-crema md:text-3xl">
      Regálate un momento de calma
    </h2>
    <p class="mb-7 text-sm text-crema/85">
      Elige tu servicio, tu día y tu horario en nuestro calendario de reservas.
    </p>

    <a
      href="/reservas"
      class="btn rounded-full border-none bg-crema px-8 text-verde-profundo hover:bg-white"
    >
      Reserva aquí
    </a>
  </div>
</section>