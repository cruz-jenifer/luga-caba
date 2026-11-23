# Lüga — Plataforma de Inteligencia Inmobiliaria · CABA

> Explorá Buenos Aires cuadra por cuadra. Información clave, sin ruido visual.

Una web app interactiva y visualmente inmersiva construida con **Next.js 15 + React 19**, diseñada para presentar la plataforma **Lüga**: mapa minimalista de la Ciudad Autónoma de Buenos Aires con datos de valor histórico del m², alertas de precio, estilo de vida por barrio, y más.

---

## ✨ Características principales

### 🎭 Animaciones e interactividad

| Efecto | Componente | Tecnología |
|---|---|---|
| Fling con inercia (cards) | `MotionCards` | GSAP InertiaPlugin |
| Transición de página con scribble | `TransitionScribble` | GSAP Timeline |
| Cards de servicio con fan-out elástico | `ServiceCards` | GSAP Elastic |
| Cards en mobile con scroll stack | `ServiceCards` | GSAP ScrollTrigger |
| Dibujo de SVG al scroll | `ServiceCards`, `HorizontalWords` | GSAP stroke animation |
| Barrido con colores aleatorios | `TransitionScribble` | GSAP Timeline |
| Stickers con push de proximidad | `Footer` | GSAP Elastic |
| Stickers con pop-up al scroll | `Footer` | GSAP ScrollTrigger |
| Credits pop-out / collapse | `Footer` | GSAP Timeline |
| Cursor bubble personalizado | `CursorBubble` | GSAP quickTo |
| Mute bubble (video hero) | `VimeoHero` | GSAP quickTo |
| Wiggle por hover | `Navbar`, `Footer` | GSAP steps(1) yoyo |
| Scroll horizontal + bounce de letras | `HorizontalWords` | GSAP ScrollTrigger |
| Smooth scroll inercial | `SmoothScroll` | Lenis + GSAP ticker |
| Cambio de título en tab inactivo | `SmoothScroll` | Visibility API |
| Marquee infinito con logos | `DoubleMarquee` | CSS Keyframes |
| Overlay de degradado horizontal | `Showreel` | CSS linear-gradient |

### 🏗️ Arquitectura

- **React Component Architecture** — cada sección es un componente aislado y limpio.
- **Modular CSS** — 11 hojas de estilo parciales importadas desde un único `globals.css`.
- **Assets SVG externos** — SVGs decorativos organizados en carpetas temáticas.
- **Data centralizada** — todos los datos estáticos en `lib/data.js` como exports ES Module.
- **Assets auto-hospedados** — fuentes, logos, stickers y SVGs servidos localmente, sin dependencia de CDNs externos.

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 15** | Framework React, App Router, file-based routing |
| **React 19** | Arquitectura de UI basada en componentes |
| **Vanilla CSS** | Sistema de diseño completo vía CSS Variables — sin Tailwind |
| **GSAP + ScrollTrigger + InertiaPlugin** | Animaciones, efectos de scroll y física de inercia |
| **Lenis** | Smooth scroll ultra-suave sincronizado con GSAP |

---

## 📦 Estructura del proyecto

```text
luga3/
├── app/
│   ├── styles/
│   │   ├── base.css             # Fuentes, variables CSS, reset, body/html
│   │   ├── navbar.css           # Navbar, logo, header hero
│   │   ├── hero.css             # Título principal + underline SVG animado
│   │   ├── vimeo-hero.css       # Video hero + headline
│   │   ├── motion-cards.css     # Sección de motion cards + labels flotantes
│   │   ├── showreel.css         # Sección showreel con overlay de degradado
│   │   ├── cards.css            # Service cards, stickers
│   │   ├── marquee.css          # Double marquee + animaciones CSS
│   │   ├── footer.css           # Footer, credits, stickers, socials
│   │   ├── cursor.css           # Custom cursor bubble + scribble overlay
│   │   ├── horizontal-words.css # Scroll horizontal de letras
│   │   └── responsive.css       # Media queries (tablet + mobile)
│   ├── globals.css              # Entry point — importa todos los parciales
│   ├── layout.jsx               # Root layout — <html>, metadata, favicon
│   └── page.jsx                 # Página principal — ensambla todos los componentes
│
├── components/
│   ├── CursorBubble.jsx         # Cursor bubble personalizado con tracking GSAP
│   ├── DoubleMarquee.jsx        # Marquee de logos randomizado + SVGs al scroll
│   ├── Footer.jsx               # Footer — créditos, stickers, redes, wiggles
│   ├── HorizontalWords.jsx      # Scroll horizontal con bounce elástico de letras
│   ├── MotionCards.jsx          # Motion cards + labels flotantes + fling de inercia
│   ├── Navbar.jsx               # Navbar fija + lógica de color al scroll + wiggle
│   ├── ServiceCards.jsx         # Sección de cards de servicio (5 categorías)
│   ├── Showreel.jsx             # Sección showreel con imagen y overlay
│   ├── SmoothScroll.jsx         # Init Lenis + sync GSAP ticker (renderiza null)
│   ├── SvgSymbols.jsx           # Definiciones SVG <symbol> (bullet, card-divider)
│   ├── TransitionScribble.jsx   # Máscara de scribble a pantalla completa al click
│   └── VimeoHero.jsx            # Hero de video — controles, mute bubble, headline
│
├── lib/
│   └── data.js                  # Todos los datos estáticos como exports ES Module
│
├── public/
│   ├── assets/
│   │   ├── Brand Logos SVG/     # Logos de marcas para el marquee
│   │   ├── Card-Sticker SVG/    # Stickers sobre las service cards
│   │   ├── Cursor SVG/          # Estados del cursor personalizado
│   │   ├── Footer-Sticker SVG/  # Stickers decorativos del footer
│   │   ├── Marquee-blob SVG/    # Blob + mano en sección marquee
│   │   ├── MotionCard SVG/      # Blob azul + underline ondulado
│   │   ├── Navbar SVG/          # Blob de navbar + ícono work
│   │   └── VimeoHero SVG/       # Smiley, estrella, underline oval, mute blob
│   └── fonts/
│       ├── DMSans-VariableFont_opsz,wght.ttf
│       └── Epilogue-VariableFont_wght.ttf
│
├── .gitignore
├── jsconfig.json                # Alias de imports @/
├── next.config.mjs              # Config de Next.js con alias @/ via webpack
├── package.json
└── README.md
```

---

## 📊 `lib/data.js` — Data centralizada

| Export | Descripción |
|---|---|
| `brands[]` | Logos de barrios porteños para el marquee |
| `colors[]` | Pool de colores de fondo para el marquee |
| `SOCIAL_ICONS[]` | LinkedIn, Instagram, TikTok — href + SVG markup |
| `CARDS_DATA[]` | 5 cards de servicio con color, sticker, título y lista |
| `WIGGLE_CONFIG` | Fuente única de verdad para intensidades de wiggle por hover |
| `ANIMATION_CONFIG` | Timing y stroke width de la transición scribble |

---

## 🎲 Lógica de randomización del marquee

El componente `DoubleMarquee.jsx` implementa dos helpers:

- **`shuffleNoAdjacentSrc(brands)`** — Fisher-Yates shuffle con post-procesado para garantizar que no haya dos logos iguales consecutivos, **incluyendo la costura del loop**.
- **`assignColorsNoAdjacent(count, colors)`** — Asigna colores de fondo uno a uno, siempre excluyendo el color anterior (y el primero en el último ítem, para cerrar el loop sin repetición).

---

## 🎨 Arquitectura SVG

| Estrategia | Usado para | Por qué |
|---|---|---|
| SVG externo + `<img>` | Logos, stickers, blobs decorativos | Componentes limpios; ideal para shapes grandes no reutilizados |
| Inline `<symbol>` + `<use>` | Íconos repetidos (`bullet-icon`, `card-divider`) | Definidos una vez en `SvgSymbols.jsx`, reutilizados N veces; soportan `currentColor` |
| Inline `<svg>` | Paths animados (mapa, íconos de control) | Necesario para animaciones `stroke-dasharray` y rendering con estado React |

---

## ⚙️ Instalación y desarrollo

Requiere **Node.js 18+**.

```bash
# 1. Clonar el repositorio
git clone https://github.com/cruz-jenifer/luga3.git
cd luga3

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000

# 4. Build de producción
npm run build
npm start
```

---

## 🗺️ Secciones de la página

| Sección | Componente | Descripción |
|---|---|---|
| **Hero Video** | `VimeoHero` | Video hero con mute bubble y headline animado |
| **Scroll Horizontal** | `HorizontalWords` | Letras y stickers que bouncean al entrar en viewport |
| **Motion Cards** | `MotionCards` | Cards con fling de inercia y labels flotantes |
| **Showreel** | `Showreel` | Imagen de CABA con overlay de degradado horizontal |
| **Service Cards** | `ServiceCards` | 5 categorías de servicios con fan-out elástico |
| **Marquee** | `DoubleMarquee` | Logos de barrios con scroll infinito randomizado |
| **Footer** | `Footer` | Créditos, stickers reactivos, redes sociales |

---

## 📄 Licencia

Proyecto de portafolio y producto en desarrollo. Los assets de marca pertenecen a sus respectivos dueños.
