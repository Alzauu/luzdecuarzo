<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const servicios = [
    {
      titulo: 'Jacuzzi',
      texto: 'Inmersión relajante que alivia tensiones musculares y calma la mente.',
      icono: 'M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05Z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97'
    },
    {
      titulo: 'Masaje con piedras calientes',
      texto: 'Técnica ancestral que combina calor y presión para una relajación profunda.',
      icono: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z'
    },
    {
      titulo: 'Camas de cuarzo',
      texto: 'Terapia con cristales de cuarzo para equilibrar cuerpo y energía.',
      icono: 'm12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z'
    }
  ];
</script>

<section id="servicios" class="bg-base-100 bg-texture py-16 md:py-20">
  <div class="mx-auto max-w-4xl px-6">
    <div class="mb-10 text-center" data-reveal use:reveal>
      <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-salvia-oscuro">Nuestros rituales</p>
      <h2 class="font-display text-2xl font-bold md:text-3xl">Nuestros servicios</h2>
      <p class="mt-2 text-sm text-texto-suave">Experiencias de bienestar para cada visita</p>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {#each servicios as servicio, i}
        <div
          class="card group border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-salvia hover:shadow-lg hover:shadow-salvia/20"
          data-reveal
          use:reveal
          style="transition-delay: {i * 100}ms"
        >
          <div class="card-body items-center text-center">
            <div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-salvia to-salvia-oscuro transition-transform duration-300 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-crema" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path d={servicio.icono} />
              </svg>
            </div>
            <h3 class="card-title text-base transition-colors duration-300 group-hover:text-salvia-oscuro">{servicio.titulo}</h3>
            <p class="text-sm text-texto-suave">{servicio.texto}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>