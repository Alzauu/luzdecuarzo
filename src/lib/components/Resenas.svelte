<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const resenas = [
    {
      nombre: 'Elizabeth Pérez',
      rol: 'Local Guide · 17 opiniones',
      tiempo: 'Hace 5 meses',
      estrellas: 5,
      texto:
        'La experiencia fue totalmente renovadora. Elegimos un plan grupal que incluía masajes, meditación y jacuzzi. Todo fue perfecto, armonioso y sobre todo acogedor. Lo prefiero mil veces (no tiene nada que envidiar a los spa del valle del Elqui). Su dueña preocupada, amable y siempre dispuesta a entregar un muy buen servicio. Requiere reservación previa.'
    },
    {
      nombre: 'luis salas maturana',
      rol: 'Local Guide · 35 opiniones',
      tiempo: 'Hace 2 años',
      estrellas: 5,
      texto:
        'Es increíble el ambiente familiar, la relajación es total, las camas de cuarzo, la tinaja con agüita muy rica, el masaje estupendo, además de un quincho para diversas actividades. Ah, la atención sobrepasa lo excelente, muy dedicadas y profesional.'
    },
    {
      nombre: 'Hernan',
      rol: 'Local Guide · 45 opiniones',
      tiempo: 'Hace 4 años',
      estrellas: 5,
      texto:
        'Muy lindo y místico el lugar, la atención divina y los masajes espectaculares, muy limpio y sanitizado, espero volver pronto con mi pareja, lo recomiendo 100%.'
    },
    {
      nombre: 'Sebastian Guajardo',
      rol: 'Local Guide · 12 opiniones',
      tiempo: 'Hace 3 meses',
      estrellas: 5,
      texto:
        'Excelente lugar para descansar y relajarse, lo recomiendo sin dudar. Aparte también puedes pedir algo para comer o para beber.'
    },
    {
      nombre: 'Andrea Medrano',
      rol: 'Local Guide · 23 opiniones',
      tiempo: 'Hace 5 años',
      estrellas: 5,
      texto: 'Hermoso lugar, muy limpio y la encargada muy amable.'
    }
  ];

  let carrusel: HTMLDivElement;

  function desplazar(direccion: number) {
    if (!carrusel) return;
    const item = carrusel.querySelector<HTMLElement>('.carousel-item');
    const ancho = item ? item.getBoundingClientRect().width + 20 : carrusel.clientWidth * 0.85;
    carrusel.scrollBy({ left: direccion * ancho, behavior: 'smooth' });
  }
</script>

<section id="resenas" class="bg-niebla bg-texture py-16 md:py-20">
  <div class="mx-auto max-w-5xl px-6">
    <div class="mb-10 text-center" data-reveal use:reveal>
      <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-salvia-oscuro">Lo que dicen de nosotros</p>
      <h2 class="font-display text-2xl font-bold md:text-3xl">Opiniones de nuestros visitantes</h2>
      <p class="mt-2 text-sm text-texto-suave">Reseñas reales de Google Maps</p>
    </div>

    <div data-reveal use:reveal>
      <div bind:this={carrusel} class="carousel w-full gap-5 px-1 pb-2">
        {#each resenas as resena}
          <div class="carousel-item w-[86%] shrink-0 sm:w-[60%] lg:w-[32%]">
            <div class="card h-full border border-base-300 bg-crema shadow-sm">
              <div class="card-body">
                <div class="mb-1 flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-salvia font-display text-sm font-bold text-verde-profundo">
                    {resena.nombre.charAt(0)}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-verde-profundo">{resena.nombre}</p>
                    <p class="text-xs text-texto-suave">{resena.rol}</p>
                  </div>
                </div>

                <div class="mb-1 flex items-center gap-2">
                  <div class="flex text-salvia-oscuro">
                    {#each Array(resena.estrellas) as _}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 0 0-.363 1.118l1.287 3.959c.3.92-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 0 0-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 0 0-.363-1.117L2.063 9.386c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 0 0 .95-.689l1.285-3.958Z" />
                      </svg>
                    {/each}
                  </div>
                  <span class="text-xs text-texto-suave">{resena.tiempo}</span>
                </div>

                <p class="text-sm leading-relaxed text-verde-profundo/90">{resena.texto}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-6 flex justify-center gap-3">
        <button
          class="btn btn-circle btn-sm border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
          aria-label="Reseña anterior"
          onclick={() => desplazar(-1)}
        >
          ❮
        </button>
        <button
          class="btn btn-circle btn-sm border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
          aria-label="Reseña siguiente"
          onclick={() => desplazar(1)}
        >
          ❯
        </button>
      </div>
    </div>
  </div>
</section>