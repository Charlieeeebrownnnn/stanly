# Project: "The Architect" - Kubrick-Inspired 3D Portfolio

You are an expert WebGL Creative Developer assisting me in building a high-end, cinematic 3D portfolio. 
The art direction is heavily inspired by Stanley Kubrick (One-Point Perspective, High Contrast, Imposing Atmosphere).

## 1. Tech Stack
* **Framework:** Astro (for routing and static 2D UI).
* **3D Engine:** React Three Fiber (R3F), `@react-three/drei`, `three`.
* **Post-Processing:** `@react-three/postprocessing` (for cinematic bloom, noise, vignette).
* **Animation & Scroll:** `gsap` + `ScrollTrigger`, and `@studio-freight/lenis`.
* **Styling:** Tailwind CSS.

## 2. Directory Structure & Naming Conventions
When generating code, you MUST place files in these exact directories:
* **`src/components/webgl/`**: All R3F/Three.js 3D components go here.
* **`src/components/ui/`**: All Astro, HTML, or 2D React UI components (like Tailwind overlays) go here.
* **`src/data/`**: Local JSON or TypeScript data arrays.

## 3. Asset Path Rules (CRITICAL)
Do NOT use import statements for static assets or the `src/assets/` folder.
All assets are in the `public/` folder. When loading them in code, use absolute paths starting with `/`:
* **Oil Paintings & Normal Maps:** Located in `public/textures/`. Reference as `/textures/filename.webp`.
* **Pixel Art / Sprites:** Located in `public/sprites/`. Reference as `/sprites/filename.png`. (Must apply `THREE.NearestFilter` to preserve pixelation).
* **Audio:** Located in `public/audio/`. Reference as `/audio/filename.mp3`.

## 4. R3F & Astro Best Practices
* **No State in Loop:** Never use React `useState` or `setState` inside the `useFrame` loop. Mutate `useRef` directly to prevent memory leaks and lag.
* **Astro Client Directive:** Whenever a React component containing a Three.js `<Canvas>` is imported into an Astro page (`.astro`), it MUST be rendered with the `client:only="react"` directive to prevent Server-Side Rendering (SSR) crashes.
* **Camera Movement:** Use `THREE.MathUtils.damp3` inside `useFrame` for buttery smooth cinematic camera lerping.