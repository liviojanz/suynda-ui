/**
 * La compuerta anti-deriva, probada sobre el propio paquete y sobre casos
 * plantados a mano.
 *
 * Los casos plantados existen porque un gate que nunca se vio fallar no
 * prueba nada (regla 12): acá el rojo se produce a pedido, en memoria, sin
 * tocar archivos del repo.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { revisar, EXCEPCIONES } from "../scripts/compuerta.mjs";

const conArchivo = (nombre: string, contenido: string, fn: (dir: string) => void) => {
  const dir = mkdtempSync(join(tmpdir(), "compuerta-"));
  try {
    writeFileSync(join(dir, nombre), contenido, "utf8");
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("el paquete pasa su propia compuerta", () => {
  const hallazgos = revisar(["src", "catalogo"]);
  assert.deepEqual(
    hallazgos.map((h) => `${h.archivo}:${h.linea} ${h.texto}`),
    [],
    "el paquete tiene deriva de color",
  );
});

test("rechaza un hex crudo, y dice dónde", () => {
  conArchivo("x.css", ".t { color: #d4d4d8; }\n", (dir) => {
    const h = revisar([dir], { raiz: dir });
    assert.equal(h.length, 1);
    assert.equal(h[0].texto, "#d4d4d8");
    assert.equal(h[0].linea, 1);
    assert.equal(h[0].regla, "color crudo");
  });
});

test("rechaza las clases de la paleta por defecto de Tailwind", () => {
  // La forma exacta que tomó la deriva en facturas-py: 79 border-slate-200
  // conviviendo con 52 border-gray-300, y ni uno de la marca.
  conArchivo("x.tsx", `export const T = () => <div className="border-slate-200 text-gray-500" />;\n`, (dir) => {
    const h = revisar([dir], { raiz: dir });
    assert.equal(h.length, 2);
    assert.deepEqual(h.map((x) => x.texto).sort(), ["border-slate-200", "text-gray-500"]);
  });
});

test("un color citado en un COMENTARIO no es deriva", () => {
  conArchivo("x.css", "/* antes era #EDEEEA y pasó a --linea */\n.t { color: var(--linea); }\n", (dir) => {
    assert.deepEqual(revisar([dir], { raiz: dir }), []);
  });
});

test("las marcas de dominio pasan — y sólo las nombradas", () => {
  // El azul de LinkedIn es el azul de LinkedIn (canon §B.1.1).
  conArchivo("x.html", `<span class="chip-canal__punto" style="background:#0a66c2"></span>\n`, (dir) => {
    assert.deepEqual(revisar([dir], { raiz: dir }), []);
  });
  // Pero un hex cualquiera en otra línea NO se cuela por vecindad.
  conArchivo("y.html", `<span class="chip-canal__punto" style="background:#0a66c2"></span>\n<div style="color:#123456"></div>\n`, (dir) => {
    const h = revisar([dir], { raiz: dir });
    assert.equal(h.length, 1);
    assert.equal(h[0].texto, "#123456");
    assert.equal(h[0].linea, 2);
  });
});

test("toda excepción tiene su razón escrita", () => {
  // Una excepción anónima es una deriva con permiso.
  for (const e of EXCEPCIONES) {
    assert.ok(e.razon && e.razon.length > 10, `la excepción ${e.patron} no dice por qué`);
  }
});

test("tokens.css y su gemelo generado quedan fuera: ahí el color se DEFINE", () => {
  conArchivo("tokens.css", ":root { --amarillo: #ffc20e; }\n", (dir) => {
    assert.deepEqual(revisar([dir], { raiz: dir }), []);
  });
});
