#!/usr/bin/env node
/**
 * LA COMPUERTA ANTI-DERIVA.
 *
 * Rechaza dos cosas en el código de una superficie:
 *   1. color crudo — hex, `rgb()`, `hsl()` — fuera de `tokens.css`;
 *   2. clases de las paletas por defecto de Tailwind (`slate`, `gray`, `zinc`,
 *      `emerald`, `sky`, `amber`…), que es la forma que tomó la deriva en
 *      `facturas-py`: 79 `border-slate-200` conviviendo con 52
 *      `border-gray-300`, y ni uno solo de la marca.
 *
 * SE ADOPTA POR PIN. Cualquier repo que pinee `@suynda/ui` la corre sobre su
 * propio código:
 *
 *     node node_modules/@suynda/ui/scripts/compuerta.mjs src app components
 *
 * Sale con código 1 y nombra archivo, línea y el texto ofensor. Sin argumentos
 * revisa el propio paquete.
 *
 * LAS EXCEPCIONES SE NOMBRAN, NUNCA SE INFIEREN. Una excepción anónima es una
 * deriva con permiso.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

/**
 * Marcas de dominio: color del MUNDO REAL, que el canon §B.1.1 protege de
 * aplanarse. La tapa de un tubo de suero es amarilla porque el tubo ES
 * amarillo, y el azul de LinkedIn es el azul de LinkedIn.
 *
 * Para agregar una excepción hay que escribir POR QUÉ. El texto entra al
 * mensaje de error, así que el próximo que la lea sabe si sigue valiendo.
 */
export const EXCEPCIONES = [
  { patron: /--tubo-|\.tube-/, razon: "tapa real de un tubo (canon §B.1.1)" },
  { patron: /chip-canal__punto|--canal-/, razon: "color propio de la plataforma del canal" },
  { patron: /data-marca-dominio/, razon: "marcado explícito de marca de dominio" },
];

const PALETAS_TAILWIND =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const REGLAS = [
  {
    nombre: "color crudo",
    // hex de 3, 4, 6 u 8 dígitos
    patron: /#[0-9a-fA-F]{3,8}\b/g,
    ayuda: "usá un token de tokens.css; si es color del mundo real, nombralo como excepción",
  },
  {
    nombre: "color crudo",
    patron: /\b(?:rgb|rgba|hsl|hsla)\(/g,
    ayuda: "usá un token de tokens.css",
  },
  {
    nombre: "paleta por defecto de Tailwind",
    patron: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(?:${PALETAS_TAILWIND})-\\d{2,3}\\b`, "g"),
    ayuda: "la marca no vive en la paleta de Tailwind; usá los tokens",
  },
];

const EXTENSIONES = new Set([".css", ".ts", ".tsx", ".js", ".jsx", ".astro", ".html", ".svelte", ".vue"]);
const IGNORAR = new Set(["node_modules", ".git", "dist", "build", ".next", ".astro", "fuentes"]);

/**
 * `tokens.css` es EL lugar donde el color crudo es legítimo: ahí se define.
 * `tokens.ts` es su gemelo GENERADO, y un test prueba que es byte a byte el
 * mismo archivo — revisarlo sería revisar dos veces el mismo texto.
 */
const esFuenteDeTokens = (ruta) => /tokens\.(css|ts)$/.test(ruta);

function archivos(raiz) {
  const salida = [];
  const caminar = (dir) => {
    for (const entrada of readdirSync(dir)) {
      if (IGNORAR.has(entrada)) continue;
      const ruta = join(dir, entrada);
      if (statSync(ruta).isDirectory()) caminar(ruta);
      else if (EXTENSIONES.has(extname(ruta))) salida.push(ruta);
    }
  };
  const s = statSync(raiz);
  if (s.isDirectory()) caminar(raiz);
  else if (EXTENSIONES.has(extname(raiz))) salida.push(raiz);
  return salida;
}

/** Los comentarios no pintan nada: un hex citado en una explicación no es deriva. */
function sinComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
}

export function revisar(rutas, { raiz = process.cwd() } = {}) {
  const hallazgos = [];
  for (const objetivo of rutas) {
    for (const archivo of archivos(objetivo)) {
      if (esFuenteDeTokens(archivo)) continue;
      const crudo = readFileSync(archivo, "utf8");
      const limpio = sinComentarios(crudo);
      const lineas = limpio.split("\n");
      lineas.forEach((linea, i) => {
        const excepcion = EXCEPCIONES.find((e) => e.patron.test(linea));
        for (const regla of REGLAS) {
          regla.patron.lastIndex = 0;
          let m;
          while ((m = regla.patron.exec(linea)) !== null) {
            if (excepcion) continue;
            hallazgos.push({
              archivo: relative(raiz, archivo).split(sep).join("/"),
              linea: i + 1,
              texto: m[0],
              regla: regla.nombre,
              ayuda: regla.ayuda,
            });
          }
        }
      });
    }
  }
  return hallazgos;
}

const esCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(sep).join("/"));
if (esCli) {
  const rutas = process.argv.slice(2);
  const objetivos = rutas.length ? rutas : ["src", "catalogo"];
  const hallazgos = revisar(objetivos);
  if (hallazgos.length === 0) {
    process.stdout.write(`compuerta @suynda/ui: sin deriva en ${objetivos.join(", ")}\n`);
    process.exit(0);
  }
  process.stderr.write(`compuerta @suynda/ui: ${hallazgos.length} hallazgo(s) de deriva\n\n`);
  for (const h of hallazgos) {
    process.stderr.write(`  ${h.archivo}:${h.linea}  ${h.texto}  — ${h.regla}\n    ${h.ayuda}\n`);
  }
  process.stderr.write(
    `\nSi alguno es color del MUNDO REAL (una tapa de tubo, el color de un canal),\n` +
      `agregalo a EXCEPCIONES en scripts/compuerta.mjs CON SU RAZÓN escrita.\n`,
  );
  process.exit(1);
}
