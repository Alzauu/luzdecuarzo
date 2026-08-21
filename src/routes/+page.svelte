<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Services from '$lib/components/Services.svelte';
  import Resenas from '$lib/components/Resenas.svelte';
  import MapSection from '$lib/components/MapSection.svelte';
  import Reservas from '$lib/components/Reservas.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Luz de Cuarzo | Centro de Relajación</title>
  <meta
    name="description"
    content="Centro de relajación Luz de Cuarzo: jacuzzi, masaje con piedras calientes y camas de cuarzo."
  />
</svelte:head>

<Header />
<Hero />
<Services />
<Resenas />
<MapSection />
<Reservas />
<Footer />