<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  // Reemplaza este src por el enlace "insertar mapa" de Google Maps con tu dirección exacta:
  // 1. Busca tu dirección en Google Maps
  // 2. Clic en "Compartir" → pestaña "Insertar un mapa"
  // 3. Copia solo el valor del atributo src del iframe que te entrega y pégalo abajo
  const mapaSrc =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3458.764279685066!2d-71.2171171!3d-29.899891999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691cbb1dad9ca93%3A0x38b09854224571bb!2sCENTRO%20DE%20RELAJACI%C3%93N%20Y%20TERAPIAS%20HOL%C3%8DSTICAS%20%22LUZ%20DE%20CUARZO%22!5e0!3m2!1ses-419!2scl!4v1784605928353!5m2!1ses-419!2scl';

  // Enlace de direcciones (distinto del embed): abre Google Maps con la ruta
  // ya calculada desde la ubicación del visitante. Reemplaza el texto de
  // "destination" por tu dirección exacta si quieres mayor precisión.
  const direccionesHref =
    'https://www.google.com/maps/dir/?api=1&destination=Centro+de+Relajaci%C3%B3n+Luz+de+Cuarzo+La+Serena';
</script>

<section id="ubicacion" class="bg-base-100 bg-texture py-16 md:py-20">
  <div class="mx-auto max-w-4xl px-6">
    <div class="mb-10 text-center" data-reveal use:reveal>
      <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-salvia-oscuro">Visítanos</p>
      <h2 class="font-display text-2xl font-bold md:text-3xl">Dónde estamos</h2>
      <p class="mt-2 text-sm text-texto-suave">Te esperamos en nuestro espacio de bienestar</p>
    </div>

    <div class="relative overflow-hidden rounded-2xl border border-base-300 shadow-sm" data-reveal use:reveal>
      <iframe
        title="Ubicación de Luz de Cuarzo en Google Maps"
        src={mapaSrc}
        width="100%"
        height="380"
        style="border:0;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>

      <!-- Tarjeta flotante con la dirección y acceso directo a direcciones -->
      <div class="absolute right-4 top-4 max-w-[260px] rounded-xl bg-crema/90 p-4 shadow-md backdrop-blur-md sm:right-5 sm:top-5">
        <div class="flex items-start gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-5 w-5 shrink-0 text-salvia-oscuro" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21c-4.5-4.2-7-7.8-7-11a7 7 0 1 1 14 0c0 3.2-2.5 6.8-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <div>
            <p class="font-display text-sm font-bold text-verde-profundo">Luz de Cuarzo</p>
            <p class="text-xs text-texto-suave">A 5 minutos del centro de La Serena</p>
          </div>
        </div>
        <a
          href={direccionesHref}
          target="_blank"
          rel="noopener"
          class="btn btn-xs mt-3 w-full rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo"
        >
          Cómo llegar
        </a>
      </div>
    </div>
  </div>
</section>