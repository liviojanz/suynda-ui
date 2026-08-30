/**
 * El gemelo string tiene que ser BYTE A BYTE el archivo .css.
 *
 * Es la única prueba de la sub-corrida A, y es la que importa: cuatro
 * superficies consumen la capa 0 por dos caminos distintos —archivo y
 * string—, y si los dos caminos pueden divergir, el sistema tiene dos
 * verdades y ninguna manda.
 *
 * Se lo vio fallar antes de creerle (regla 12): se mutó un token en el .css
 * sin regenerar, dio rojo nombrando el token, y recién ahí se restauró.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { TOKENS_CSS } from "../src/tokens.js";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const archivo = readFileSync(join(raiz, "src", "tokens.css"), "utf8");

test("el gemelo string es byte a byte el tokens.css", () => {
  if (TOKENS_CSS === archivo) return;

  // Un `assert.equal` sobre dos archivos enteros vuelca ochenta líneas por
  // lado y no se lee. Acá el rojo dice la PRIMERA línea que difiere y con
  // qué: es lo único que hace falta para arreglarlo.
  const a = TOKENS_CSS.split("\n");
  const b = archivo.split("\n");
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] !== b[i]) {
      assert.fail(
        `src/tokens.ts quedó desincronizado de src/tokens.css — corré \`npm run generar:tokens\`\n` +
          `  primera diferencia, línea ${i + 1}:\n` +
          `    tokens.ts  → ${JSON.stringify(a[i] ?? "(no existe)")}\n` +
          `    tokens.css → ${JSON.stringify(b[i] ?? "(no existe)")}`,
      );
    }
  }
  assert.fail("difieren en algo que la comparación por líneas no ve");
});

test("la capa 0 declara los 17 colores del canon §A.1", () => {
  const esperados = [
    "--amarillo",
    "--tinta",
    "--tinta-suave",
    "--muted",
    "--papel",
    "--card",
    "--linea",
    "--riel",
    "--riel-hover",
    "--verde",
    "--verde-bg",
    "--rojo",
    "--rojo-bg",
    "--ambar-bg",
    "--ambar-tx",
    "--oro",
    "--ambar",
  ];
  for (const token of esperados) {
    assert.match(
      archivo,
      new RegExp(`^\\s*${token}:`, "m"),
      `falta el token ${token} del canon §A.1`,
    );
  }
});

test("ningún token murió y volvió: --coral y --mist no existen", () => {
  // §A.1: --coral muere ahora (cero usos), --mist muere con el re-vestido de
  // marketing. El paquete nace sin ellos, y este test es el que lo mantiene.
  assert.doesNotMatch(archivo, /--coral\s*:/, "--coral no entra al canon");
  assert.doesNotMatch(archivo, /--mist\s*:/, "--mist no entra al canon");
});

test("los alias en inglés no entran al paquete", () => {
  // --ink, --yellow, --gold y --amber viven en el hub y se retiran en UI-4-C.
  // El paquete nace sin ellos: un alias es la misma cosa dos veces.
  for (const alias of ["--ink", "--yellow", "--gold"]) {
    assert.doesNotMatch(
      archivo,
      new RegExp(`${alias}\\s*:`),
      `${alias} es un alias en inglés — el paquete nace sin ellos`,
    );
  }
});
