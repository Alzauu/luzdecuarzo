<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
  let { children } = $props();

  // Usa la View Transitions API nativa del navegador (Chrome/Edge; en Safari/Firefox
  // simplemente navega normal, sin error, ya que "startViewTransition" no existe ahí).
  // Esto evita el "flash" de la página sin transición: el navegador anima directamente
  // entre una captura exacta del antes y el después, en vez de que Svelte tenga que
  // renderizar todo primero y animar después.
  onNavigate((navegacion) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navegacion.complete;
      });
    });
  });
</script>

{@render children()}