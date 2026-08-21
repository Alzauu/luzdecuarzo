<script lang="ts">
  import { SERVICIOS } from '$lib/servicios';

  const COLOR_OCUPADO = '#B3554A';

  let servicioId = $state(SERVICIOS[0].id);
  let mesVisible = $state(inicioDeMes(new Date()));
  let diasCompletos = $state<string[]>([]);
  let horariosTodos = $state<string[]>([]);
  let horariosOcupados = $state<string[]>([]);
  let fechaSeleccionada = $state('');
  let horaSeleccionada = $state('');
  let cargandoMes = $state(false);
  let cargandoDia = $state(false);

  let nombre = $state('');
  let correo = $state('');
  let telefono = $state('');
  let enviando = $state(false);
  let error = $state('');

  const HOY = new Date();
  HOY.setHours(0, 0, 0, 0);

  function inicioDeMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  function claveMes(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  function fechaISO(anio: number, mesIndex: number, dia: number): string {
    return `${anio}-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  const servicioActual = $derived(SERVICIOS.find((s) => s.id === servicioId)!);

  const celdasDelMes = $derived.by(() => {
    const anio = mesVisible.getFullYear();
    const mesIndex = mesVisible.getMonth();
    const diasEnElMes = new Date(anio, mesIndex + 1, 0).getDate();
    // getDay(): 0 = domingo. Convertimos para que la semana empiece en lunes.
    const primerDiaSemana = (new Date(anio, mesIndex, 1).getDay() + 6) % 7;

    const celdas: { dia: number; fecha: string; pasado: boolean; completo: boolean }[] = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      celdas.push({ dia: 0, fecha: '', pasado: false, completo: false });
    }
    for (let dia = 1; dia <= diasEnElMes; dia++) {
      const fecha = fechaISO(anio, mesIndex, dia);
      const fechaObj = new Date(anio, mesIndex, dia);
      celdas.push({
        dia,
        fecha,
        pasado: fechaObj < HOY,
        completo: diasCompletos.includes(fecha)
      });
    }
    return celdas;
  });

  const mesEsElActual = $derived(claveMes(mesVisible) === claveMes(HOY));

  async function cargarMes() {
    cargandoMes = true;
    try {
      const res = await fetch(`/api/disponibilidad?servicioId=${servicioId}&mes=${claveMes(mesVisible)}`);
      if (!res.ok) return;
      const data = await res.json();
      diasCompletos = data.diasCompletos ?? [];
      horariosTodos = data.horarios ?? horariosTodos;
    } finally {
      cargandoMes = false;
    }
  }

  async function cargarDia(fecha: string) {
    cargandoDia = true;
    try {
      const res = await fetch(`/api/disponibilidad?servicioId=${servicioId}&fecha=${fecha}`);
      if (!res.ok) return;
      const data = await res.json();
      horariosOcupados = data.horariosOcupados ?? [];
      horariosTodos = data.horarios ?? horariosTodos;
    } finally {
      cargandoDia = false;
    }
  }

  $effect(() => {
    servicioId;
    mesVisible;
    fechaSeleccionada = '';
    horaSeleccionada = '';
    cargarMes();
  });

  function cambiarMes(delta: number) {
    const nuevo = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + delta, 1);
    if (nuevo < inicioDeMes(HOY)) return;
    mesVisible = nuevo;
  }

  function elegirDia(celda: { fecha: string; pasado: boolean; completo: boolean; dia: number }) {
    if (celda.dia === 0 || celda.pasado || celda.completo) return;
    fechaSeleccionada = celda.fecha;
    horaSeleccionada = '';
    cargarDia(celda.fecha);
  }

  function horaYaPaso(hora: string): boolean {
    if (fechaSeleccionada !== claveFechaHoy()) return false;
    const [h] = hora.split(':').map(Number);
    return h <= HOY_HORA_ACTUAL;
  }

  function claveFechaHoy(): string {
    return fechaISO(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
  }

  const HOY_HORA_ACTUAL = new Date().getHours();

  function elegirHora(hora: string) {
    if (horariosOcupados.includes(hora) || horaYaPaso(hora)) return;
    horaSeleccionada = hora;
  }

  async function confirmarReserva(evento: SubmitEvent) {
    evento.preventDefault();
    error = '';

    if (!nombre || !correo || !telefono || !fechaSeleccionada || !horaSeleccionada) {
      error = 'Completa tus datos y elige un día y una hora.';
      return;
    }

    enviando = true;
    try {
      const respuesta = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          servicioId,
          fecha: fechaSeleccionada,
          hora: horaSeleccionada
        })
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        error = cuerpo?.message ?? 'No se pudo crear la reserva. Intenta nuevamente.';
        // Si el horario ya no está disponible, refrescamos para que se vea al tiro.
        if (respuesta.status === 409) {
          cargarDia(fechaSeleccionada);
          cargarMes();
          horaSeleccionada = '';
        }
        enviando = false;
        return;
      }

      const { initPoint } = await respuesta.json();
      window.location.href = initPoint;
    } catch {
      error = 'Ocurrió un error de conexión. Intenta nuevamente.';
      enviando = false;
    }
  }

  const NOMBRES_MES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const NOMBRES_DIA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
</script>

<svelte:head>
  <title>Reserva tu hora | Luz de Cuarzo</title>
</svelte:head>

<section class="min-h-screen bg-madera-texture px-4 py-10 md:px-8 md:py-14">
  <div class="mx-auto max-w-3xl">
    <a
      href="/"
      class="inline-flex items-center gap-1 rounded-full border-none bg-salvia-oscuro px-4 py-1.5 text-sm text-crema transition hover:bg-verde-profundo"
    >
      &larr; Volver al inicio
    </a>

    <h1 class="font-display mt-3 text-3xl font-bold text-verde-profundo md:text-4xl">
      Reserva tu hora
    </h1>
    <p class="mt-2 text-verde-profundo/70">
      Elige tu servicio, un día disponible y un horario. Los horarios en
      <span class="font-semibold" style="color: {COLOR_OCUPADO}">rosado</span>
      ya están tomados.
    </p>

    <!-- Selector de servicio -->
    <div class="mt-8 flex flex-wrap gap-2">
      {#each SERVICIOS as servicio}
        <button
          type="button"
          onclick={() => (servicioId = servicio.id)}
          class="btn btn-sm rounded-full {servicioId === servicio.id
            ? 'border-none bg-salvia-oscuro text-crema hover:bg-salvia-oscuro'
            : 'border border-madera-borde bg-madera-clara text-verde-profundo hover:bg-madera-borde/50'}"
        >
          {servicio.nombre} — ${servicio.precio.toLocaleString('es-CL')}
        </button>
      {/each}
    </div>

    <div class="mt-8 grid gap-6 rounded-2xl border border-madera-borde bg-madera-clara p-5 shadow-sm md:grid-cols-[1fr_auto] md:p-7">
      <!-- Calendario -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <button
            type="button"
            onclick={() => cambiarMes(-1)}
            disabled={mesEsElActual}
            class="btn btn-sm btn-circle btn-ghost text-verde-profundo disabled:opacity-30"
            aria-label="Mes anterior"
          >
            &larr;
          </button>
          <span class="font-display text-lg font-semibold capitalize text-verde-profundo">
            {NOMBRES_MES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
          </span>
          <button
            type="button"
            onclick={() => cambiarMes(1)}
            class="btn btn-sm btn-circle btn-ghost text-verde-profundo"
            aria-label="Mes siguiente"
          >
            &rarr;
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-madera-texto">
          {#each NOMBRES_DIA as d}
            <div class="py-1">{d}</div>
          {/each}
        </div>

        <div class="grid grid-cols-7 gap-1" class:opacity-50={cargandoMes}>
          {#each celdasDelMes as celda}
            {#if celda.dia === 0}
              <div></div>
            {:else if celda.pasado}
              <div class="rounded-lg py-2 text-center text-sm text-madera-borde">{celda.dia}</div>
            {:else if celda.completo}
              <button
                type="button"
                disabled
                class="rounded-lg py-2 text-center text-sm font-semibold"
                style="background-color: {COLOR_OCUPADO}22; color: {COLOR_OCUPADO}; cursor: not-allowed;"
                title="Sin cupos disponibles este día"
              >
                {celda.dia}
              </button>
            {:else}
              <button
                type="button"
                onclick={() => elegirDia(celda)}
                class="rounded-lg py-2 text-center text-sm font-semibold transition {fechaSeleccionada ===
                celda.fecha
                  ? 'bg-salvia-oscuro text-crema'
                  : 'text-verde-profundo hover:bg-madera-borde/40'}"
              >
                {celda.dia}
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Horarios del día elegido -->
      <div class="min-w-[220px]">
        {#if !fechaSeleccionada}
          <p class="text-sm text-texto-suave">Elige un día en el calendario para ver los horarios.</p>
        {:else}
          <p class="mb-2 text-sm font-semibold text-verde-profundo">
            Horarios para el {fechaSeleccionada.split('-').reverse().join('/')}
          </p>
          <div class="grid grid-cols-2 gap-2" class:opacity-50={cargandoDia}>
            {#each horariosTodos as hora}
              {@const ocupado = horariosOcupados.includes(hora) || horaYaPaso(hora)}
              <button
                type="button"
                onclick={() => elegirHora(hora)}
                disabled={ocupado}
                class="rounded-lg border py-2 text-sm font-semibold transition {horaSeleccionada === hora
                  ? 'border-salvia-oscuro bg-salvia-oscuro text-crema'
                  : ocupado
                    ? ''
                    : 'border-madera-borde text-verde-profundo hover:bg-madera-borde/40'}"
                style={ocupado
                  ? `background-color: ${COLOR_OCUPADO}22; color: ${COLOR_OCUPADO}; border-color: ${COLOR_OCUPADO}55; cursor: not-allowed;`
                  : ''}
              >
                {hora}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Formulario de datos, solo visible una vez elegido día + hora -->
    {#if fechaSeleccionada && horaSeleccionada}
      <div class="mt-10 rounded-2xl border border-madera-borde bg-madera-clara p-6 shadow-sm md:p-8">
        <h2 class="font-display mb-4 text-xl font-bold text-verde-profundo">Tus datos</h2>
        <p class="mb-4 text-sm text-texto-suave">
          {servicioActual.nombre} · {fechaSeleccionada.split('-').reverse().join('/')} · {horaSeleccionada} hrs ·
          ${servicioActual.precio.toLocaleString('es-CL')}
        </p>

        <form onsubmit={confirmarReserva} class="flex flex-col gap-3">
          <input
            type="text"
            bind:value={nombre}
            required
            placeholder="Nombre completo"
            class="input input-bordered w-full border-salvia/40 bg-salvia/10 text-verde-profundo focus:border-salvia-oscuro"
          />
          <input
            type="email"
            bind:value={correo}
            required
            placeholder="Correo electrónico"
            class="input input-bordered w-full border-salvia/40 bg-salvia/10 text-verde-profundo focus:border-salvia-oscuro"
          />
          <input
            type="tel"
            bind:value={telefono}
            required
            placeholder="Teléfono"
            class="input input-bordered w-full border-salvia/40 bg-salvia/10 text-verde-profundo focus:border-salvia-oscuro"
          />

          {#if error}
            <p class="text-sm font-semibold" style="color: {COLOR_OCUPADO}">{error}</p>
          {/if}

          <button
            type="submit"
            disabled={enviando}
            class="btn mt-2 rounded-full border-none bg-salvia-oscuro text-crema hover:bg-verde-profundo disabled:opacity-60"
          >
            {enviando ? 'Redirigiendo a Mercado Pago…' : 'Reservar y pagar'}
          </button>
        </form>
      </div>
    {/if}
  </div>
</section>