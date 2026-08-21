<script lang="ts">
  import { page } from '$app/state';

  let { children } = $props();
</script>

<!-- Se agrega bg-patron para renderizar el patrón de ondas exactamente igual al sitio web -->
<div class="min-h-screen bg-crema bg-patron text-verde-profundo font-sans">
  {#if page.url.pathname !== '/admin/login'}
    <header class="border-b border-madera-borde bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a href="/admin" class="flex items-center gap-2 font-display text-lg font-bold text-verde-profundo">
          <img src="/logo.jpg" alt="Logo Luz de Cuarzo" class="h-8 w-8 rounded-full object-cover" />
          <span>Luz de Cuarzo · Admin</span>
        </a>
        <div class="flex items-center gap-3">
          <a href="/" class="btn btn-ghost btn-xs rounded-full">Ver sitio web</a>
          <form method="POST" action="/admin/logout">
            <button class="btn btn-outline btn-xs rounded-full border-salvia-oscuro text-salvia-oscuro hover:bg-salvia-oscuro hover:text-crema" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  {/if}

  {@render children()}
</div>