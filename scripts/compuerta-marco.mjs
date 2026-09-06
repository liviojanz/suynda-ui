#!/usr/bin/env node
/**
 * LA COMPUERTA DEL MARCO — «reglas de marco fuera del paquete = 0».
 *
 * ── POR QUÉ EXISTE, que es una historia de una compuerta que mentía ────────
 *
 * La compuerta hermana (`compuerta.mjs`) cuenta **color crudo**: hex, `rgb()`,
 * paletas de Tailwind. Lab la envolvió en un trinquete que sellaba «47
 * hallazgos, sin novedades» y ese verde se leyó como cumplimiento.
 *
 * Pero lo que estaba saliendo mal no era el color. Era la PROPIEDAD: cada vez
 * que Lab necesitaba una pieza del marco que el paquete no tenía, la escribía
 * en su propio `<style>` usando tokens —nunca hexes—, y el trinquete decía
 * «sin novedades». Pasó cuatro veces. Cuando el fundador miró Lab y el hub uno
 * al lado del otro, había dos marcos distintos.
 *
 * **Una compuerta que mide una cosa y se lee como si midiera otra es peor que
 * ninguna**, porque da permiso. Ésta mide lo que importa: quién es dueño del
 * marco.
 *
 * ── LA REGLA ───────────────────────────────────────────────────────────────
 *
 * Ningún repo fuera de este paquete puede DEFINIR una regla CSS sobre un
 * selector del marco. Usarlos en el marcado es exactamente lo que se espera;
 * redefinirlos es escribir un segundo marco.
 *
 * SE ADOPTA POR PIN, igual que la hermana:
 *
 *     node node_modules/@suynda/ui/scripts/compuerta-marco.mjs src app
 *
 * Sale con código 1 y nombra archivo, línea y el selector ofensor.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

/**
 * LOS SELECTORES DEL MARCO.
 *
 * La lista tiene que cubrir TODO lo que el paquete declara del marco: un
 * selector que un consumidor tenga y que no esté acá es una regla que
 * sobrevive al cero sin que nadie la vea.
 *
 * `.main` ENTRA, y la razón se escribe porque no es obvia: es el slot del
 * contenido y parece de la pantalla. No lo es. Lo que declara —la sangría del
 * área, la contención del scroll, el `min-height: 0`— es lo que hace que el
 * riel quede quieto mientras el contenido rueda, y eso es una garantía del
 * marco. Lo que la pantalla decide vive ADENTRO del slot, con clases propias.
 */
export const SELECTORES_DEL_MARCO = [
  "shell",
  "marco-columna",
  "main",
  "franja",
  "riel",
  "tabs",
  "tab",
  "barra-estado",
  "menu-avatar",
  "icono-modulo",
  "glifo",
  "esqueleto",
];

const EXTENSIONES = new Set([".css", ".ts", ".tsx", ".js", ".jsx", ".astro", ".svelte", ".vue"]);
const IGNORADOS = new Set(["node_modules", "dist", ".git", ".astro", "build", "coverage"]);

/**
 * Reconoce una DEFINICIÓN de regla, no un uso.
 *
 * `class="riel__item"` en el marcado es el uso esperado y no se toca. Lo que
 * se persigue es `.riel__item {` — un selector seguido de una llave de
 * apertura, que es la forma de todas las reglas CSS, estén en un `.css`, en un
 * `<style>` de Astro o en un template literal de TypeScript.
 */
function reglaDeMarco(linea) {
  // SE BORRAN LAS CADENAS ANTES DE MIRAR, y la razón la encontró la propia
  // compuerta al correrse por primera vez contra Lab: marcó como regla la
  // línea `querySelectorAll("[data-riel-modulos] .glifo").forEach(function (g) {`
  // — un selector adentro de una cadena, seguido de la llave de un callback.
  //
  // Un selector adentro de una cadena es un USO (se lo busca, se lo asigna a
  // un `className`), jamás una definición. Borrar las cadenas lo distingue sin
  // perder los `:not(...)` de CSS, que sí son definiciones y que una regla más
  // gruesa —prohibir paréntesis— habría dejado escapar.
  const sinCadenas = linea.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
  for (const base of SELECTORES_DEL_MARCO) {
    // El selector, con sus modificadores y elementos BEM, seguido de lo que
    // sea que no cierre la regla, y una llave. Cubre `.riel {`,
    // `.riel__item--activo {`, `.riel:hover {`, `.tabs .tab {`,
    // `.shell > .riel {` y `.riel__item, .tab {`.
    const patron = new RegExp(String.raw`\.${base}(__[\w-]+)?(--[\w-]+)?[^{;}]*\{`);
    if (patron.test(sinCadenas)) return base;
  }
  return null;
}

function* archivos(raiz) {
  let entradas;
  try {
    entradas = readdirSync(raiz);
  } catch {
    return;
  }
  for (const entrada of entradas) {
    if (IGNORADOS.has(entrada)) continue;
    const completo = join(raiz, entrada);
    if (statSync(completo).isDirectory()) yield* archivos(completo);
    else if (EXTENSIONES.has(extname(entrada))) yield completo;
  }
}

export function revisar(raices, cwd = process.cwd()) {
  const hallazgos = [];
  for (const raiz of raices) {
    for (const archivo of archivos(join(cwd, raiz))) {
      const lineas = readFileSync(archivo, "utf8").split(/\r?\n/);
      lineas.forEach((linea, i) => {
        // Un comentario que menciona un selector no define nada.
        const limpia = linea.trim();
        if (limpia.startsWith("*") || limpia.startsWith("//") || limpia.startsWith("/*")) return;
        const base = reglaDeMarco(linea);
        if (base) {
          hallazgos.push({
            archivo: relative(cwd, archivo),
            linea: i + 1,
            selector: base,
            texto: limpia.slice(0, 100),
          });
        }
      });
    }
  }
  return hallazgos;
}

function principal() {
  const raices = process.argv.slice(2);
  if (raices.length === 0) {
    console.error("uso: compuerta-marco.mjs <directorio> [...]");
    process.exit(2);
  }
  // ADENTRO DEL PAQUETE NO TIENE SENTIDO, y sin esta guarda devuelve 89
  // hallazgos que parecen un desastre y son exactamente lo contrario: el
  // marco declarado donde debe estar. Un numero asi, sin explicacion, es
  // como una compuerta pierde credibilidad el primer dia.
  try {
    const propio = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    if (propio.name === "@suynda/ui") {
      console.error(
        [
          "compuerta del marco: esto es @suynda/ui. Aca el marco VIVE, no sobra.",
          "La compuerta es para los CONSUMIDORES: se corre desde el repo que",
          "pinea el paquete, sobre su propio codigo.",
        ].join(String.fromCharCode(10)),
      );
      process.exit(2);
    }
  } catch {
    // Sin package.json legible se sigue: puede ser un directorio suelto.
  }
  const hallazgos = revisar(raices);
  for (const h of hallazgos) {
    console.error(`${h.archivo}:${h.linea}: regla de marco «.${h.selector}» fuera del paquete\n    ${h.texto}`);
  }
  if (hallazgos.length > 0) {
    console.error(
      `\ncompuerta del marco: ${hallazgos.length} regla(s) de marco fuera de @suynda/ui.\n` +
        "El marco es del paquete. Si falta una pieza, la corrida se detiene y la\n" +
        "pieza entra al paquete — nunca al <style> del consumidor, ni «por ahora».",
    );
    process.exit(1);
  }
  console.log(`compuerta del marco: 0 reglas de marco en ${raices.join(", ")}`);
}

if (import.meta.filename === process.argv[1]) principal();
