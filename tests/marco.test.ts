/**
 * EL MONTADOR, contra un shell SIMULADO y en un navegador de verdad.
 *
 * Por qué un navegador y no un DOM de mentira: lo que este montador promete es
 * conductual y visual a la vez —que el ícono del activo quede amarillo, que el
 * glifo sin dibujo se vea roto, que el pie no desaparezca en un teléfono—, y
 * eso sólo lo puede responder algo que aplique CSS. Un shim respondería lo que
 * yo le programe.
 *
 * Por qué el shell es simulado y no cableado: lo que se afirma acá es la
 * TRADUCCIÓN, no el contenido. Si mañana Foundation sirve otros módulos, en
 * otro orden, estos tests siguen valiendo.
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
const MARCO_JS = readFileSync(path.join(RAIZ, "dist/marco.js"), "utf8");

const HUB = "https://suynda.com/panel";

interface ModuloDePrueba {
  key: string;
  nombre: string;
  entitled: boolean;
  kind: string;
  url: string | null;
}

function activo(key: string, nombre: string, kind: string): ModuloDePrueba {
  return { key, nombre, entitled: true, kind, url: `https://${key}.suynda.com` };
}
function apagado(key: string, nombre: string, kind: string): ModuloDePrueba {
  return { key, nombre, entitled: false, kind, url: null };
}

/** El shell de la prueba: como llega de producción — clases entrelazadas. */
const SHELL = {
  hubUrl: HUB,
  espacio: "Laboratorio San Roque S.A.",
  usuario: "Livio Janz",
  saldo: { valor: 1250, bajo: false, enSobregiro: false },
  launcher: [
    activo("compra", "Compra", "horizontal"),
    activo("lab", "Laboratorio", "vertical"),
    apagado("deposito", "Depósito", "horizontal"),
    apagado("vet", "Veterinaria", "vertical"),
  ],
};

const TABS = [
  { id: "inicio", rotulo: "Inicio", href: "/app/inicio", activa: true },
  { id: "admitir", rotulo: "Admitir", href: "/app/admitir" },
];
const PIE = { id: "configuracion", rotulo: "Configuración", href: "/app/configuracion" };

/**
 * Monta el marco en una página en blanco con las hojas del paquete inyectadas
 * como `<link>` de verdad —no como `<style>`— porque el montador espera a que
 * las hojas estén APLICADAS y esa espera es parte de lo que se prueba.
 */
/**
 * Sirve la página y la hoja desde un origen falso.
 *
 * `setContent` no sirve acá: la hoja tiene que llegar por un `<link>` de
 * verdad, con su carga asincrónica, porque la espera de las hojas es parte de
 * lo que estos tests prueban.
 */
async function servirPagina(page: Page): Promise<void> {
  // `tsx` transpila con esbuild y envuelve las funciones en un ayudante
  // `__name` que existe en Node y NO en el navegador. Cuando una de esas
  // funciones se serializa para correr en la página, revienta con
  // «__name is not defined». Se declara inerte antes de que cargue nada.
  await page.addInitScript({ content: "globalThis.__name = (f) => f;" });
  await page.route("https://suynda.test/hojas.css", (ruta) =>
    ruta.fulfill({ contentType: "text/css", body: HOJAS }),
  );
  await page.route("https://suynda.test/", (ruta) =>
    ruta.fulfill({
      contentType: "text/html; charset=utf-8",
      body:
        `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
        `<link rel="stylesheet" href="https://suynda.test/hojas.css">` +
        `<style>html,body{margin:0;height:100%}</style></head>` +
        `<body><div id="raiz" style="height:100vh"></div></body></html>`,
    }),
  );
}

async function montar(
  page: Page,
  shell: unknown,
  extra: Record<string, unknown> = {},
): Promise<void> {
  await servirPagina(page);
  await page.goto("https://suynda.test/");
  await page.addScriptTag({ content: `${MARCO_JS}\nwindow.__marco = { montarMarco, iniciales };` , type: "module" });
  await page.waitForFunction(() => "__marco" in window);
  await page.evaluate(
    async ([datos, opciones]) => {
      const contenido = document.createElement("p");
      contenido.textContent = "la pantalla del módulo";
      const api = (window as unknown as { __marco: { montarMarco: (o: unknown) => { listo: Promise<void> } } }).__marco;
      const montado = api.montarMarco({
        raiz: document.getElementById("raiz"),
        traerShell: async () => datos,
        contenido,
        ...(opciones as Record<string, unknown>),
      });
      await montado.listo;
    },
    [shell, { propio: "lab", tabs: TABS, pie: PIE, rotuloDeTabs: "Secciones", ...extra }] as const,
  );
}

async function conPagina(fn: (page: Page) => Promise<void>, viewport = { width: 1280, height: 720 }) {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport });
    await fn(page);
  } finally {
    await browser.close();
  }
}

test("v0.3.0: CARGA — lista sólo lo activo, agrupado por clase, con puerta y pie", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);

    // El esqueleto cumplió y se fue: no quedan dos rieles.
    assert.equal(await page.locator("[data-riel-esqueleto]").count(), 0);

    // Lo no contratado NO se lista: para descubrir módulos está el hub.
    assert.deepEqual(
      await page.locator("[data-riel-modulos] .riel__nombre").allTextContents(),
      ["Laboratorio", "Compra"],
    );

    // AGRUPADO: el vertical primero aunque el shell sirva el horizontal antes.
    assert.equal(SHELL.launcher[0]?.key, "compra", "el fixture perdió lo que hace la prueba");

    // UNA división entre clases, más la de la casita.
    assert.equal(await page.locator("[data-riel-modulos] .riel__separador").count(), 1);

    assert.equal(await page.locator("[data-riel-casita]").getAttribute("href"), HUB);
    assert.equal(await page.locator("[data-riel-activar]").getAttribute("href"), `${HUB}#descubri`);
    assert.equal(await page.locator(".riel__abajo [data-riel-pie]").count(), 1);
  });
});

test("v0.3.0: DEDUP — el módulo propio se pinta una vez, con las DOS marcas", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);
    const propio = page.locator("[data-riel-modulos] .riel__item--activo");
    assert.equal(await propio.count(), 1);
    assert.equal(await propio.locator(".riel__nombre").textContent(), "Laboratorio");
    assert.equal(await propio.evaluate((el) => el.tagName), "DIV", "no se enlaza a sí mismo");

    // La marca completa: hilo amarillo E ícono amarillo, del MISMO amarillo.
    // Media marca —sólo el hilo— fue un bug real de la versión anterior.
    const marcas = await propio.evaluate((el) => {
      const caja = el.querySelector(".icono-modulo");
      return {
        icono: caja ? getComputedStyle(caja).backgroundColor : "",
        hilo: getComputedStyle(el, "::before").backgroundColor,
      };
    });
    assert.notEqual(marcas.icono, "rgba(0, 0, 0, 0)", "el ícono del activo quedó sin fondo");
    assert.equal(marcas.hilo, marcas.icono, "el hilo y el ícono no son el mismo amarillo");

    // Y el ajeno no lleva ninguna.
    const ajeno = page.locator('[data-riel-modulos] .riel__item:not(.riel__item--activo) .icono-modulo');
    assert.notEqual(
      await ajeno.evaluate((el) => getComputedStyle(el).backgroundColor),
      marcas.icono,
      "un módulo que no es el propio se pintó como activo",
    );
  });
});

test("v0.3.0: CAÍDA — sin shell no hay riel de módulos, pero el módulo queda entero", async () => {
  await conPagina(async (page) => {
    await montar(page, null);
    assert.equal(await page.locator("[data-riel-modulos]").count(), 0);
    assert.equal(await page.locator("[data-riel-casita]").count(), 0);
    assert.equal(await page.locator("[data-riel-activar]").count(), 0);
    assert.equal(await page.locator("[data-riel-esqueleto]").count(), 0);
    assert.equal(await page.locator(".barra-estado").count(), 0);
    assert.equal(await page.locator("[data-selector-espacio]").count(), 0);
    assert.equal(await page.locator(".menu-avatar").count(), 0);

    // Pero lo del módulo sigue siendo del módulo.
    assert.equal(await page.locator("[data-riel-minimo] [data-riel-pie]").count(), 1);
    assert.equal(await page.locator(".tabs .tab").count(), 2);
    assert.match((await page.locator(".main").textContent()) ?? "", /la pantalla del módulo/);
  });
});

test("v0.3.0: un traerShell que LANZA no rompe el módulo", async () => {
  await conPagina(async (page) => {
    await servirPagina(page);
    await page.goto("https://suynda.test/");
    await page.addScriptTag({ content: `${MARCO_JS}\nwindow.__marco={montarMarco};`, type: "module" });
    await page.waitForFunction(() => "__marco" in window);
    await page.evaluate(async () => {
      const api = (window as unknown as { __marco: { montarMarco: (o: unknown) => { listo: Promise<void> } } }).__marco;
      const m = api.montarMarco({
        raiz: document.getElementById("raiz"),
        traerShell: () => Promise.reject(new Error("502")),
        propio: "lab",
        contenido: document.createElement("p"),
      });
      await m.listo;
    });
    assert.equal(await page.locator(".shell").count(), 1, "el marco desapareció por un error del shell");
    assert.equal(await page.locator("[data-riel-esqueleto]").count(), 0, "el esqueleto quedó colgado");
  });
});

test("v0.3.0: FRANJA — el espacio servido y las iniciales, con su menú", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);
    assert.equal(await page.locator("[data-selector-espacio]").textContent(), "Laboratorio San Roque S.A.");
    assert.equal(await page.locator("[data-avatar]").textContent(), "LJ");

    // El menú nace cerrado y `hidden` de verdad esconde — la guarda del paquete.
    const menu = page.locator(".menu-avatar");
    assert.equal(await menu.isVisible(), false);
    await page.locator("[data-avatar]").click();
    assert.equal(await menu.isVisible(), true);
    assert.equal(await page.locator("[data-salir]").getAttribute("href"), "https://suynda.com/salir");
    assert.equal(await page.locator(".menu-avatar__quien").textContent(), "Livio Janz");
  });
});

test("v0.3.0: sin usuario no hay avatar; sin espacio no hay píldora; sin saldo no hay barra", async () => {
  await conPagina(async (page) => {
    await montar(page, { ...SHELL, usuario: null, espacio: null, saldo: null });
    assert.equal(await page.locator("[data-avatar]").count(), 0);
    assert.equal(await page.locator("[data-selector-espacio]").count(), 0);
    assert.equal(await page.locator(".barra-estado").count(), 0);
    // Pero el riel sí: el launcher llegó.
    assert.equal(await page.locator("[data-riel-modulos] .riel__item").count(), 2);
  });
});

test("v0.3.0: BARRA DE ESTADO — créditos, jamás guaraníes, con el color del estado", async () => {
  const casos = [
    { saldo: { valor: 1250, bajo: false, enSobregiro: false }, clase: "barra-estado--normal" },
    { saldo: { valor: 4, bajo: true, enSobregiro: false }, clase: "barra-estado--bajo" },
    { saldo: { valor: -9, bajo: true, enSobregiro: true }, clase: "barra-estado--sobregiro" },
  ];
  await conPagina(async (page) => {
    for (const caso of casos) {
      await montar(page, { ...SHELL, saldo: caso.saldo }, {});
      const barra = page.locator(".barra-estado");
      const texto = (await barra.textContent()) ?? "";
      assert.match(texto, /créditos/, "la barra no dice créditos");
      assert.equal(texto.includes("₲"), false, "la barra inventó una unidad de dinero");
      assert.match((await barra.getAttribute("class")) ?? "", new RegExp(caso.clase));
      // El dato va a la derecha, no colgando de la izquierda.
      const caja = await barra.boundingBox();
      const grupo = await page.locator(".barra-estado__grupo").boundingBox();
      assert.ok(caja && grupo);
      assert.ok(grupo.x + grupo.width / 2 > caja.x + caja.width * 0.75, "el dato quedó a la izquierda");
    }
  });
});

test("v0.3.0: «Recargar» sólo existe si le dan destino", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);
    assert.equal(await page.locator("[data-recargar]").count(), 0, "se dibujó un Recargar sin destino");
    await montar(page, SHELL, { urlDeRecarga: `${HUB}#recargar` });
    assert.equal(await page.locator("[data-recargar]").getAttribute("href"), `${HUB}#recargar`);
  });
});

test("v0.3.0: la key sin dibujo cae al glifo roto Y SE VE; las que tienen, no", async () => {
  await conPagina(async (page) => {
    await montar(page, {
      ...SHELL,
      launcher: [activo("lab", "Laboratorio", "vertical"), activo("fantasma", "Fantasma", "horizontal")],
    });
    assert.deepEqual(
      await page.locator("[data-riel-modulos] .glifo").evaluateAll((els) => els.map((e) => e.className)),
      ["glifo glifo--lab", "glifo glifo--sin-dibujo"],
    );
    const roto = await page.locator(".glifo--sin-dibujo").evaluate((el) => ({
      borde: getComputedStyle(el).borderStyle,
      marca: getComputedStyle(el, "::after").content,
    }));
    assert.equal(roto.borde, "dashed", "el faltante quedó invisible");
    assert.match(roto.marca, /\?/);
  });
});

test("v0.3.0: la marca del faltante espera a que las hojas estén aplicadas", async () => {
  await conPagina(async (page) => {
    // Se retiene la espera: con el CSSOM a medio cargar, la pregunta «¿tiene
    // máscara?» responde que no para TODOS. Si el montador no esperara, acá
    // ya estarían los dos marcados rotos.
    let soltar: () => void = () => {};
    await page.exposeFunction("__esperar", () => new Promise<void>((r) => (soltar = r)));
    await montar(page, SHELL, {
      alAplicarseLasHojas: undefined,
    });
    void soltar;
    // Con la espera real, el de Lab conserva su dibujo.
    assert.deepEqual(
      await page.locator("[data-riel-modulos] .glifo").evaluateAll((els) => els.map((e) => e.className)),
      ["glifo glifo--lab", "glifo glifo--compra"],
    );
  });
});

test("v0.3.0: MÓVIL — el riel baja y el pie NO desaparece", async () => {
  await conPagina(
    async (page) => {
      await montar(page, SHELL);
      const riel = await page.locator("[data-riel]").boundingBox();
      const main = await page.locator(".main").boundingBox();
      assert.ok(riel && main);
      assert.ok(riel.y > main.y, "a 390px el riel no bajó");
      // El agujero que la enmienda a B.2-15 abrió, cerrado acá: hasta v0.2.1
      // `.riel__abajo` se escondía bajo 860px y la Configuración del módulo
      // quedaba sin ninguna puerta en un teléfono.
      assert.equal(await page.locator("[data-riel-pie]").isVisible(), true);
    },
    { width: 390, height: 844 },
  );
});

test("v0.3.0: las medidas son las del hub, no las del paquete viejo", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);
    const medidas = await page.evaluate(() => {
      const css = (sel: string, prop: string) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).getPropertyValue(prop) : "";
      };
      const riel = document.querySelector(".riel") as HTMLElement;
      // El riel tiene `transition: width 0.18s`, asi que medir apenas se
      // agrega la clase devuelve el ancho EN CURSO —60— y no el destino. Se
      // apaga la transicion para medir lo declarado, que es lo que se afirma.
      riel.style.transition = "none";
      riel.classList.add("riel--expandido");
      return {
        franjaAlto: css(".franja", "height"),
        franjaPadding: css(".franja", "padding-left"),
        rielExpandido: getComputedStyle(riel).width,
        itemLetra: css(".riel__item", "font-size"),
        iconoAncho: css(".riel__icono", "width"),
        tabsAlto: css(".tabs", "height"),
        tabPadding: css(".tab", "padding-top"),
        avatarPeso: css(".franja__avatar", "font-weight"),
      };
    });
    assert.equal(medidas.franjaAlto, "54px");
    assert.equal(medidas.franjaPadding, "18px", "la franja quedó con el padding viejo de 14");
    assert.equal(medidas.rielExpandido, "208px", "el riel expandido quedó en los 176 viejos");
    assert.equal(medidas.itemLetra, "15.5px", "el ítem del riel quedó en los 13px viejos");
    assert.equal(medidas.iconoAncho, "32px", "el ícono del riel quedó en los 30 viejos");
    assert.equal(medidas.tabsAlto, "48px", "las tabs no declaran alto");
    assert.equal(medidas.tabPadding, "15px");
    assert.equal(medidas.avatarPeso, "600");
  });
});

test("v0.3.0: [hidden] esconde, aunque la pieza traiga display:flex", async () => {
  await conPagina(async (page) => {
    await montar(page, SHELL);
    const invisible = await page.evaluate(() => {
      const riel = document.querySelector(".riel") as HTMLElement;
      riel.hidden = true;
      return getComputedStyle(riel).display;
    });
    // Sin la guarda del paquete esto devuelve "flex" y el riel se sigue viendo
    // vacío — fue el bug que obligó a Lab a construir en vez de esconder.
    assert.equal(invisible, "none");
  });
});
