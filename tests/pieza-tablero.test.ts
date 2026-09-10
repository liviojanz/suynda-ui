/**
 * B.2-29 · TABLERO DE ESTADOS — su compuerta, los cinco puntos del diseño
 * firmado (`docs/design/pieza-tablero.md` §6).
 *
 * POR QUÉ VIVE ACÁ Y NO EN LAB. La pieza es del paquete, así que su compuerta
 * es del paquete. Si la medición viviera en el consumidor, el próximo módulo
 * que monte un tablero heredaría la pieza sin heredar la prueba — que es
 * exactamente cómo `minmax(210px, 1fr)` de B.2-24 viajó intacto hasta `/equipo`.
 *
 * EL DEFECTO QUE LA ORIGINA, medido: Lab dibujaba
 * `repeat(4, minmax(12rem, 1fr))` con `gap: 0.75rem` (`lab/src/http/html.ts:367`)
 * = 4×192 + 3×12 = **804 px de ancho mínimo**, dentro de un slot de ~312 px a
 * 360. **No se veía porque `.shell__cuerpo` recorta** (`piezas.css`), así que el
 * tablero estaba cortado y nadie lo reportaba nunca.
 *
 * QUÉ NO MIDE ESTE ARCHIVO, y conviene decirlo antes que los verdes:
 *   · **que el tablero se vea bien**, ni que apilar sea la decisión correcta de
 *     producto. Eso es la firma viendo, y ya está dada.
 *   · **las tarjetas de adentro**: no son de la pieza (§3 del diseño).
 *   · **qué hace una columna con cincuenta tarjetas** — sin paginación ni
 *     scroll propio, apilada la columna crece y la página rueda. §5 lo deja
 *     fuera a propósito, para datos del piloto.
 *   · **el orden de las columnas**, que lo decide el módulo.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { chromium, type Page } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

const RAIZ = path.join(import.meta.dirname, "..");
const HOJAS = ["src/tokens.css", "src/piezas.css", "src/iconos.css"]
  .map((f) => readFileSync(path.join(RAIZ, f), "utf8"))
  .join("\n");

/** El ancho más angosto que la ficha declara soportar. */
const ANGOSTO = { width: 360, height: 800 };

async function conLasHojas(page: Page, cuerpo: string): Promise<void> {
  await page.route("https://suynda.test/hojas.css", (r) =>
    r.fulfill({ contentType: "text/css", body: HOJAS }),
  );
  await page.route("https://suynda.test/", (r) =>
    r.fulfill({
      contentType: "text/html; charset=utf-8",
      body:
        `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        // EL META VIEWPORT NO ES ADORNO DEL ARNES. Con `isMobile: true` y sin
        // el, Chromium le da a la pagina el viewport de ESCRITORIO —980 px—,
        // que esta por encima de los 860 del quiebre: el apilado no aplicaba y
        // G-2 daba rojo con la pieza correcta. Toda pagina real lo emite.
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<link rel="stylesheet" href="https://suynda.test/hojas.css">` +
        `<style>html,body{margin:0}</style></head><body>${cuerpo}</body></html>`,
    }),
  );
  await page.goto("https://suynda.test/");
  await page.waitForFunction(() => document.styleSheets.length > 0);
}

/**
 * El tablero tal cual lo monta un consumidor: las CUATRO columnas de entrega de
 * Lab, con la primera inerte —que es el caso `EXTERNAL_MANAGED`, cuando el
 * cobro lo lleva el convenio— y una vacía.
 *
 * Las tarjetas son `.tarjeta--interactiva` porque ése es el molde que el diseño
 * recomienda (§3), no porque la pieza las traiga.
 */
const TABLERO = `
<div class="tablero">
  <section class="tablero__columna tablero__columna--inerte" data-col="pago">
    <h3 class="tablero__titulo">Pendiente de pago<span class="tablero__cuenta">—</span></h3>
    <div class="vacio"><p class="vacio__cuerpo">No aplica: el cobro lo lleva el convenio.</p></div>
  </section>
  <section class="tablero__columna" data-col="proceso">
    <h3 class="tablero__titulo">En proceso<span class="tablero__cuenta">7</span></h3>
    <a class="tarjeta tarjeta--interactiva">Orden 1038 · Rodríguez Villalba, María Fernanda</a>
    <a class="tarjeta tarjeta--interactiva">Orden 1039 · Benítez, Juan</a>
  </section>
  <section class="tablero__columna" data-col="retiro">
    <h3 class="tablero__titulo">Listo para retiro<span class="tablero__cuenta">2</span></h3>
    <a class="tarjeta tarjeta--interactiva">Orden 1031 · Ayala, Carmen</a>
  </section>
  <section class="tablero__columna" data-col="entregado">
    <h3 class="tablero__titulo">Entregado<span class="tablero__cuenta">0</span></h3>
  </section>
</div>`;

/**
 * G-1 · **NADA ESCAPA AL TABLERO** — el punto 1 de §6.
 *
 * SE MIDE EL DESCENDIENTE CONTRA SU TABLERO, y no el tablero contra la página.
 * Es la lección que `piezas-angostas.test.ts` ya pagó dos veces: la caja de la
 * grilla es block-level y toma el ancho que le den, así que medirla a ella
 * **nunca revela el problema**. Y el ancho de viewport tampoco es el parámetro:
 * lo que estrangula al tablero es la CADENA del consumidor —riel, tabs,
 * paddings—, que a 360 px de pantalla le deja al slot ~312.
 *
 * Por eso se afirma la propiedad en tres contenedores, no una geometría: en uno
 * de 312 px, `minmax(12rem, 1fr)` desborda por definición y `minmax(0, 1fr)` no.
 */
for (const ancho of [312, 260, 180]) {
  test(`B.2-29 · G-1 · ningún descendiente escapa al tablero (contenedor de ${ancho} px)`, async () => {
    const navegador = await chromium.launch({ args: ["--no-sandbox"] });
    try {
      const page = await navegador.newPage({ viewport: ANGOSTO, hasTouch: true, isMobile: true });
      await conLasHojas(page, `<div style="width:${ancho}px">${TABLERO}</div>`);

      const medida = await page.locator(".tablero").evaluate((t) => {
        const caja = t.getBoundingClientRect();
        const fugados: string[] = [];
        for (const n of Array.from(t.querySelectorAll("*"))) {
          const r = n.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) {
            fugados.push(
              `${n.tagName.toLowerCase()}.${(n.className || "(sin clase)").toString().split(" ")[0]} ` +
                `[${Math.round(r.left)}..${Math.round(r.right)}]`,
            );
          }
        }
        return { rueda: t.scrollWidth > t.clientWidth, ancho: t.clientWidth, desborde: t.scrollWidth, fugados };
      });

      assert.equal(
        medida.rueda,
        false,
        `el tablero rueda de costado: clientWidth ${medida.ancho}, scrollWidth ${medida.desborde}`,
      );
      assert.deepEqual(
        medida.fugados,
        [],
        `${medida.fugados.length} descendiente(s) se salen de la caja del tablero: ${medida.fugados.join(" · ")}`,
      );
    } finally {
      await navegador.close();
    }
  });
}

/**
 * G-2 · **APILA, Y LOS CUATRO CONTADORES ENTRAN EN EL PRIMER VIEWPORT** — el
 * punto 2 de §6, que es el que sostiene la firma de A.
 *
 * Sin esto, «el panorama no se pierde» es una opinión. Se miden las dos mitades
 * de la afirmación: que a ≤860 px hay **UNA sola columna de grilla** —que es el
 * apilado en sí— y que los cuatro números caen dentro de los primeros 800 px de
 * alto sin scrollear.
 */
test("B.2-29 · G-2 · a 360 px apila, y los cuatro contadores entran sin scrollear", async () => {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: ANGOSTO, hasTouch: true, isMobile: true });
    await conLasHojas(page, `<div style="width:312px">${TABLERO}</div>`);

    const pistas = await page
      .locator(".tablero")
      .evaluate((t) => getComputedStyle(t).gridTemplateColumns.split(" ").filter(Boolean).length);
    assert.equal(pistas, 1, `a 360 px el tablero tendría que apilar y tiene ${pistas} columnas`);

    const contadores = await page.locator(".tablero__cuenta").evaluateAll((ns) =>
      ns.map((n) => {
        const r = n.getBoundingClientRect();
        return { texto: (n.textContent ?? "").trim(), abajo: Math.round(r.bottom), alto: Math.round(r.height) };
      }),
    );
    assert.equal(contadores.length, 4, "el tablero de prueba tiene cuatro columnas y cuatro contadores");
    const fuera = contadores.filter((c) => c.abajo > ANGOSTO.height || c.alto === 0);
    assert.deepEqual(
      fuera,
      [],
      `contador(es) fuera del primer viewport de ${ANGOSTO.height} px: ` +
        `${fuera.map((c) => `"${c.texto}" en ${c.abajo}`).join(" · ")}. ` +
        "El panorama del tablero vive en los contadores; si hay que scrollear para verlos, apilar no compró lo que dice §2",
    );
  } finally {
    await navegador.close();
  }
});

/**
 * G-3 · **LA INERTE SE DISTINGUE DE UNA VACÍA** — el punto 3 de §6.
 *
 * No son lo mismo y la pantalla no puede decir lo mismo: una columna vacía es
 * «hoy no hay ninguna», la inerte es «acá nunca va a haber, no aplica en este
 * flujo». `[data-col="entregado"]` está vacía y `[data-col="pago"]` es inerte.
 */
test("B.2-29 · G-3 · la columna inerte se distingue de una vacía", async () => {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: { width: 1280, height: 800 } });
    await conLasHojas(page, TABLERO);
    const inerte = await page
      .locator('[data-col="pago"]')
      .evaluate((e) => Number.parseFloat(getComputedStyle(e).opacity));
    const vacia = await page
      .locator('[data-col="entregado"]')
      .evaluate((e) => Number.parseFloat(getComputedStyle(e).opacity));
    assert.ok(
      inerte < vacia,
      `la inerte está en opacidad ${inerte} y la vacía en ${vacia}: se leen igual, ` +
        "y «no hay ninguna» no es lo mismo que «no aplica»",
    );
  } finally {
    await navegador.close();
  }
});

/**
 * G-4 · **A ESCRITORIO, CUATRO COLUMNAS DE IGUAL ANCHO** — el punto 4 de §6, y
 * **es la dirección contraria de R9**: que apilar no se filtre hacia arriba.
 *
 * Un arreglo angosto que se derrama a lo ancho arruina la pantalla que estaba
 * bien, y sale verde en toda compuerta que sólo mire 360.
 */
test("B.2-29 · G-4 · a 1280 px son cuatro columnas de igual ancho", async () => {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: { width: 1280, height: 800 } });
    await conLasHojas(page, TABLERO);
    const cols = await page
      .locator(".tablero")
      .evaluate((t) =>
        getComputedStyle(t)
          .gridTemplateColumns.split(" ")
          .filter(Boolean)
          .map((c) => Number.parseFloat(c)),
      );
    assert.equal(cols.length, 4, `a 1280 px tendría que haber cuatro columnas y hay ${cols.length}`);
    const min = Math.min(...cols);
    const max = Math.max(...cols);
    assert.ok(max - min <= 0.5, `las columnas no son de igual ancho: ${cols.join(" · ")}`);
  } finally {
    await navegador.close();
  }
});

/**
 * G-5 · **IMPRESIÓN** — el punto 5 de §6, y **la trampa que UI-1 ya pagó una
 * vez**: la caja de página de una A4 mide ~779 px CSS, cae bajo los 860, y un
 * `@media` sin tipo de medio manda el apilado al papel. La hoja de
 * especificación se imprimió a sí misma mostrando lo contrario de lo que decía.
 *
 * El papel no tiene pulgar: apilar es una respuesta al alcance del pulgar.
 */
test("B.2-29 · G-5 · al IMPRIMIR el tablero no apila", async () => {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: { width: 779, height: 1100 } });
    await conLasHojas(page, TABLERO);
    await page.emulateMedia({ media: "print" });
    const pistas = await page
      .locator(".tablero")
      .evaluate((t) => getComputedStyle(t).gridTemplateColumns.split(" ").filter(Boolean).length);
    assert.equal(
      pistas,
      4,
      `impreso a 779 px el tablero salió con ${pistas} columna(s): el \`@media\` perdió su \`screen and\``,
    );
  } finally {
    await navegador.close();
  }
});
