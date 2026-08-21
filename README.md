# Luz de Cuarzo — Centro de Relajación

Sitio web construido con **SvelteKit + TailwindCSS + daisyUI**, paleta de colores "sauna y bruma".

## Requisitos

- Node.js 18 o superior
- pnpm (`npm install -g pnpm` si no lo tienes)

## Instalación

```bash
pnpm install
```

## Desarrollo local

```bash
pnpm dev
```

Abre el navegador en `http://localhost:5173`.

## Compilar para producción

```bash
pnpm build
pnpm preview   # para revisar el build antes de publicarlo
```

## Estructura del proyecto

```
src/
├── app.html                 → HTML base
├── app.css                  → Tailwind + daisyUI
├── routes/
│   ├── +layout.svelte       → layout raíz (importa app.css)
│   └── +page.svelte         → ensambla la página principal
└── lib/components/
    ├── Header.svelte        → navbar
    ├── Hero.svelte          → "Centro de relajación" + carrusel de imágenes
    ├── Services.svelte      → servicios (tinajas, piedras calientes, cuarzo)
    ├── MapSection.svelte    → sección con el mapa de Google
    ├── Reservas.svelte      → llamado a la acción de reservas
    └── Footer.svelte

static/
└── logo.jpg                 → logo de Luz de Cuarzo
```

## Pendientes para dejarlo 100% listo

1. **Mapa de Google:** abre `src/lib/components/MapSection.svelte` y reemplaza el valor de `mapaSrc` por el `src` real que te entrega Google Maps:
   - Busca tu dirección en Google Maps
   - Clic en **Compartir → Insertar un mapa**
   - Copia el link que aparece dentro de `src="..."` y pégalo en `mapaSrc`

2. **Imágenes reales:** en `Hero.svelte`, cada `.carousel-item` tiene un ícono de placeholder. Reemplázalo por `<img src="/tu-foto.jpg" alt="..." class="h-64 w-full object-cover md:h-80" />` cuando tengas las fotos reales (colócalas en la carpeta `static/`).

3. **WhatsApp y correo:** en `Reservas.svelte`, actualiza el número de WhatsApp y el correo de contacto con los datos reales del centro.
