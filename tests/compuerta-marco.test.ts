/**
 * LA COMPUERTA DEL MARCO, probada en las DOS direcciones.
 *
 * Una compuerta sólo vale si se la ve ponerse roja. La hermana de esta —el
 * conteo de hexes— pasó semanas en verde mientras el marco se duplicaba,
 * porque nadie le plantó nunca lo que debía atrapar.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { revisar, SELECTORES_DEL_MARCO } from "../scripts/compuerta-marco.mjs";

/** Un consumidor de prueba: un directorio con los archivos que se le den. */
function consumidor(archivos: Record<string, string>): { raiz: string; borrar: () => void } {
  const raiz = mkdtempSync(path.join(tmpdir(), "consumidor-"));
  for (const [relativo, contenido] of Object.entries(archivos)) {
    const completo = path.join(raiz, relativo);
    mkdirSync(path.dirname(completo), { recursive: true });
    writeFileSync(completo, contenido, "utf8");
  }
  return { raiz, borrar: () => rmSync(raiz, { recursive: true, force: true }) };
}

test("compuerta del marco: una regla de marco PLANTADA se ve", () => {
  const c = consumidor({
    "src/pantalla.css": [
      ".tarjeta-de-paciente { padding: 12px; }",
      ".riel__item { padding: 20px; }",
      ".otra-cosa { color: red; }",
    ].join("\n"),
  });
  try {
    const hallazgos = revisar(["src"], c.raiz);
    assert.equal(hallazgos.length, 1, "la regla plantada no se vio");
    assert.equal(hallazgos[0]?.selector, "riel");
    assert.equal(hallazgos[0]?.linea, 2, "la línea señalada no es la de la regla");
    assert.match(hallazgos[0]?.archivo ?? "", /pantalla\.css$/);
  } finally {
    c.borrar();
  }
});

test("compuerta del marco: el USO en el marcado NO se persigue", () => {
  const c = consumidor({
    "src/vista.ts": [
      'const html = `<aside class="riel"><a class="riel__item riel__item--activo">x</a></aside>`;',
      'const otro = `<div class="barra-estado"><span class="barra-estado__dato">1</span></div>`;',
      'el.className = "icono-modulo icono-modulo--sobre-riel";',
    ].join("\n"),
  });
  try {
    assert.deepEqual(revisar(["src"], c.raiz), [], "se persiguió el uso, no la definición");
  } finally {
    c.borrar();
  }
});

test("compuerta del marco: agarra la definición en CADA forma en que se escribe", () => {
  const casos: Record<string, string> = {
    "src/a.css": ".riel:hover { width: 300px; }",
    "src/b.astro": "<style>\n.franja__wordmark { font-size: 40px; }\n</style>",
    "src/c.ts": "const css = `\n  .shell__cuerpo { display: block; }\n`;",
    "src/d.css": ".shell > .riel { order: 9; }",
    "src/e.css": ".tabs .tab--activa { color: hotpink; }",
    "src/f.css": ".menu-avatar__salir { display: none; }",
    "src/g.css": ".main { padding: 0; }",
  };
  for (const [archivo, contenido] of Object.entries(casos)) {
    const c = consumidor({ [archivo]: contenido });
    try {
      const hallazgos = revisar(["src"], c.raiz);
      assert.equal(hallazgos.length, 1, `«${contenido.trim()}» se escapó`);
    } finally {
      c.borrar();
    }
  }
});

test("compuerta del marco: un comentario que NOMBRA un selector no es una regla", () => {
  const c = consumidor({
    "src/nota.css": [
      "/* El .riel { } lo declara el paquete, no nosotros. */",
      "// .franja { height: 54px } vive en @suynda/ui",
      " * y `.barra-estado__dato {` está allá también",
      ".mi-clase { color: var(--tinta); }",
    ].join("\n"),
  });
  try {
    assert.deepEqual(revisar(["src"], c.raiz), [], "confundió una mención con una definición");
  } finally {
    c.borrar();
  }
});

/**
 * EL SELLO NO PUEDE TENER ÍTEMS INVISIBLES.
 *
 * Si un selector se cuenta entre los que hay que sacar y no está en la lista,
 * es una regla que sobrevive al cero. Este test recorre la lista entera y
 * exige que cada entrada, plantada como regla, se vea.
 */
test("compuerta del marco: TODOS los selectores declarados se ven, uno por uno", () => {
  for (const base of SELECTORES_DEL_MARCO) {
    const c = consumidor({ "src/x.css": `.${base} { color: var(--tinta); }` });
    try {
      const hallazgos = revisar(["src"], c.raiz);
      assert.equal(hallazgos.length, 1, `«.${base}» está en la lista y no se ve`);
      assert.equal(hallazgos[0]?.selector, base);
    } finally {
      c.borrar();
    }
  }
});

/**
 * EL FALSO POSITIVO QUE LA COMPUERTA SE HIZO A SÍ MISMA.
 *
 * En su primera corrida contra Lab marcó `querySelectorAll("… .glifo")
 * .forEach(function (g) {` como si fuera una regla: un selector adentro de una
 * cadena, seguido de la llave de un callback. Una compuerta que grita de más
 * enseña a ignorarla, así que este caso queda clavado.
 */
test("compuerta del marco: un selector adentro de una CADENA no es una regla", () => {
  const c = consumidor({
    "src/js.ts": [
      'riel.querySelectorAll("[data-riel-modulos] .glifo").forEach(function (g) {',
      "  g.className = 'glifo glifo--sin-dibujo';",
      "});",
      'document.querySelector(".barra-estado")?.remove();',
      'if (el.matches(".riel__item--activo")) { hacerAlgo(); }',
    ].join(String.fromCharCode(10)),
  });
  try {
    assert.deepEqual(revisar(["src"], c.raiz), [], "confundió un uso en cadena con una definición");
  } finally {
    c.borrar();
  }
});

test("compuerta del marco: un `:not()` de CSS SÍ es una regla", () => {
  const c = consumidor({
    "src/x.css": ".riel__item:not(.riel__item--activo) { opacity: 0.5; }",
  });
  try {
    assert.equal(revisar(["src"], c.raiz).length, 1, "un :not() de CSS se escapó");
  } finally {
    c.borrar();
  }
});

test("compuerta del marco: un consumidor limpio da CERO", () => {
  const c = consumidor({
    "src/pantalla.css": ".analisis-item { border: 1px solid var(--linea); }",
    "src/vista.ts": 'const x = `<div class="riel__item">usa, no define</div>`;',
  });
  try {
    assert.deepEqual(revisar(["src"], c.raiz), []);
  } finally {
    c.borrar();
  }
});

test("compuerta del marco: no mira node_modules ni dist", () => {
  const c = consumidor({
    "src/node_modules/@suynda/ui/src/piezas.css": ".riel { width: 60px; }",
    "src/dist/bundle.css": ".franja { height: 54px; }",
    "src/propio.css": ".mio { color: var(--tinta); }",
  });
  try {
    assert.deepEqual(revisar(["src"], c.raiz), [], "revisó lo que el consumidor no escribió");
  } finally {
    c.borrar();
  }
});
