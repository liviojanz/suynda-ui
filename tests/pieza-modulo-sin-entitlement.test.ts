/**
 * B.2-21 · MÓDULO SIN ENTITLEMENT — su compuerta, los cinco puntos del diseño
 * firmado (`docs/design/pieza-modulo-sin-entitlement.md` §6).
 *
 * QUÉ NO MIDE:
 *   · **Si el copy es el correcto para un usuario real.** Eso es la firma
 *     viendo, y el copy vino de producción sin redactarse de nuevo.
 *   · **Que el módulo elija bien la causa.** Sale de un código de error y es de
 *     `@suynda/modulo`; la pieza pinta la que le den.
 *   · **A Lab.** Mientras no re-pinee sigue con su calco `.sin-acceso`.
 *   · **Una tercera causa.** Hoy hay dos códigos y dos conductas.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { chromium, type Page } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import { copyDeDenegacion, htmlDeDenegacion } from "../src/denegacion.js";

const RAIZ = path.join(import.meta.dirname, "..");
const leer = (...p: string[]): string => readFileSync(path.join(RAIZ, ...p), "utf8");
const HOJAS = ["src/tokens.css", "src/piezas.css", "src/iconos.css"].map((f) => leer(f)).join("\n");

const HUB = "https://suynda.com";

async function montada(page: Page, html: string): Promise<void> {
  await page.route("https://suynda.test/hojas.css", (r) =>
    r.fulfill({ contentType: "text/css", body: HOJAS }),
  );
  await page.route("https://suynda.test/", (r) =>
    r.fulfill({
      contentType: "text/html; charset=utf-8",
      body:
        `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<link rel="stylesheet" href="https://suynda.test/hojas.css">` +
        `<style>html,body{margin:0}.slot{width:312px;margin:0 auto}</style></head>` +
        `<body><div class="slot">${html}</div></body></html>`,
    }),
  );
  await page.goto("https://suynda.test/");
  await page.waitForFunction(() => document.styleSheets.length > 0);
}

async function enElNavegador<T>(html: string, medir: (p: Page) => Promise<T>): Promise<T> {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({
      viewport: { width: 360, height: 800 },
      hasTouch: true,
      isMobile: true,
    });
    await montada(page, html);
    return await medir(page);
  } finally {
    await navegador.close();
  }
}

/* ── 1 · LAS DOS CAUSAS DAN DOS PANTALLAS DISTINTAS ────────────────────── */

test("B.2-21 · G-1 · sin módulo ofrece DOS salidas y sin facultad ofrece UNA", () => {
  const sinModulo = htmlDeDenegacion({ causa: "sin-modulo", modulo: "Laboratorio", hubOrigen: HUB });
  const sinFacultad = htmlDeDenegacion({ causa: "sin-facultad", modulo: "Laboratorio", hubOrigen: HUB });

  const salidas = (html: string): number => (html.match(/class="boton /g) ?? []).length;
  assert.equal(salidas(sinModulo), 2, "sin módulo tendría que ofrecer activar y volver");
  assert.equal(
    salidas(sinFacultad),
    1,
    "sin facultad ofrece SOLO volver: activar no cambiaría el desenlace, y ofrecerlo sería mentir",
  );
  assert.ok(sinModulo.includes("/activar"), "falta la salida de activar en la causa que sí se arregla");
  assert.ok(
    !sinFacultad.includes("/activar"),
    "la pantalla de sin-facultad ofrece activar: es la conducta que ACT-1a-fix desmintió",
  );
  assert.ok(sinModulo.includes("/panel") && sinFacultad.includes("/panel"), "las dos vuelven al Hub");
});

/**
 * Y LA DIRECCIÓN CONTRARIA, que es donde un módulo podría escaparse: cambiar el
 * copy es legítimo, invertir la regla de salidas no. `ofreceActivar` sale de la
 * CAUSA, no del objeto que le pasen.
 */
test("B.2-21 · G-1b · un copy propio no puede inventar la salida de activar", () => {
  const html = htmlDeDenegacion({
    causa: "sin-facultad",
    modulo: "Depósito",
    hubOrigen: HUB,
    copy: { titulo: "Otro título", cuerpo: "Otro cuerpo", ofreceActivar: true },
  });
  assert.ok(html.includes("Otro título"), "el copy propio no se aplicó");
  assert.ok(
    !html.includes("/activar"),
    "un copy con `ofreceActivar: true` logró meter la salida de activar en una denegación por facultad",
  );
});

/* ── 2 · A 360 LAS SALIDAS ENVUELVEN Y NADA ESCAPA ─────────────────────── */

/**
 * ESTA PRUEBA ME DESMINTIÓ UNA AFIRMACIÓN, y la desmintió su propia guarda de
 * R10: escribí —en el diseño y en el CSS— que sin `flex-wrap` las dos salidas
 * no entran en 360. **Es falso.** A 312 px, con los seis módulos que existen,
 * entran en una línea (219–266 contra una caja de 280); sólo envuelven con un
 * nombre de dos palabras, «Laboratorio clínico» (308).
 *
 * Así que la condición se parte en las dos cosas que la clase sostiene, y cada
 * una se mide donde se ejerce:
 *   · **el `gap`, que vale siempre** — el marcado se emite por concatenación,
 *     sin espacio entre los dos `<a>`: sin contenedor flex los botones SE
 *     TOCAN. Medido, 0 px sin la clase y 10 con ella.
 *   · **el `flex-wrap`, que es seguro para el nombre largo** — se ejerce con
 *     el nombre que efectivamente envuelve, y no con uno que entra.
 */
test("B.2-21 · G-2a · las salidas no se tocan, y nada escapa al bloque", async () => {
  const medida = await enElNavegador(
    htmlDeDenegacion({ causa: "sin-modulo", modulo: "Laboratorio", hubOrigen: HUB }),
    (page) =>
      page.evaluate(() => {
        const b = document.querySelector(".sin-modulo") as HTMLElement;
        const s = document.querySelector(".sin-modulo__salidas") as HTMLElement;
        const caja = b.getBoundingClientRect();
        const fugados: string[] = [];
        for (const n of Array.from(b.querySelectorAll("*"))) {
          const r = n.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5)
            fugados.push(`${n.tagName.toLowerCase()}[${Math.round(r.left)}..${Math.round(r.right)}]`);
        }
        const hijos = Array.from(s.children).map((e) => e.getBoundingClientRect());
        return {
          rueda: b.scrollWidth > b.clientWidth,
          fugados,
          separacion: Math.round(hijos[1].left - hijos[0].right),
        };
      }),
  );
  assert.equal(medida.rueda, false, "el bloque rueda de costado");
  assert.deepEqual(medida.fugados, [], `se salen del bloque: ${medida.fugados.join(" · ")}`);
  assert.ok(
    medida.separacion >= 8,
    `las dos salidas están a ${medida.separacion} px una de otra: el marcado se emite sin ` +
      "espacio entre los `<a>`, así que sin el contenedor flex los botones se tocan",
  );
});

test("B.2-21 · G-2b · con un nombre de módulo largo las salidas ENVUELVEN", async () => {
  // «Laboratorio clínico» es el caso donde el `flex-wrap` se ejerce: 308 px de
  // salidas contra una caja de 280. Con «Laboratorio» a secas esta prueba
  // saldría verde sin `flex-wrap`, y no mediría nada (R10).
  const medida = await enElNavegador(
    htmlDeDenegacion({ causa: "sin-modulo", modulo: "Laboratorio clínico", hubOrigen: HUB }),
    (page) =>
      page.evaluate(() => {
        const b = document.querySelector(".sin-modulo") as HTMLElement;
        const s = document.querySelector(".sin-modulo__salidas") as HTMLElement;
        return {
          envuelve: getComputedStyle(s).flexWrap,
          rueda: b.scrollWidth > b.clientWidth,
          lineas: new Set(
            Array.from(s.children).map((e) => Math.round(e.getBoundingClientRect().top)),
          ).size,
        };
      }),
  );
  assert.equal(medida.envuelve, "wrap", "las salidas no envuelven");
  assert.equal(
    medida.lineas,
    2,
    "con un nombre largo las salidas siguieron en una línea: o desbordan, o el fixture dejó de ser el caso que ejerce el wrap",
  );
  assert.equal(medida.rueda, false, "el bloque rueda de costado con el nombre largo");
});

/* ── 3 · LOS BOTONES MIDEN 44 BAJO PUNTERO GRUESO ─────────────────────── */

test("B.2-21 · G-3 · las salidas miden 44 px y V-4 las mide", async () => {
  const medida = await enElNavegador(
    htmlDeDenegacion({ causa: "sin-modulo", modulo: "Laboratorio", hubOrigen: HUB }),
    (page) =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>(".sin-modulo__salidas .boton")).map((e) => {
          const s = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          // El predicado de V-4, tal cual está en los módulos.
          const loMide = e.tagName === "A" ? s.display !== "inline" : true;
          return { alto: Math.round(r.height), ancho: Math.round(r.width), display: s.display, loMide };
        }),
      ),
  );
  assert.equal(medida.length, 2);
  for (const b of medida) {
    assert.ok(b.alto >= 44, `una salida mide ${b.alto} de alto y la compuerta de UI-1 pide 44`);
    assert.ok(b.ancho >= 44, `una salida mide ${b.ancho} de ancho`);
    assert.equal(b.loMide, true, `una salida quedó fuera del alcance de V-4 (display ${b.display})`);
  }
});

/* ── 4 · LA HOJA, EL MD Y EL CSS DICEN LO MISMO ───────────────────────────
 *
 * ÉSTA ES LA CONDICIÓN QUE DESCUBRIÓ EL DEFECTO, y no mide CSS: mide los
 * documentos. `cobertura-hoja.test.ts` ata que el código `B.2-NN` APAREZCA en
 * las tres caras — es una compuerta de PRESENCIA, no de ACUERDO. La enmienda de
 * Fase 2 corrigió el MD a «las salidas dependen de la causa» y la hoja siguió
 * diciendo «dos salidas: activar y volver», con su muestra dibujando los dos
 * botones siempre. Nadie lo vio porque nadie lo miraba.
 *
 * Si el fundador firma mirando la hoja, firma lo que ACT-1a-fix desmintió.
 */
test("B.2-21 · G-4 · la hoja no puede contradecir al MD sobre las salidas", () => {
  const hoja = leer("catalogo", "hoja.html");
  const md = leer("docs", "hoja-de-especificacion.md");

  const fichaDeLaHoja = hoja.slice(hoja.indexOf("B.2-21"), hoja.indexOf("B.2-21") + 3000);
  const seccionDelMd = md.slice(md.indexOf("## B.2-21"), md.indexOf("## B.2-21") + 2000);

  assert.ok(
    /dependen de la causa/i.test(seccionDelMd),
    "el MD dejó de decir que las salidas dependen de la causa",
  );
  assert.ok(
    /dependen de la causa/i.test(fichaDeLaHoja),
    "la ficha de la hoja no dice que las salidas dependen de la causa: está mostrando otra pieza que la que el MD documenta",
  );
  // La afirmación vieja, textual, es la que no puede volver.
  assert.ok(
    !/dos salidas: activar y volver/i.test(fichaDeLaHoja),
    'la ficha volvió a decir «dos salidas: activar y volver» — es la receta que la enmienda de Fase 2 corrigió',
  );
  // Y la muestra tiene que dibujar LAS DOS causas, no una.
  assert.ok(
    /sin-modulo__salidas/.test(fichaDeLaHoja),
    "la muestra de la hoja no usa `.sin-modulo__salidas`: dibuja botones sueltos, como antes de la pieza",
  );
});

/* ── 5 · EL COPY SALE PARAMETRIZADO, NO CABLEADO ─────────────────────── */

test("B.2-21 · G-5 · el módulo es un parámetro, no un nombre cableado", () => {
  const lab = copyDeDenegacion("sin-modulo", "Laboratorio");
  const depo = copyDeDenegacion("sin-modulo", "Depósito");

  assert.ok(lab.titulo.includes("Laboratorio") && depo.titulo.includes("Depósito"));
  assert.ok(lab.cuerpo.includes("Laboratorio") && depo.cuerpo.includes("Depósito"));
  assert.ok(
    !depo.titulo.includes("Laboratorio") && !depo.cuerpo.includes("Laboratorio"),
    "el nombre del módulo quedó cableado: la pieza le dice «Laboratorio» a Depósito",
  );
  // La causa sin facultad no nombra el módulo en el título —es sobre la cuenta,
  // no sobre el módulo— pero sí en el cuerpo.
  const facultad = copyDeDenegacion("sin-facultad", "Depósito");
  assert.ok(facultad.cuerpo.includes("Depósito"));
  assert.equal(facultad.ofreceActivar, false);
});

/**
 * Una pantalla de error no puede caerse por el error que estaba mostrando.
 * Si el origen del Hub viene mal, la salida queda relativa y la pieza dibuja.
 */
test("B.2-21 · G-5b · un `hubOrigen` inválido no tumba la pantalla", () => {
  const html = htmlDeDenegacion({ causa: "sin-modulo", modulo: "Laboratorio", hubOrigen: "" });
  assert.ok(html.includes("sin-modulo__salidas"));
  assert.ok(html.includes('href="/panel"'), "la salida al Hub desapareció con un origen vacío");
});
