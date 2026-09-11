/**
 * D2 · LOS OCHO ARREGLOS — su compuerta.
 *
 * Uno por arreglo, y cada uno con **su** roja plantada revirtiendo **su**
 * arreglo. No hay una roja genérica de la corrida: una mutación que tumba ocho
 * tests a la vez no demuestra que ninguno de los ocho mida algo propio.
 *
 * EL ORDEN DE ABAJO ES EL DE CONSTRUCCIÓN (`corrida-d2-arreglos.md` §9), no el
 * de los números: D2-9 primero porque D2-7 y D2-8 apoyan en `.tarjeta__titulo`,
 * y D2-6 último porque es el único que puede volver rojas estaciones ya
 * cerradas en Lab.
 *
 * QUÉ NO MIDE ESTE ARCHIVO:
 *   · **A Lab.** Mientras Lab no re-pinee, sigue con sus clases propias. Que
 *     estas ocho existan no borra las de allá; eso es (d) y (f).
 *   · **Que se vean bien.** Ocho arreglos de aspecto se firman viendo.
 *   · **Un `<h2>` sin clase** (D2-9): el canon vive en clases y esto no lo
 *     cambia. Es límite declarado, no descuido.
 *   · **Cuántas estaciones se ponen rojas con O-1 puesto.** Son quince
 *     botones-enlace más tres tarjetas, pero cuántos miden menos de 44 no se
 *     sabe sin Lab re-pineado.
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
        // Sin el meta, `isMobile` le da a la página el viewport de escritorio
        // —980px— y ningún `@media` de 860 aplica. Lo pagó B.2-29.
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<link rel="stylesheet" href="https://suynda.test/hojas.css">` +
        `<style>html,body{margin:0}</style></head><body>${cuerpo}</body></html>`,
    }),
  );
  await page.goto("https://suynda.test/");
  await page.waitForFunction(() => document.styleSheets.length > 0);
}

async function enUnaPagina<T>(
  cuerpo: string,
  medir: (p: Page) => Promise<T>,
  opciones: { width: number; height: number; movil?: boolean } = { ...ANGOSTO, movil: true },
): Promise<T> {
  const navegador = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await navegador.newPage({
      viewport: { width: opciones.width, height: opciones.height },
      hasTouch: opciones.movil ?? false,
      isMobile: opciones.movil ?? false,
    });
    await conLasHojas(page, cuerpo);
    return await medir(page);
  } finally {
    await navegador.close();
  }
}

/* ══ D2-9 · TÍTULOS ════════════════════════════════════════════════════════
 *
 * Dos mitades, y la segunda es la que decidió O-2.
 */

/**
 * PRIMERO ESCRIBÍ ESTA PRUEBA MAL, y la salvó correrla. Comparaba el título
 * contra un `<p>` SIN CLASE y afirmaba que el título tenía que ser más grande.
 * Dio rojo con la pieza correcta: el título mide 15 y el `<p>` pelado 16.
 *
 * La causa es una condición del terreno que conviene tener escrita: **el canon
 * no declara tamaño base en ningún lado** — no hay regla de `body`, de `html`
 * ni de `*`, ni un token de escala. Cada pieza declara sus px y el texto sin
 * clase queda en el default del navegador. **Eso sería el candidato ONCE del
 * tag, y la lista está congelada**, así que se anota y no se toca.
 *
 * La comparación correcta es contra el canon mismo: `.vacio__titulo` es el
 * hermano declarado de `.tarjeta__titulo`, y los dos son el rótulo de un
 * bloque de contenido. Si la escala de títulos del paquete es una sola, tienen
 * que coincidir.
 */
test("D2-9 · `.tarjeta__titulo` existe y entra en la escala de títulos del canon", async () => {
  const medida = await enUnaPagina(
    `<div class="tarjeta"><p class="tarjeta__titulo" id="t">Órdenes del día</p></div>
     <div class="vacio"><p class="vacio__titulo" id="v">Nada por acá</p></div>
     <p id="pelado">sin clase</p>`,
    (page) =>
      page.evaluate(() => {
        const t = getComputedStyle(document.getElementById("t")!);
        const v = getComputedStyle(document.getElementById("v")!);
        const p = getComputedStyle(document.getElementById("pelado")!);
        return {
          tam: Number.parseFloat(t.fontSize),
          peso: t.fontWeight,
          familia: t.fontFamily,
          tamHermano: Number.parseFloat(v.fontSize),
          pesoDelPelado: p.fontWeight,
        };
      }),
  );
  assert.equal(
    medida.tam,
    medida.tamHermano,
    `el título de la tarjeta mide ${medida.tam} y el de vacío ${medida.tamHermano}: ` +
      "la escala de títulos del canon dejó de ser una sola",
  );
  assert.equal(medida.peso, "600", "el título no tiene el peso de título del canon");
  assert.ok(
    /Poppins/i.test(medida.familia),
    `el título salió con "${medida.familia}" y no con la tipografía de título del canon`,
  );
  // El contraste con el texto pelado, que es lo que la clase compra: sin ella
  // el navegador da 400 y ninguna familia del canon.
  assert.notEqual(medida.peso, medida.pesoDelPelado);
});

/**
 * LA MITAD QUE DECIDIÓ O-2, y se mide en el lugar incómodo a propósito.
 *
 * En una caja de ancho fijo `break-word` y `anywhere` se comportan IGUAL: los
 * dos parten la palabra. La diferencia aparece donde el tamaño `min-content`
 * manda —un ítem flex, o una grilla de mínimo automático—, que es la forma de
 * `.lista__fila`. Ahí `break-word` **no achica el mínimo** y el ítem sigue
 * empujando; `anywhere` sí. Medido: contenedor 162, con `break-word` el scroll
 * daba 176 y con `anywhere` 160.
 *
 * Si esta prueba se montara en una caja fija saldría verde con la declaración
 * equivocada, que es el modo de falla que R10 nombra.
 */
/**
 * Y ESTA PRUEBA TAMBIÉN SALIÓ MAL LA PRIMERA VEZ — **la salvó plantarle la
 * roja**, que es exactamente para lo que R10 existe.
 *
 * La escribí con la fila a **160 px** y salió VERDE con `break-word` puesto:
 * o sea que medía en el lugar cómodo mientras su propio comentario decía que
 * medía en el incómodo. Calibrado después, el corte está justo abajo:
 *
 * ```
 * anywhere     160:160/160  140:140/140  120:120/120  100:100/100
 * break-word   160:160/160  140:151/140  120:151/120  100:151/100   ← desborda
 * ```
 *
 * «Recomendaciones» a 15 px pide 151 px de `min-content` con su vecino. A 160
 * entra igual con las dos declaraciones y no se distingue nada. Se mide a 140
 * y a 110.
 */
for (const ancho of [140, 110]) {
  test(`D2-9 · una palabra larga no empuja su fila de ${ancho} px (el caso \`min-content\`)`, async () => {
  const medida = await enUnaPagina(
    `<div style="display:flex;gap:12px;width:${ancho}px" id="fila">
       <p class="tarjeta__titulo" id="t">Recomendaciones</p><span>ok</span>
     </div>`,
    (page) =>
      page.evaluate(() => {
        const f = document.getElementById("fila")!;
        return {
          caja: Math.round(f.getBoundingClientRect().width),
          scroll: Math.round(f.scrollWidth),
          envoltura: getComputedStyle(document.getElementById("t")!).overflowWrap,
        };
      }),
  );
  assert.ok(
    medida.scroll <= medida.caja + 1,
    `la fila mide ${medida.caja} y su contenido ${medida.scroll}: el título la empuja. ` +
      `La envoltura declarada es "${medida.envoltura}" — con \`break-word\` esto da 151, ` +
      "porque `break-word` no achica el tamaño `min-content` y el mínimo del ítem sigue siendo la palabra entera",
  );
  });
}

/* ══ D2-7 · SECCIÓN CRÍTICA ══════════════════════════════════════════════ */

test("D2-7 · la tarjeta crítica se distingue de una común, borde y título", async () => {
  const medida = await enUnaPagina(
    `<section class="tarjeta tarjeta--critico" id="c"><p class="tarjeta__titulo" id="ct">Críticos sin notificar</p></section>
     <section class="tarjeta" id="n"><p class="tarjeta__titulo" id="nt">Órdenes del día</p></section>`,
    (page) =>
      // OJO: nada de `const g = (id) => ...` acá adentro. esbuild —que es lo
      // que tsx usa— le cuelga un `__name(...)` a toda función con nombre, y
      // ese helper NO existe en el navegador. Me mordió al escribir esto.
      page.evaluate(() => {
        const c = getComputedStyle(document.getElementById("c")!);
        const n = getComputedStyle(document.getElementById("n")!);
        const ct = getComputedStyle(document.getElementById("ct")!);
        const nt = getComputedStyle(document.getElementById("nt")!);
        return {
          bordeCritico: c.borderTopWidth,
          bordeComun: n.borderTopWidth,
          colorCritico: c.borderTopColor,
          colorComun: n.borderTopColor,
          tituloCritico: ct.color,
          tituloComun: nt.color,
        };
      }),
  );
  assert.notEqual(
    medida.bordeCritico,
    medida.bordeComun,
    `las dos tarjetas tienen borde de ${medida.bordeCritico}: la crítica no grita`,
  );
  assert.notEqual(medida.colorCritico, medida.colorComun, "el borde crítico no cambió de color");
  assert.notEqual(
    medida.tituloCritico,
    medida.tituloComun,
    `los dos títulos son ${medida.tituloCritico}: el título crítico no se distingue`,
  );
});

/* ══ D2-8 · PUNTEADA ══════════════════════════════════════════════════════ */

test("D2-8 · la tarjeta punteada se distingue de una sólida", async () => {
  const medida = await enUnaPagina(
    `<div class="tarjeta tarjeta--punteada" id="p">no guardado</div><div class="tarjeta" id="s">guardado</div>`,
    (page) =>
      page.evaluate(() => ({
        punteada: getComputedStyle(document.getElementById("p")!).borderTopStyle,
        solida: getComputedStyle(document.getElementById("s")!).borderTopStyle,
      })),
  );
  assert.equal(medida.punteada, "dashed");
  assert.notEqual(medida.punteada, medida.solida);
});

/* ══ D2-3 · CHIP DE FILTRO ════════════════════════════════════════════════ */

test("D2-3 · `.chip` es la misma pieza que `.modulo-chip`: 44px y envuelve", async () => {
  const medida = await enUnaPagina(
    `<div style="width:200px"><div class="chips" id="c">
       <button class="chip chip--elegido">Hematología</button>
       <button class="chip">Microbiología</button>
       <button class="chip">Química clínica</button>
     </div></div>`,
    (page) =>
      page.evaluate(() => {
        const c = document.getElementById("c")!;
        const chips = Array.from(c.querySelectorAll<HTMLElement>(".chip"));
        return {
          envuelve: getComputedStyle(c).flexWrap,
          altos: chips.map((e) => Math.round(e.getBoundingClientRect().height)),
          desborda: c.scrollWidth > c.clientWidth,
          elegidoPinta:
            getComputedStyle(chips[0]).backgroundColor !== getComputedStyle(chips[1]).backgroundColor,
        };
      }),
  );
  assert.equal(medida.envuelve, "wrap", "`.chips` no envuelve: los chips se salen en una línea");
  assert.equal(medida.desborda, false, "los chips desbordan su contenedor");
  for (const alto of medida.altos)
    assert.ok(alto >= 44, `un chip mide ${alto} y la compuerta de UI-1 pide 44`);
  assert.ok(medida.elegidoPinta, "`.chip--elegido` no se distingue del chip en reposo");
});

/* ══ D2-4 · `.entrada__campos` SIN MÍNIMO DURO ════════════════════════════
 *
 * Misma forma que la prueba de B.2-24: se mide **el campo contra su grilla**,
 * no la página. La caja de la grilla es block-level y toma el ancho que le den,
 * así que medirla a ella nunca revelaría el problema.
 */
for (const ancho of [180, 150]) {
  test(`D2-4 · el campo nunca es más ancho que su grilla (contenedor de ${ancho} px)`, async () => {
    const medida = await enUnaPagina(
      `<div style="width:${ancho}px"><div class="entrada"><div class="entrada__campos" id="g">
         <label class="campo"><span class="campo__rotulo">Código</span><input class="campo__control"></label>
         <label class="campo"><span class="campo__rotulo">Nombre</span><input class="campo__control"></label>
       </div></div></div>`,
      (page) =>
        page.evaluate(() => {
          const g = document.getElementById("g")!;
          return {
            grilla: g.clientWidth,
            campo: (g.querySelector(".campo") as HTMLElement).getBoundingClientRect().width,
          };
        }),
    );
    assert.ok(
      medida.campo <= medida.grilla + 0.5,
      `el campo mide ${Math.round(medida.campo)} adentro de una grilla de ${medida.grilla}: ` +
        "es el hueco de `minmax(200px, …)` sin `min()`",
    );
  });
}

test("D2-4 · a lo ancho el tope de 300 sigue mandando", async () => {
  // La otra mitad, la que impide "arreglar" el desborde tirando el número: el
  // comentario de la pieza explica por qué existe el tope y sigue valiendo.
  const cols = await enUnaPagina(
    `<div class="entrada"><div class="entrada__campos" id="g">
       <label class="campo"><span class="campo__rotulo">A</span><input class="campo__control"></label>
       <label class="campo"><span class="campo__rotulo">B</span><input class="campo__control"></label>
     </div></div>`,
    (page) =>
      page
        .locator("#g")
        .evaluate((e) =>
          getComputedStyle(e)
            .gridTemplateColumns.split(" ")
            .filter(Boolean)
            .map((c) => Number.parseFloat(c)),
        ),
    { width: 1280, height: 800 },
  );
  for (const c of cols)
    assert.ok(c <= 300.5, `una columna mide ${c} y la receta topea en 300`);
});

/* ══ D2-5 · TAPA DE TUBO ══════════════════════════════════════════════════ */

test("D2-5 · el tubo pinta el color del mundo real, desde un token", async () => {
  const medida = await enUnaPagina(
    `<span class="tubo tubo--suero" id="s"></span>
     <span class="tubo tubo--edta" id="e"></span>
     <span class="tubo" id="x"></span>`,
    (page) =>
      // Sin flechas con nombre acá adentro: `__name` de esbuild no existe en
      // el navegador.
      page.evaluate(() => ({
        suero: getComputedStyle(document.getElementById("s")!).backgroundColor,
        edta: getComputedStyle(document.getElementById("e")!).backgroundColor,
        pelado: getComputedStyle(document.getElementById("x")!).backgroundColor,
        token: getComputedStyle(document.documentElement).getPropertyValue("--tubo-suero").trim(),
      })),
  );
  // #f5d76e — el amarillo que está en producción. No se aplana a los tonos del
  // sistema: la tapa de un tubo de suero es amarilla porque el tubo ES amarillo.
  assert.equal(medida.suero, "rgb(245, 215, 110)", "el tubo de suero perdió su amarillo real");
  assert.equal(medida.edta, "rgb(107, 76, 154)", "el tubo de EDTA perdió su violeta real");
  assert.notEqual(medida.suero, medida.edta, "los dos tubos se pintan igual");
  assert.equal(medida.token, "#f5d76e", "el color no viene de un token `--tubo-*`");
  assert.notEqual(medida.pelado, medida.suero, "`.tubo` sin variante ya viene pintado");
});

/* ══ D2-10 · ENVOLTORIO DE SCROLL ═════════════════════════════════════════ */

test("D2-10 · una tabla ancha rueda adentro del envoltorio y no empuja afuera", async () => {
  const medida = await enUnaPagina(
    `<div style="width:300px" id="slot"><div class="envoltorio-scroll" id="w">
       <table><thead><tr><th>Código</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Departamento</th><th>Estado</th></tr></thead>
       <tbody><tr><td>EQ-001</td><td>Roche</td><td>Cobas c311</td><td>SN-88421</td><td>Química clínica</td><td>Operativo</td></tr></tbody></table>
     </div></div>`,
    (page) =>
      page.evaluate(() => {
        const slot = document.getElementById("slot")!;
        const w = document.getElementById("w")!;
        return {
          slot: slot.clientWidth,
          slotDesborda: slot.scrollWidth > slot.clientWidth,
          envoltorioAncho: Math.round(w.getBoundingClientRect().width),
          envoltorioRueda: w.scrollWidth > w.clientWidth,
        };
      }),
  );
  assert.equal(
    medida.slotDesborda,
    false,
    `el slot de ${medida.slot} desborda: la tabla lo empujó en vez de rodar adentro`,
  );
  assert.ok(
    medida.envoltorioAncho <= medida.slot + 0.5,
    `el envoltorio mide ${medida.envoltorioAncho} dentro de un slot de ${medida.slot}`,
  );
  assert.equal(
    medida.envoltorioRueda,
    true,
    "el envoltorio no rueda: si la tabla entrara, esta prueba no estaría midiendo nada (R10)",
  );
});

/* ══ `.boton` · UN BOTON NO SE SUBRAYA ═══════════════════════════════════
 *
 * Entró a este tag por decisión del fundador, fuera de los diez: no es un hueco
 * que alguien pidió, es un defecto visible en lo que la corrida entrega. El
 * paquete emite `<a class="boton">` desde `htmlDeDenegacion`, así que el
 * subrayado dejó de ser sólo problema del consumidor.
 *
 * Se mide la PROPIEDAD que importa: la misma clase se ve igual con las dos
 * etiquetas. Es la forma del mismo defecto que produjo el agujero de V-4 —una
 * pieza que se comporta distinto según el tag— y por eso se afirma así y no
 * como "es none".
 */
test("`.boton` · el enlace-botón se ve igual que el botón-botón", async () => {
  const medida = await enUnaPagina(
    `<a class="boton boton--primario" id="a" href="#">Activar Laboratorio</a>
     <button class="boton boton--primario" id="b">Activar Laboratorio</button>
     <a id="pelado" href="#">un enlace de prosa</a>`,
    (page) =>
      page.evaluate(() => ({
        enlace: getComputedStyle(document.getElementById("a")!).textDecorationLine,
        boton: getComputedStyle(document.getElementById("b")!).textDecorationLine,
        pelado: getComputedStyle(document.getElementById("pelado")!).textDecorationLine,
      })),
  );
  assert.equal(
    medida.enlace,
    medida.boton,
    `un \`<a class="boton">\` se ve "${medida.enlace}" y un \`<button class="boton">\` "${medida.boton}": ` +
      "la misma clase, dos aspectos según la etiqueta",
  );
  assert.equal(medida.enlace, "none", "el botón salió subrayado");
  // La dirección contraria: el arreglo NO puede haberle sacado el subrayado a
  // los enlaces de prosa, que sí lo necesitan.
  assert.equal(
    medida.pelado,
    "underline",
    "un enlace sin clase perdió su subrayado: el arreglo se derramó fuera de `.boton`",
  );
});

/* ══ `.tarjeta` · UNA TARJETA NO ES UN ENLACE AZUL ═══════════════════════
 *
 * v0.4.1, y es la SEGUNDA vez que aparece la misma forma: una clase del canon
 * aplicada a un `<a>` que no neutraliza el estilo de enlace del navegador.
 * `.boton` lo tuvo; `.tarjeta` también, y alcanzaba a tres nodos de Lab —los
 * dos enlaces de fila de Inicio **desde C-a**, y la tarjeta del tablero—.
 *
 * Se mide la misma propiedad que en `.boton`: la clase se ve igual con las dos
 * etiquetas. Y **la dirección contraria**, que acá es más fina: un enlace de
 * PROSA adentro de una tarjeta tiene que conservar lo suyo.
 */
test("`.tarjeta` · la tarjeta-enlace se ve igual que la tarjeta-caja", async () => {
  const medida = await enUnaPagina(
    `<a class="tarjeta tarjeta--interactiva" id="a" href="#">Orden 1042 · Ayala, Carmen</a>
     <div class="tarjeta tarjeta--interactiva" id="d">Orden 1042 · Ayala, Carmen</div>
     <div class="tarjeta" id="c">Texto de la tarjeta con <a id="prosa" href="#">un enlace adentro</a>.</div>`,
    (page) =>
      page.evaluate(() => {
        const a = getComputedStyle(document.getElementById("a")!);
        const d = getComputedStyle(document.getElementById("d")!);
        const p = getComputedStyle(document.getElementById("prosa")!);
        return {
          enlaceColor: a.color,
          enlaceSubrayado: a.textDecorationLine,
          cajaColor: d.color,
          cajaSubrayado: d.textDecorationLine,
          prosaColor: p.color,
          prosaSubrayado: p.textDecorationLine,
        };
      }),
  );
  assert.equal(
    medida.enlaceColor,
    medida.cajaColor,
    `un \`<a class="tarjeta">\` es "${medida.enlaceColor}" y un \`<div class="tarjeta">\` "${medida.cajaColor}": ` +
      "la misma clase, dos colores según la etiqueta",
  );
  assert.equal(medida.enlaceSubrayado, "none", "la tarjeta-enlace salió subrayada");
  assert.equal(medida.enlaceSubrayado, medida.cajaSubrayado);
  // LA DIRECCIÓN CONTRARIA: el arreglo no puede derramarse a la prosa de
  // adentro. Un enlace en medio de una oración sigue siendo un enlace.
  assert.equal(
    medida.prosaSubrayado,
    "underline",
    "un enlace de prosa DENTRO de una tarjeta perdió su subrayado: el arreglo se derramó",
  );
  assert.notEqual(
    medida.prosaColor,
    medida.cajaColor,
    "un enlace de prosa dentro de una tarjeta perdió su color de enlace",
  );
});

/* ══ D2-6 · APILABLE, Y EL `display` DE `.tarjeta` ════════════════════════
 *
 * Las dos partes de O-1 se miden por separado porque protegen cosas distintas.
 */

test("D2-6 · la fila apilable no desborda a 360 con etiqueta larga y botón", async () => {
  const medida = await enUnaPagina(
    `<div style="width:312px"><ul class="lista"><li class="lista__fila lista__fila--apilable" id="f">
       <span>Rodríguez Villalba, María Fernanda</span>
       <span class="lista__der"><span class="lista__meta">hace 2 h</span>
       <a class="boton boton--secundario" href="#">Cargar resultados</a></span>
     </li></ul></div>`,
    (page) =>
      page.evaluate(() => {
        const f = document.getElementById("f")!;
        const caja = f.getBoundingClientRect();
        const fugados: string[] = [];
        for (const n of Array.from(f.querySelectorAll("*"))) {
          const r = n.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          if (r.right > caja.right + 0.5) fugados.push(n.tagName.toLowerCase());
        }
        return {
          direccion: getComputedStyle(f).flexDirection,
          rueda: f.scrollWidth > f.clientWidth,
          fugados,
        };
      }),
  );
  assert.equal(medida.direccion, "column", "a 360 la fila apilable tendría que estar en columna");
  assert.equal(medida.rueda, false, "la fila apilable rueda de costado");
  assert.deepEqual(medida.fugados, [], `se salen de la fila: ${medida.fugados.join(", ")}`);
});

/**
 * O-1 · **LA TARJETA VUELVE AL ALCANCE DE LA COMPUERTA TÁCTIL.**
 *
 * Esto NO se mide en píxeles: lo que se protege es que el nodo **entre en la
 * medición**. Por eso la afirmación es sobre el `display` computado y sobre el
 * predicado exacto que V-4 usa, copiado acá — si el predicado de allá cambia,
 * esta prueba deja de representarlo y hay que traerlo de nuevo.
 */
test("O-1 · un `<a class=\"tarjeta\">` no es `inline`, así que V-4 lo mide", async () => {
  const medida = await enUnaPagina(
    `<div style="width:312px">
       <a class="tarjeta tarjeta--interactiva" id="a" href="#">Folio 1042 · Ayala, Carmen</a>
       <a class="boton boton--primario" id="b" href="#">Activar</a>
     </div>`,
    (page) =>
      page.evaluate(() =>
        ["a", "b"].map((id) => {
          const e = document.getElementById(id)!;
          const s = getComputedStyle(e);
          const r = e.getBoundingClientRect();
          // El predicado de V-4, tal cual está en
          // `lab/tests/helpers/estacion-vestida.ts`.
          const loMide =
            e.tagName === "BUTTON" ||
            e.tagName === "INPUT" ||
            e.tagName === "SELECT" ||
            (e.tagName === "A" && s.display !== "inline");
          return { id, display: s.display, ancho: Math.round(r.width), loMide };
        }),
      ),
  );
  const tarjeta = medida.find((m) => m.id === "a")!;
  assert.notEqual(
    tarjeta.display,
    "inline",
    "`.tarjeta` volvió a no declarar `display`: un `<a>` con esa clase es `inline` y V-4 lo exime",
  );
  assert.equal(tarjeta.loMide, true, "la tarjeta-enlace quedó fuera del alcance de V-4");
  assert.ok(
    tarjeta.ancho > 300,
    `la tarjeta-enlace mide ${tarjeta.ancho}: como \`inline\` medía el largo del texto, no el del slot`,
  );
  // El botón-enlace, que es el caso de los quince: `inline-flex` es un control,
  // no prosa, y con el predicado corregido V-4 lo mide.
  const boton = medida.find((m) => m.id === "b")!;
  assert.equal(boton.display, "inline-flex");
  assert.equal(
    boton.loMide,
    true,
    "`<a class=\"boton\">` quedó exento: el predicado volvió a `startsWith(\"inline\")`",
  );
});
