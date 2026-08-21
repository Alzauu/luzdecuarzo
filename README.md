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

