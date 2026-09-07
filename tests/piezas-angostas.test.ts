/**
 * LAS PIEZAS A 360 px, en un navegador de verdad.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO. La ficha tiene compuerta de 360 px desde UI-1
 * (`piezas.css`, «Compuertas heredadas de UI-1: 360 px y 44 px»), pero esa
 * compuerta se cumplía **por revisión**: hasta v0.3.4 ninguna prueba montaba una
 * pieza en un contenedor angosto y le preguntaba si cabía. B.2-24 salió con
 * `minmax(210px, 1fr)`, que **no baja de 210 px**, y el hueco viajó intacto
 * hasta su primer consumidor: en `/equipo` la tarjeta empujaba a su contenedor y
 * la página entera rodaba de costado (medido: `scrollWidth` 360 → 377).
 *
 * L10 en su forma más cara: **un molde puede traer huecos, y copiarlo los
 * copia.** El calco del hub lo cerró con un desvío declarado; esto lo cierra en
 * el molde, y —lo que importa— **lo deja medido**, para que el próximo
 * consumidor no lo redescubra.
 *
 * QUÉ SE MIDE, y costó dos intentos acertarle (los dos quedan contados abajo,
 * en el comentario de la invariante): **el ÍTEM contra su grilla**. Ni el
 * desborde de la página —que no aparece si el contenedor angosto está adentro de
 * una pantalla ancha— ni la caja de la grilla —que es block-level y toma el
 * ancho que le den—. El que no se encoge es la tilde.
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
const ANGOSTO = { width: 360, height: 780 };

async function conLasHojas(page: Page, cuerpo: string): Promise<void> {
  await page.route("https://suynda.test/hojas.css", (r) =>
    r.fulfill({ contentType: "text/css", body: HOJAS }),
  );
  await page.route("https://suynda.test/", (r) =>
    r.fulfill({
      contentType: "text/html; charset=utf-8",
      body:
        `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        `<link rel="stylesheet" href="https://suynda.test/hojas.css">` +
        `<style>html,body{margin:0}</style></head><body>${cuerpo}</body></html>`,
    }),
  );
  await page.goto("https://suynda.test/");
  await page.waitForFunction(() => document.styleSheets.length > 0);
}

/**
 * B.2-24 tal como la monta un consumidor: la tarjeta dentro de un panel, dentro
 * del ancho de la pantalla. Es la forma exacta que el hub usa en `/equipo`.
 */
const TARJETA_DE_PERMISOS = `
<div style="padding:12px">
  <section class="permisos">
    <div class="permisos__cab">
      <span class="icono-modulo"><span class="glifo glifo--lab"></span></span>
      <span class="permisos__nombre">Laboratorio</span>
    </div>
    <div class="permisos__cuerpo">
      <p class="permisos__rotulo">Perfil</p>
      <div class="permisos__perfiles">
        <button class="perfil perfil--activo">Recepción</button>
        <button class="perfil">Técnico</button>
      </div>
      <div class="permisos__tildes">
        <label class="tilde"><input type="checkbox"><span>Ver</span></label>
        <label class="tilde tilde--con-alcance">
          <input type="checkbox"><span>Cargar resultados</span>
          <div class="tilde__alcance">En 2 · Microbiología, Hematología</div>
        </label>
      </div>
    </div>
  </section>
</div>`;

const SELECTOR_DE_MODULOS = `
<div style="padding:12px">
  <div class="modulos">
    <button class="modulo-chip modulo-chip--elegido">
      <span class="icono-modulo"><span class="glifo glifo--lab"></span></span>Laboratorio
    </button>
    <button class="modulo-chip">
      <span class="icono-modulo"><span class="glifo glifo--compra"></span></span>Compra
    </button>
  </div>
</div>`;

async function desbordaLaPagina(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

/**
 * LA INVARIANTE, y es la que el arreglo garantiza de verdad: **la celda nunca es
 * más ancha que su contenedor**.
 *
 * PRIMERO ESCRIBÍ ESTA PRUEBA MAL, y la salvó plantarle el rojo. Montaba la
 * tarjeta a 360 px sueltas en el `<body>` y afirmaba que la página no desbordaba
 * — con `minmax(210px, 1fr)` puesto de vuelta **seguía verde**, porque a 360 px
 * menos los paddings le quedaban ~304 px a la grilla y el track de 210 entra
 * cómodo. Medía una condición que el hueco no toca: una compuerta que da verde
 * con el defecto adentro no es una compuerta (L7).
 *
 * El ancho de pantalla NO es el parámetro correcto: lo que llevó la tarjeta al
 * borde en `/equipo` fue la CADENA del consumidor —riel, panel, paddings— que a
 * 360 px de viewport le dejaba a la grilla bastante menos de 210. Así que se
 * afirma la propiedad, no una geometría concreta: en un contenedor de 180 px,
 * `minmax(210px, …)` desborda por definición y `min(210px, 100%)` no.
 */
for (const ancho of [260, 220, 180]) {
  test(`B.2-24 · la tilde nunca es más ancha que su contenedor (${ancho} px)`, async () => {
    const navegador = await chromium.launch({ args: ["--no-sandbox"] });
    try {
      const page = await navegador.newPage({ viewport: ANGOSTO });
      await conLasHojas(page, `<div style="width:${ancho}px">${TARJETA_DE_PERMISOS}</div>`);

      // SE MIDE EL ÍTEM CONTRA SU GRILLA, y no la grilla contra su contenedor.
      // La caja de la grilla es block-level: toma el ancho que le dan, así que
      // medirla NUNCA revela el problema. El que no se encoge es LA TILDE,
      // clavada en el mínimo del track — es exactamente el nodo que la sonda
      // del hub había señalado (`LABEL.tilde`, 210 px), y no haberlo trasladado
      // fue mi segundo error de medición en este archivo.
      const medida = await page.locator(".permisos__tildes").evaluate((e) => ({
        grilla: e.clientWidth,
        tilde: (e.querySelector(".tilde") as HTMLElement).getBoundingClientRect().width,
        columnas: getComputedStyle(e).gridTemplateColumns.split(" ").filter(Boolean).length,
      }));
      assert.ok(
        medida.tilde <= medida.grilla + 0.5,
        `la tilde mide ${medida.tilde} adentro de una grilla de ${medida.grilla}: ` +
          "es el hueco de `minmax(210px, 1fr)`",
      );
      assert.equal(medida.columnas, 1, "en un contenedor angosto hay UNA columna");
    } finally {
      await navegador.close();
    }
  });
}

test("B.2-24 · a lo ancho la receta manda: ninguna columna baja de 210 px", async () => {
  // La otra mitad, y la que impide «arreglar» el desborde tirando el número:
  // `min(210px, 100%)` conserva la intención donde hay lugar.
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: { width: 1280, height: 800 } });
    await conLasHojas(page, TARJETA_DE_PERMISOS);
    const cols = await page
      .locator(".permisos__tildes")
      .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").filter(Boolean));
    assert.ok(cols.length >= 2, `a 1280 px tendría que haber varias columnas, hay ${cols.length}`);
    for (const c of cols) {
      assert.ok(
        Number.parseFloat(c) >= 209.9,
        `una columna mide ${c} y la receta pide 210 mínimo`,
      );
    }
  } finally {
    await navegador.close();
  }
});

test("B.2-23 · el selector de módulos CABE a 360 px, y sus chips miden 44", async () => {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({ viewport: ANGOSTO });
    await conLasHojas(page, SELECTOR_DE_MODULOS);
    assert.equal(await desbordaLaPagina(page), false);
    const alto = await page
      .locator(".modulo-chip")
      .first()
      .evaluate((e) => Number.parseFloat(getComputedStyle(e).minHeight));
    assert.ok(alto >= 44, `el chip mide ${alto} y la compuerta de UI-1 pide 44`);
  } finally {
    await navegador.close();
  }
});
