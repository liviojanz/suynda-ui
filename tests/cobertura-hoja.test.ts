/**
 * La hoja es el objeto de la firma del fundador. Si el CSS gana una pieza y
 * la hoja no se entera, se firma un aspecto que no es el que se entrega.
 *
 * Este test ata las tres caras: el CSS declara los códigos B.2-NN en sus
 * comentarios, y la hoja y el catálogo tienen que mostrarlos todos.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (...p: string[]) => readFileSync(join(raiz, ...p), "utf8");

const codigos = (texto: string): string[] => [
  ...new Set(texto.match(/B\.2-\d{2}c?/g) ?? []),
];

const enCss = codigos(leer("src", "piezas.css")).sort();
const enHoja = codigos(leer("catalogo", "hoja.html")).sort();
const enMd = codigos(leer("docs", "hoja-de-especificacion.md")).sort();
const enCatalogo = codigos(leer("catalogo", "index.html")).sort();

/** 21 del canon §B.2 + 6 de la review por capturas del 31-ago. */
const PIEZAS = 27;

test(`el CSS declara las ${PIEZAS} piezas`, () => {
  const numeradas = enCss.filter((c) => !c.endsWith("c"));
  assert.equal(
    numeradas.length,
    PIEZAS,
    `piezas.css declara ${numeradas.length} códigos y deberían ser ${PIEZAS}: ${numeradas.join(", ")}`,
  );
  // La numeración no puede tener huecos: un hueco es una pieza que se cayó
  // sin que nadie lo note, y los códigos se citan por número.
  for (let i = 1; i <= PIEZAS; i += 1) {
    const cod = `B.2-${String(i).padStart(2, "0")}`;
    assert.ok(numeradas.includes(cod), `falta ${cod} en piezas.css`);
  }
});

test("la hoja renderizada muestra todas las piezas del CSS", () => {
  const faltan = enCss.filter((c) => !enHoja.includes(c));
  assert.deepEqual(
    faltan,
    [],
    `catalogo/hoja.html no muestra ${faltan.join(", ")} — se firmaría un aspecto incompleto`,
  );
});

test("el MD citable cubre todas las piezas del CSS", () => {
  const faltan = enCss.filter((c) => !enMd.includes(c));
  assert.deepEqual(faltan, [], `docs/hoja-de-especificacion.md no documenta ${faltan.join(", ")}`);
});

test("el catálogo navegable cubre todas las piezas numeradas", () => {
  const faltan = enCss.filter((c) => !c.endsWith("c") && !enCatalogo.includes(c));
  assert.deepEqual(faltan, [], `catalogo/index.html no muestra ${faltan.join(", ")}`);
});

test("el bloque de compuertas es lo último del CSS", () => {
  // Se agregaron las piezas 22-27 DESPUÉS del bloque de compuertas y el gate
  // de 44px quedó apagado para todas ellas: `.tilde` medía 36 y la regla que
  // decía 44 estaba más arriba en el archivo, así que perdía por orden.
  //
  // No es un error de valor, es de posición — y por eso no se ve leyendo la
  // regla. Este test lo agarra.
  const css = leer("src", "piezas.css");
  const compuertas = css.indexOf("Compuertas heredadas de UI-1");
  assert.ok(compuertas > 0, "no se encontró el bloque de compuertas");
  const ultimaPieza = css.lastIndexOf("/* ---- B.2-");
  assert.ok(
    compuertas > ultimaPieza,
    "el bloque de compuertas quedó ANTES de alguna pieza: las reglas de esa " +
      "pieza ganan por orden y el mínimo táctil de 44px no se aplica",
  );
});

test("el punto de quiebre del marco está acotado a pantalla", () => {
  // Sin `screen and`, el bloque de 860px también aplica al IMPRIMIR: la caja
  // de página de una A4 mide ~779px CSS. El riel de cualquier producto salía
  // impreso como barra inferior, con las etiquetas debajo de los íconos.
  //
  // Se encontró porque la hoja imprimió su propia muestra de "reposo, sólo
  // íconos" mostrando exactamente lo contrario.
  const css = leer("src", "piezas.css");
  assert.match(
    css,
    /@media screen and \(max-width: 860px\)/,
    "el bloque de 860px tiene que ser `screen and`: el papel no tiene pulgar",
  );
  assert.doesNotMatch(
    css,
    /@media \(max-width: 860px\)/,
    "quedó un bloque de 860px sin acotar a pantalla",
  );
});

test("la hoja y el catálogo enlazan el CSS REAL, no una copia", () => {
  // La regla que sostiene todo: si la hoja pudiera divergir del paquete, la
  // hoja no sirve. Se prueba mirando que enlacen los archivos del paquete y
  // que no tengan reglas de pieza propias.
  for (const archivo of ["hoja.html", "index.html"] as const) {
    const html = leer("catalogo", archivo);
    assert.match(html, /href="\.\.\/src\/tokens\.css"/, `${archivo} no enlaza tokens.css`);
    assert.match(html, /href="\.\.\/src\/piezas\.css"/, `${archivo} no enlaza piezas.css`);
    // Ninguna clase de pieza puede redefinirse en el <style> local.
    const local = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
    for (const clase of [".pildora", ".boton", ".campo__control", ".riel__item", ".metrica"]) {
      assert.doesNotMatch(
        local,
        new RegExp(`\\${clase}[^{]*\\{`),
        `${archivo} redefine ${clase} en su propio <style> — la muestra dejaría de ser la del paquete`,
      );
    }
  }
});
