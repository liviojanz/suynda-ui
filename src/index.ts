/**
 * @suynda/ui — la capa visual de Suynda.
 *
 * Sub-corrida UI-1-A: sólo la capa 0 (los tokens). CERO piezas todavía; las
 * primitivas entran en UI-1-B, con su hoja de especificación.
 *
 * ── LA REGLA VIEJA, Y POR QUÉ CAMBIÓ (v0.3.0, 6-sep-2026) ──────────────────
 *
 * Acá decía: «lo que este paquete NO hace, y no va a hacer: componentes. Cinco
 * tecnologías consumen esto —Astro, React+Next, React+Vite, y dos capas de
 * strings de TypeScript— y no hay implementación de componente que sirva a las
 * cinco. El paquete manda cómo se ve; cada repo construye sus componentes».
 *
 * **El diagnóstico era correcto y la conclusión se quedó corta.** Es verdad que
 * ningún COMPONENTE sirve a las cinco. Lo que se dedujo de ahí —que cada repo
 * construyera lo suyo— produjo exactamente lo que se temía: el hub escribió su
 * shell en `shell.ts` y Lab escribió otro en `marco-script.ts`, dos
 * implementaciones del mismo marco ya divergiendo, y el módulo #3 iba por la
 * tercera.
 *
 * La salida no era un componente: es una **función que recibe un elemento y le
 * cuelga nodos**. DOM puro, sin framework — y por eso sí sirve a las cinco.
 * Eso es `montarMarco`.
 *
 * La doctrina que rige desde ahora, firmada por el fundador:
 *
 *   > El shell vive COMPLETO en @suynda/ui —estructura, medidas y
 *   > comportamiento— y el hub y los módulos lo MONTAN. Ningún repo escribe
 *   > marco propio nunca más.
 *
 * Sigue en pie para todo lo demás: las piezas de contenido son clases, y cada
 * repo arma sus componentes delgados encima. Lo que dejó de ser de cada repo
 * es el MARCO.
 */

export { TOKENS_CSS } from "./tokens.js";
export {
  montarMarco,
  iniciales,
  type OpcionesDelMarco,
  type MarcoMontado,
  type ShellServido,
  type ModuloServido,
  type SaldoServido,
  type TabDelModulo,
  type PieDelRiel,
} from "./marco.js";

/** La versión del canon contra la que se generó esta capa. */
export const CANON = "docs/congelado-ui.md §A" as const;
