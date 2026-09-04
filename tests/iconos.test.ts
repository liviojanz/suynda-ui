/**
 * EL JUEGO DE ÍCONOS, ATADO AL MANIFIESTO.
 *
 * La regla es una sola: **toda `key` comercial tiene dibujo**. Y se verifica
 * contra `@suynda/contracts`, no contra una lista escrita acá — una lista a
 * mano se desactualiza el día que nace un módulo, que es exactamente cuando
 * este test tiene que gritar.
 *
 * Lo que un módulo sin dibujo produce hoy, sin este test: el genérico mudo.
 * El hub cablea `{ compra: '🧾', lab: '🧪' }` con `?? '▦'` y once módulos
 * comparten el mismo cuadradito; Visibilidad hace lo mismo con `▣`. Ese bug
 * sobrevivió meses porque un fallback silencioso no se reporta.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MODULES } from "@suynda/contracts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(raiz, "src", "iconos.css"), "utf8");
const comerciales = MODULES.filter((m) => m.clase === "comercial").map((m) => m.key);

/** Las clases `--<key>` que el CSS declara, sin las de utilidad. */
const declaradas = [...new Set(css.match(/\.glifo--([a-z0-9-]+)/g) ?? [])]
  .map((c) => c.replace(".glifo--", ""))
  .filter((c) => c !== "sin-dibujo");

test("toda key comercial tiene su clase en el CSS", () => {
  const sinClase = comerciales.filter((k) => !declaradas.includes(k));
  assert.deepEqual(
    sinClase,
    [],
    `módulos comerciales sin dibujo: ${sinClase.join(", ")}`,
  );
});

test("toda clase del CSS apunta a un archivo que existe", () => {
  const rutas = [...css.matchAll(/mask-image:\s*url\("\.\.\/iconos\/([^"]+)"\)/g)]
    .map((m) => m[1]!);
  assert.ok(rutas.length > 0, "el CSS no referencia ningún archivo");
  const faltantes = [...new Set(rutas)].filter(
    (f) => !existsSync(join(raiz, "iconos", f)),
  );
  assert.deepEqual(faltantes, [], `referenciados y ausentes: ${faltantes.join(", ")}`);
});

test("la hoja de firma pinta con el CSS del paquete, no con una copia", () => {
  const firma = readFileSync(join(raiz, "catalogo", "hoja-iconos.html"), "utf8");
  assert.equal(
    firma.includes("data:image"),
    false,
    "la hoja embebió los dibujos: una copia embebida queda vieja y firma algo que no se entrega",
  );
  for (const hoja of ["tokens.css", "piezas.css", "iconos.css"]) {
    assert.ok(firma.includes(`../src/${hoja}`), `la hoja de firma no carga ${hoja}`);
  }
  // Y usa la CAJA REAL de B.2-27, no una propia.
  assert.ok(firma.includes("icono-modulo"), "la hoja no usa la caja de B.2-27");
});

test("todo archivo de iconos/ está referenciado — nada huérfano", () => {
  const enDisco = readdirSync(join(raiz, "iconos"));
  const huerfanos = enDisco.filter((f) => !css.includes(`iconos/${f}`));
  assert.deepEqual(
    huerfanos,
    [],
    `archivos que nadie usa: ${huerfanos.join(", ")}`,
  );
});

test("la casita del hub existe, y NO es un módulo", () => {
  assert.ok(declaradas.includes("hub"), "falta el glifo del hub");
  assert.equal(
    MODULES.some((m) => m.key === "hub"),
    false,
    "`hub` no debe ser una key del manifiesto: el Hub no es un módulo",
  );
});

test("no hay clases de más: el CSS no declara dibujos que nadie pidió", () => {
  const permitidas = new Set<string>([...comerciales, "hub"]);
  const sobrantes = declaradas.filter((c) => !permitidas.has(c));
  assert.deepEqual(sobrantes, [], `dibujos sin módulo: ${sobrantes.join(", ")}`);
});

test("los seis verticales son PNG y los ocho vectores son SVG", () => {
  // La distinción no es capricho: los verticales son ARTE APROBADO extraído,
  // no dibujos nuestros. Si alguno apareciera como SVG, alguien lo redibujó.
  const verticales = MODULES.filter((m) => m.kind === "vertical").map((m) => m.key);
  for (const k of verticales) {
    assert.ok(
      css.includes(`iconos/${k}.png`),
      `${k} es vertical: su dibujo tiene que ser el PNG extraído, no un redibujo`,
    );
  }
  const horizontales = MODULES.filter((m) => m.kind === "horizontal").map((m) => m.key);
  for (const k of horizontales) {
    assert.ok(css.includes(`iconos/${k}.svg`), `${k} debería ser SVG`);
  }
});

test("el faltante se ve ROTO, nunca genérico", () => {
  assert.ok(css.includes(".glifo--sin-dibujo"), "falta la clase del faltante");
  assert.ok(css.includes("dashed"), "el faltante tiene que ser visiblemente roto");
  assert.ok(
    /content:\s*"\?"/.test(css),
    "el faltante tiene que decir `?`, no quedarse mudo",
  );
});

/**
 * Las tres caras atadas, igual que con las piezas: el CSS declara, la hoja
 * documenta y el catálogo muestra. Si el juego gana un ícono y la hoja no se
 * entera, se firma un aspecto que no es el que se entrega.
 */
test("la hoja y el catálogo muestran las catorce keys", () => {
  const hoja = readFileSync(join(raiz, "docs", "hoja-de-especificacion.md"), "utf8");
  const catalogo = readFileSync(join(raiz, "catalogo", "index.html"), "utf8");
  // La hoja de firma es el OBJETO de la firma del fundador: si el juego gana
  // un ícono y la hoja no se entera, se firma un aspecto que no se entrega.
  const firma = readFileSync(join(raiz, "catalogo", "hoja-iconos.html"), "utf8");
  for (const k of [...comerciales, "hub"]) {
    assert.ok(
      firma.includes(`glifo--${k}`),
      `la hoja de firma no muestra ${k}`,
    );
    assert.ok(hoja.includes(`\`${k}\``), `la hoja no nombra ${k}`);
    assert.ok(catalogo.includes(`glifo--${k}`), `el catálogo no muestra ${k}`);
  }
});
