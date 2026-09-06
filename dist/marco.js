/**
 * EL MONTADOR DEL MARCO — el shell completo, para cualquier consumidor.
 *
 * Hasta v0.2.1 este paquete entregaba la ROPA del shell y cada consumidor
 * escribía el comportamiento: el hub tiene el suyo en `shell.ts` y Lab escribió
 * otro en `marco-script.ts`. Dos implementaciones de lo mismo, ya divergiendo —
 * y el módulo #3 habría escrito la tercera, con los mismos bugs de nuevo.
 *
 * La doctrina que esto ejecuta, firmada el 5-sep-2026:
 *
 *   > El shell vive COMPLETO en @suynda/ui —estructura, medidas y
 *   > comportamiento— y el hub y los módulos lo MONTAN. Ningún repo escribe
 *   > marco propio nunca más.
 *
 * ── POR QUÉ DOM PURO, SIN FRAMEWORK ────────────────────────────────────────
 *
 * Lab sirve HTML armado en Node; el hub es Astro; el próximo puede ser otra
 * cosa. Un componente de framework serviría a uno solo. Esto es una función que
 * recibe un elemento y le cuelga nodos: la sirve Lab como archivo estático, la
 * importa el hub como módulo, y ninguno de los dos tiene que adaptarse.
 *
 * ── POR QUÉ EL PAQUETE NO HABLA CON FOUNDATION ─────────────────────────────
 *
 * El token de sesión vive en una cookie httpOnly: el JS del navegador **nunca
 * lo ve**, y por eso no puede llamar a `/v1/shell` por su cuenta. Cada
 * consumidor tiene su propio BFF que sí puede. Por eso `traerShell` es un
 * parámetro y no una URL cableada acá: el paquete pinta lo que le den.
 */
const CASITA = "Inicio";
const ACTIVAR = "Activar módulo";
const RECARGAR = "Recargar";
/** Cuántos esqueletos se muestran mientras carga. */
const ESQUELETOS = 3;
function el(doc, etiqueta, clase) {
    const nodo = doc.createElement(etiqueta);
    if (clase)
        nodo.className = clase;
    return nodo;
}
/**
 * Las iniciales: primera letra del primer nombre y del último.
 *
 * Mismo criterio que el hub (`shell.ts:87`), para que la misma persona vea las
 * mismas dos letras en el hub y en cada módulo.
 */
export function iniciales(nombre) {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0)
        return "·";
    const primera = partes[0]?.[0] ?? "";
    const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
    return (primera + ultima).toUpperCase() || "·";
}
/**
 * Espera a que las hojas enlazadas estén APLICADAS.
 *
 * Una hoja expone su `.sheet` recién cuando el navegador la aplicó. Sin esta
 * espera, la pregunta «¿este glifo tiene máscara?» corre contra un CSSOM a
 * medio cargar y responde que no para TODOS: en una carga lenta, el riel entero
 * salía marcado como roto. Lo agarró una compuerta de navegador, no una
 * revisión.
 *
 * Si una hoja falla, su `.sheet` queda en `null` y el evento `error` también
 * libera: sin hoja los dibujos no están, y marcarlos rotos es la verdad.
 */
function conHojasAplicadas(doc, seguir) {
    const pendientes = [];
    doc.querySelectorAll("link[rel=stylesheet]").forEach((l) => {
        if (!l.sheet)
            pendientes.push(l);
    });
    if (pendientes.length === 0) {
        seguir();
        return;
    }
    let faltan = pendientes.length;
    const una = () => {
        faltan -= 1;
        if (faltan === 0)
            seguir();
    };
    for (const l of pendientes) {
        l.addEventListener("load", una, { once: true });
        l.addEventListener("error", una, { once: true });
    }
}
function glifoDeModulo(doc, key) {
    const caja = el(doc, "span", "icono-modulo icono-modulo--sobre-riel");
    const glifo = el(doc, "span", `glifo glifo--${key}`);
    caja.appendChild(glifo);
    return caja;
}
function iconoDeTexto(doc, caracter) {
    const caja = el(doc, "span", "riel__icono");
    caja.setAttribute("aria-hidden", "true");
    caja.textContent = caracter;
    return caja;
}
function rotulo(doc, texto) {
    const n = el(doc, "span", "riel__nombre");
    n.textContent = texto;
    return n;
}
function separador(doc) {
    const s = el(doc, "div", "riel__separador");
    s.setAttribute("aria-hidden", "true");
    return s;
}
function itemDeModulo(doc, mod, propio) {
    const enlazable = Boolean(mod.url) && !propio;
    const nodo = enlazable ? el(doc, "a") : el(doc, "div");
    nodo.className =
        "riel__item" +
            (propio ? " riel__item--activo" : "") +
            (!mod.url && !propio ? " riel__item--sin-url" : "");
    if (enlazable && mod.url)
        nodo.setAttribute("href", mod.url);
    if (propio)
        nodo.setAttribute("aria-current", "true");
    nodo.setAttribute("data-modulo", mod.key);
    nodo.appendChild(glifoDeModulo(doc, mod.key));
    nodo.appendChild(rotulo(doc, mod.nombre));
    return nodo;
}
/**
 * EL RIEL — nivel 2.
 *
 * Casita → verticales → división → horizontales → puerta → pie.
 *
 * **Sólo lo activo del espacio.** Lo no contratado no se lista: para descubrir
 * módulos está el hub, y para eso está la puerta del final. Pintar los trece
 * dejaba once ítems muertos indistinguibles de los vivos.
 *
 * **Agrupado por clase, no reordenado.** El `orden` del manifiesto es único
 * DENTRO de cada clase (migración 070: `modules_orden_por_kind_uq`), así que
 * las dos listas arrancan en 10 y el servidor las entrega entrelazadas. Agrupar
 * las separa; dentro de cada grupo se respeta el orden servido tal cual.
 */
function construirRiel(doc, datos, opciones) {
    const riel = el(doc, "aside", "riel");
    riel.setAttribute("aria-label", "Módulos de Suynda");
    riel.setAttribute("data-riel", "");
    if (datos.hubUrl) {
        const casita = el(doc, "a", "riel__item");
        casita.setAttribute("data-riel-casita", "");
        casita.setAttribute("href", datos.hubUrl);
        casita.appendChild(glifoDeModulo(doc, "hub"));
        casita.appendChild(rotulo(doc, CASITA));
        riel.appendChild(casita);
        riel.appendChild(separador(doc));
    }
    const caja = el(doc, "div");
    caja.setAttribute("data-riel-modulos", "");
    const activos = datos.launcher.filter((m) => m.entitled === true);
    const verticales = activos.filter((m) => m.kind === "vertical");
    const horizontales = activos.filter((m) => m.kind !== "vertical");
    for (const mod of verticales)
        caja.appendChild(itemDeModulo(doc, mod, mod.key === opciones.propio));
    if (verticales.length > 0 && horizontales.length > 0)
        caja.appendChild(separador(doc));
    for (const mod of horizontales)
        caja.appendChild(itemDeModulo(doc, mod, mod.key === opciones.propio));
    riel.appendChild(caja);
    if (datos.hubUrl) {
        const mas = el(doc, "a", "riel__item riel__item--mas");
        mas.setAttribute("data-riel-activar", "");
        mas.setAttribute("href", `${datos.hubUrl}#descubri`);
        mas.appendChild(iconoDeTexto(doc, "＋"));
        mas.appendChild(rotulo(doc, ACTIVAR));
        riel.appendChild(mas);
    }
    const pie = opciones.pie;
    if (pie)
        riel.appendChild(construirPie(doc, pie));
    return riel;
}
function construirPie(doc, pie) {
    const abajo = el(doc, "div", "riel__abajo");
    abajo.appendChild(separador(doc));
    const a = el(doc, "a", "riel__item" + (pie.activa ? " riel__item--activo" : ""));
    a.setAttribute("href", pie.href);
    a.setAttribute("data-riel-pie", "");
    a.setAttribute("data-station", pie.id);
    if (pie.activa)
        a.setAttribute("aria-current", "page");
    a.appendChild(iconoDeTexto(doc, "⚙"));
    a.appendChild(rotulo(doc, pie.rotulo));
    abajo.appendChild(a);
    return abajo;
}
/**
 * LA FRANJA — nivel 1.
 *
 * Lo que no tiene dato NO SE DIBUJA. Un «Mi espacio» cableado es
 * indistinguible de un nombre real que nunca llegó, y un avatar sin iniciales
 * es un botón que no dice de quién es.
 */
function poblarFranja(doc, franja, datos, hubUrl) {
    if (datos.espacio) {
        const pildora = el(doc, "button", "franja__pildora");
        pildora.type = "button";
        pildora.setAttribute("data-selector-espacio", "");
        pildora.textContent = datos.espacio;
        franja.insertBefore(pildora, franja.querySelector(".franja__espaciador"));
    }
    if (!datos.usuario)
        return;
    const avatar = el(doc, "button", "franja__avatar");
    avatar.type = "button";
    avatar.setAttribute("data-avatar", "");
    avatar.setAttribute("aria-haspopup", "true");
    avatar.setAttribute("aria-expanded", "false");
    avatar.setAttribute("aria-label", "Abrir el menú de tu cuenta");
    avatar.textContent = iniciales(datos.usuario);
    franja.appendChild(avatar);
    const menu = el(doc, "div", "menu-avatar");
    menu.setAttribute("data-menu-avatar", "");
    menu.hidden = true;
    const quien = el(doc, "div", "menu-avatar__quien");
    const b = el(doc, "b");
    b.textContent = datos.usuario;
    quien.appendChild(b);
    menu.appendChild(quien);
    if (hubUrl) {
        const raizDelHub = new URL(hubUrl);
        const enlace = (href, texto) => {
            const a = el(doc, "a");
            a.setAttribute("href", href);
            a.textContent = texto;
            return a;
        };
        menu.appendChild(enlace(new URL("/configuracion", raizDelHub).href, "Mis datos"));
        menu.appendChild(enlace(`${hubUrl}#espacios`, "Mis espacios"));
        // LA SALIDA ES DE LA PLATAFORMA, no del módulo: la cookie de sesión es
        // suya y un módulo jamás borra cookies ajenas — errarle al `Domain` no da
        // un error, da un borrado silencioso, y el usuario cree que salió.
        const salir = el(doc, "a", "menu-avatar__salir");
        salir.setAttribute("href", new URL("/salir", raizDelHub).href);
        salir.setAttribute("data-salir", "");
        salir.textContent = "Cerrar sesión";
        menu.appendChild(salir);
    }
    franja.appendChild(menu);
    const alternar = () => {
        const abierto = !menu.hidden;
        menu.hidden = abierto;
        avatar.setAttribute("aria-expanded", String(!abierto));
    };
    avatar.addEventListener("click", (evento) => {
        evento.stopPropagation();
        alternar();
    });
    doc.addEventListener("click", () => {
        if (!menu.hidden)
            alternar();
    });
    doc.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !menu.hidden)
            alternar();
    });
}
/**
 * LA BARRA DE ESTADO — nivel 4, B.2-16.
 *
 * El contenido ES el saldo: el paquete trae `--bajo` y `--sobregiro` como
 * modificadores suyos. Por eso sin saldo no se dibuja — una barra de saldo sin
 * saldo miente. Y son CRÉDITOS: una versión anterior los pintó como «₲ 0», una
 * unidad inventada sobre un dato real, que es peor que no mostrarlo.
 */
function construirBarraDeEstado(doc, saldo, urlDeRecarga) {
    const barra = el(doc, "footer", "barra-estado");
    barra.classList.add(saldo.enSobregiro ? "barra-estado--sobregiro" : saldo.bajo ? "barra-estado--bajo" : "barra-estado--normal");
    barra.setAttribute("data-barra-estado", "");
    barra.appendChild(el(doc, "div", "barra-estado__spacer"));
    const grupo = el(doc, "div", "barra-estado__grupo");
    const dato = el(doc, "span", "barra-estado__dato");
    dato.setAttribute("data-creditos", "");
    dato.textContent = `⬢ ${saldo.valor.toLocaleString("es-PY")} créditos`;
    grupo.appendChild(dato);
    if (urlDeRecarga) {
        const recargar = el(doc, "a", "barra-estado__accion");
        recargar.setAttribute("href", urlDeRecarga);
        recargar.setAttribute("data-recargar", "");
        recargar.textContent = RECARGAR;
        grupo.appendChild(recargar);
    }
    barra.appendChild(grupo);
    return barra;
}
function construirTabs(doc, tabs, rotuloDeTabs) {
    const nav = el(doc, "nav", "tabs");
    nav.setAttribute("aria-label", rotuloDeTabs);
    for (const tab of tabs) {
        const a = el(doc, "a", "tab" + (tab.activa ? " tab--activa" : ""));
        a.setAttribute("href", tab.href);
        a.setAttribute("data-station", tab.id);
        if (tab.activa)
            a.setAttribute("aria-current", "page");
        a.textContent = tab.rotulo;
        nav.appendChild(a);
    }
    return nav;
}
/**
 * MONTA EL MARCO.
 *
 * Nunca lanza. Si el shell no responde, el módulo queda entero con su franja,
 * sus tabs y su contenido — lo único que se pierde es el riel de módulos.
 * **El marco jamás mata al módulo.**
 */
export function montarMarco(opciones) {
    const doc = opciones.raiz.ownerDocument;
    // La raiz la da el consumidor y suele ser un `<div>` sin alto. Se le pone la
    // clase para que el `height: 100%` del shell tenga contra que resolver: si
    // no, la columna crece con el contenido y el scroll se lo lleva la pagina.
    opciones.raiz.classList.add("marco-raiz");
    const shell = el(doc, "div", "shell");
    const franja = el(doc, "header", "franja");
    franja.setAttribute("data-franja", "");
    const wordmark = el(doc, "span", "franja__wordmark");
    wordmark.textContent = "suynda";
    franja.appendChild(wordmark);
    franja.appendChild(el(doc, "span", "franja__espaciador"));
    shell.appendChild(franja);
    const cuerpo = el(doc, "div", "shell__cuerpo");
    cuerpo.setAttribute("data-shell-cuerpo", "");
    // EL ESQUELETO ocupa el lugar del riel desde el principio. Un riel que
    // aparece de golpe tarde salta la vista; uno que ya tenía su lugar, no.
    const esqueleto = el(doc, "aside", "riel");
    esqueleto.setAttribute("aria-hidden", "true");
    esqueleto.setAttribute("data-riel-esqueleto", "");
    for (let i = 0; i < ESQUELETOS; i += 1) {
        const hueso = el(doc, "div", "esqueleto");
        hueso.style.cssText = "width:32px;height:32px;border-radius:9px;margin:6px auto";
        esqueleto.appendChild(hueso);
    }
    cuerpo.appendChild(esqueleto);
    const columna = el(doc, "div", "marco-columna");
    columna.setAttribute("data-marco-columna", "");
    const tabs = opciones.tabs ?? [];
    if (tabs.length > 0) {
        columna.appendChild(construirTabs(doc, tabs, opciones.rotuloDeTabs ?? "Secciones"));
    }
    const main = el(doc, "main", "main");
    main.setAttribute("data-marco-contenido", "");
    main.appendChild(opciones.contenido);
    columna.appendChild(main);
    cuerpo.appendChild(columna);
    shell.appendChild(cuerpo);
    opciones.raiz.appendChild(shell);
    const esperarHojas = opciones.alAplicarseLasHojas ?? ((seguir) => conHojasAplicadas(doc, seguir));
    const listo = opciones
        .traerShell()
        .then((datos) => {
        if (!datos || !Array.isArray(datos.launcher)) {
            esqueleto.remove();
            // El pie es del MÓDULO: una caída de la plataforma no puede llevárselo
            // puesto. Queda un riel mínimo con él y nada más.
            if (opciones.pie) {
                const minimo = el(doc, "aside", "riel");
                minimo.setAttribute("data-riel", "");
                minimo.setAttribute("data-riel-minimo", "");
                minimo.appendChild(construirPie(doc, opciones.pie));
                cuerpo.insertBefore(minimo, columna);
            }
            return;
        }
        const riel = construirRiel(doc, datos, opciones);
        cuerpo.insertBefore(riel, esqueleto);
        esqueleto.remove();
        poblarFranja(doc, franja, datos, datos.hubUrl ?? null);
        if (datos.saldo && typeof datos.saldo.valor === "number") {
            shell.appendChild(construirBarraDeEstado(doc, datos.saldo, opciones.urlDeRecarga ?? null));
        }
        // EL DIBUJO FALTANTE SE VE ROTO — y se decide DESPUÉS de montar, mirando
        // si la hoja le dio una máscara. Así no hay que mantener en cada
        // consumidor una lista de keys que se desactualizaría sola.
        esperarHojas(() => {
            riel.querySelectorAll("[data-riel-modulos] .glifo").forEach((g) => {
                const css = getComputedStyle(g);
                const mascara = css.maskImage || css.webkitMaskImage;
                if (!mascara || mascara === "none")
                    g.className = "glifo glifo--sin-dibujo";
            });
        });
    })
        .catch(() => {
        esqueleto.remove();
    });
    return {
        listo,
        destruir() {
            shell.remove();
        },
    };
}
