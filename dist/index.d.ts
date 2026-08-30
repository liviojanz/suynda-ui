/**
 * @suynda/ui — la capa visual de Suynda.
 *
 * Sub-corrida UI-1-A: sólo la capa 0 (los tokens). CERO piezas todavía; las
 * primitivas entran en UI-1-B, con su hoja de especificación.
 *
 * Lo que este paquete NO hace, y no va a hacer: componentes. Cinco
 * tecnologías consumen esto —Astro, React+Next, React+Vite, y dos capas de
 * strings de TypeScript— y no hay implementación de componente que sirva a
 * las cinco. El paquete manda cómo se ve; cada repo construye sus
 * componentes, delgados, encima de estas clases.
 */
export { TOKENS_CSS } from "./tokens.js";
/** La versión del canon contra la que se generó esta capa. */
export declare const CANON: "docs/congelado-ui.md \u00A7A";
