<script lang="ts">
  import { onMount } from 'svelte';

  const slides = [
    { id: 'slide1', titulo: 'Jacuzzi', img: '/tinaja.jpg' },
    { id: 'slide2', titulo: 'Camas de cuarzo', img: '/camas-cuarzo.jpg' },
    { id: 'slide3', titulo: 'Centro de Relajación Luz de Cuarzo', img: '/letrero.jpg' },
    { id: 'slide4', titulo: 'Algo para tomar mientras te relajas', img: '/tragos.jpg' }
  ];

  let carrusel: HTMLDivElement;
  let indiceActual = $state(0);
  const INTERVALO_MS = 4500;

  function irASlide(indice: number) {
    indiceActual = (indice + slides.length) % slides.length;
    const ancho = carrusel.clientWidth;
    carrusel.scrollTo({ left: indiceActual * ancho, behavior: 'smooth' });
  }

  onMount(() => {
    const id = setInterval(() => irASlide(indiceActual + 1), INTERVALO_MS);
    const pausar = () => clearInterval(id);
    carrusel?.addEventListener('mouseenter', pausar);
    return () => clearInterval(id);
  });
</script>

<section class="relative py-14 text-center md:py-20" style="overflow: clip;">
  <!-- Fondo con blur que cambia junto al carrusel -->
  {#each slides as slide, i}
    <div
      class="absolute -inset-6 bg-cover bg-center opacity-0 blur-2xl transition-opacity duration-700 {i === indiceActual ? 'opacity-100' : ''}"
      style="background-image: url({slide.img});"
    ></div>
  {/each}

  <div class="relative mx-auto mb-12 max-w-2xl px-6">
    <div class="rounded-3xl bg-crema/75 px-6 py-8 shadow-sm backdrop-blur-md md:px-10 md:py-10">
      <p class="hero-fade-in mb-2 text-xs font-semibold uppercase tracking-widest text-salvia-oscuro">
        Centro de relajación
      </p>
      <h1 class="hero-fade-in font-display mb-4 text-3xl font-bold leading-tight text-verde-profundo md:text-4xl" style="animation-delay: 120ms">
        Un espacio para desconectar y renovar el cuerpo
      </h1>
      <p class="hero-fade-in mx-auto mb-8 max-w-md text-texto-suave" style="animation-delay: 240ms">
        Jacuzzi, masajes con piedras calientes y camas de cuarzo 
      </p>
      <div class="hero-fade-in flex flex-wrap justify-center gap-4" style="animation-delay: 360ms">
        <a href="#servicios" class="btn rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo">
          Ver servicios
        </a>
        <a href="#reservas" class="btn btn-outline rounded-full border-salvia-oscuro text-salvia-oscuro hover:bg-salvia-oscuro hover:text-crema">
          Reservar hora
        </a>
      </div>
    </div>
  </div>

  <!-- Carrusel de imágenes -->
  <div class="hero-fade-in relative mx-auto max-w-3xl px-6" style="animation-delay: 480ms">
    <div class="relative">
      <div bind:this={carrusel} class="carousel w-full rounded-2xl shadow-md">
        {#each slides as slide}
          <div id={slide.id} class="carousel-item relative w-full">
            <img
              src={slide.img}
              alt={slide.titulo}
              class="h-64 w-full object-cover md:h-80"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-verde-profundo/70 to-transparent p-4">
              <p class="font-display text-sm font-semibold text-crema md:text-base">{slide.titulo}</p>
            </div>
          </div>
        {/each}
      </div>

      <button
        class="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2 border-none bg-verde-profundo/50 text-crema hover:bg-verde-profundo/80"
        aria-label="Imagen anterior"
        onclick={() => irASlide(indiceActual - 1)}
      >
        ❮
      </button>
      <button
        class="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2 border-none bg-verde-profundo/50 text-crema hover:bg-verde-profundo/80"
        aria-label="Imagen siguiente"
        onclick={() => irASlide(indiceActual + 1)}
      >
        ❯
      </button>
    </div>

    <div class="mt-4 flex justify-center gap-2">
      {#each slides as _, i}
        <button
          class="h-2.5 w-2.5 rounded-full transition-colors {i === indiceActual ? 'bg-salvia-oscuro' : 'bg-base-300'}"
          aria-label={`Ir a la imagen ${i + 1}`}
          onclick={() => irASlide(i)}
        ></button>
      {/each}
    </div> 
  </div>
</section>