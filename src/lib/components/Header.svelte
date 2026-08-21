<script lang="ts">
  const enlaces = [
    { href: '#servicios', texto: 'Servicios' },
    { href: '#resenas', texto: 'Reseñas' },
    { href: '#ubicacion', texto: 'Ubicación' },
    { href: '/reservas', texto: 'Reservas' }
  ];

  let menuAbierto = $state(false);

  function cerrarMenu() {
    menuAbierto = false;
  }
</script>

<header class="navbar sticky top-0 z-50 bg-salvia-oscuro px-4 md:px-8">
  <div class="navbar-start">
    <a href="/" class="flex items-center gap-2">
      <img src="/logo.jpg" alt="Logo Luz de Cuarzo" class="h-10 w-10 rounded-full object-cover" />
      <span class="font-display text-lg font-bold text-crema">Luz de Cuarzo</span>
    </a>
  </div>

  <nav class="navbar-center hidden lg:flex">
    <ul class="flex items-center gap-8 text-sm text-niebla">
      {#each enlaces as enlace}
        <li>
          <a href={enlace.href} class="transition-colors hover:text-crema">{enlace.texto}</a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="navbar-end gap-2">
    <a href="/reservas" class="btn btn-sm hidden rounded-full border-none bg-salvia text-verde-profundo hover:bg-salvia/80 md:inline-flex">
      Reservar
    </a>

    <button
      type="button"
      onclick={() => (menuAbierto = !menuAbierto)}
      class="btn btn-ghost btn-square text-crema lg:hidden"
      aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={menuAbierto}
    >
      {#if menuAbierto}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Panel del menú móvil: anclado directamente al header (que ya es "sticky", por lo
       tanto es un elemento posicionado y sirve de referencia), en vez de depender del
       sistema dropdown/dropdown-content de DaisyUI, que en Safari de iPhone puede
       renderizarse fuera de lugar. -->
  {#if menuAbierto}
    <div class="absolute inset-x-0 top-full z-50 border-t border-salvia/30 bg-salvia-oscuro p-3 shadow-lg lg:hidden">
      <ul class="menu menu-sm gap-1">
        {#each enlaces as enlace}
          <li><a href={enlace.href} onclick={cerrarMenu} class="text-niebla hover:text-crema">{enlace.texto}</a></li>
        {/each}
        <li class="mt-1">
          <a href="/reservas" onclick={cerrarMenu} class="rounded-full bg-salvia text-center font-semibold text-verde-profundo hover:bg-salvia/80">Reservar</a>
        </li>
      </ul>
    </div>
  {/if}
</header>