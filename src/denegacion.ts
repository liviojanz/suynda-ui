/**
 * B.2-21 · MÓDULO SIN ENTITLEMENT — la pieza completa.
 *
 * Hasta D2 este paquete tenía TRES REGLAS DE CSS y ninguna pantalla:
 * `.sin-modulo`, `.sin-modulo__titulo` y `.sin-modulo__cuerpo`. Sin marcado,
 * sin contenedor de salidas y sin copy. Lab la reescribió entera —el calco
 * exacto de 46ch, 18px/600 y 13,5px `--tinta-suave`, más una clase que el
 * paquete no tenía— y el módulo #3 la habría escrito por tercera vez.
 *
 * ── QUÉ ENTRA ACÁ Y QUÉ NO, que es la parte que se piensa mal ─────────────
 *
 * La enmienda de Fase 2 al canon reparte así, y esto la ejecuta:
 *
 *   > la DECISIÓN —causa y salidas— es de `@suynda/modulo`; la PIEZA COMPLETA
 *   > —markup, las dos causas, las salidas y el copy con `{modulo}` como
 *   > parámetro— es de este paquete; el RENDER es del starter.
 *
 * Cuál causa aplica lo decide el módulo a partir de un código de error, que es
 * dominio y no aspecto. Lo que vive acá es **qué se ve en cada una de las dos**.
 *
 * ── LO QUE DE VERDAD SE HEREDA MAL NO ES EL BORDE ─────────────────────────
 *
 * Un módulo nuevo le acierta al 46ch mirando la hoja. Lo que no va a deducir
 * es que **ofrecer «Activar» cuando la negativa vino de la allowlist es
 * mentir**: activar el módulo no lo dejaría entrar igual. El fundador lo pisó
 * en producción el 6-sep, en su espacio «finanzas». Esa distinción viaja con
 * la pieza o no viaja.
 *
 * ── POR QUÉ DEVUELVE UN STRING Y NO CUELGA NODOS ──────────────────────────
 *
 * Al revés que `montarMarco`, esta pantalla **no tiene comportamiento**: es
 * marcado muerto. Y su consumidor principal la sirve desde Node, armada como
 * string, antes de que exista un DOM. Un montador DOM la obligaría a esperar
 * al navegador para dibujar un error que hay que mostrar ya.
 */

/**
 * Las dos causas. NO son la misma y no se dicen igual — el estado
 * `permission-denied` de un módulo las colapsa, y ahí empieza el problema.
 */
export type CausaDeDenegacion =
  /** El ESPACIO no tiene el módulo. Se arregla activándolo. */
  | "sin-modulo"
  /** El espacio puede tenerlo, pero ESTA CUENTA no entra: allowlist o facultades. */
  | "sin-facultad";

/** Lo que la pantalla dice, ya decidido y sin DOM, para que una suite lo vea. */
export interface CopyDeDenegacion {
  readonly titulo: string;
  readonly cuerpo: string;
  /** `true` sólo cuando activar el módulo REALMENTE cambiaría el desenlace. */
  readonly ofreceActivar: boolean;
}

/**
 * El copy de referencia, con el módulo como parámetro.
 *
 * **No es copy nuevo:** es el que ya está en producción en Lab
 * (`src/http/denegacion.ts`), subido al paquete con `{modulo}` parametrizado.
 * Ningún texto se redactó de nuevo al traerlo.
 *
 * **Un módulo puede reemplazar el texto.** Lo que no puede es invertir la regla
 * de salidas: `ofreceActivar` sale de la causa, no del gusto.
 */
export function copyDeDenegacion(causa: CausaDeDenegacion, modulo: string): CopyDeDenegacion {
  if (causa === "sin-modulo") {
    return {
      titulo: `Este espacio no tiene ${modulo} activo`,
      cuerpo:
        `Te equivocaste de espacio, no de producto. Si este es el espacio ` +
        `donde querés trabajar, activá ${modulo} desde el Hub; si no, ` +
        `cambiá de espacio arriba y volvé a entrar.`,
      ofreceActivar: true,
    };
  }
  return {
    titulo: "Tu cuenta todavía no entra acá",
    cuerpo:
      `${modulo} está limitado mientras dura el piloto, o tu cuenta no tiene ` +
      `las facultades de esta área. Activarlo no cambiaría eso: quien ` +
      `administra el espacio te lo habilita desde Equipo, en el Hub.`,
    ofreceActivar: false,
  };
}

export interface OpcionesDeDenegacion {
  readonly causa: CausaDeDenegacion;
  /** El nombre visible del módulo: «Laboratorio», «Depósito». */
  readonly modulo: string;
  /** Origen del Hub. Las salidas se componen contra él, en el servidor. */
  readonly hubOrigen: string;
  /** Para reemplazar el copy de referencia. La regla de salidas no se toca. */
  readonly copy?: CopyDeDenegacion;
}

/** Escape mínimo. La pieza recibe nombres de espacio y de módulo, que son datos. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function haciaElHub(hubOrigen: string, ruta: string): string {
  try {
    return new URL(ruta, hubOrigen).href;
  } catch {
    // Sin origen válido la pantalla NO se cae: la salida queda relativa. Una
    // pantalla de error que revienta por una URL mal formada es peor que el
    // error que estaba mostrando.
    return ruta;
  }
}

/**
 * El marcado canónico de B.2-21.
 *
 * **El título es un `<p class="sin-modulo__titulo">`, no un `<h1>`.** Lab usaba
 * `<h1>` y le colgaba `.sin-acceso h1`, que es una de las nueve reglas de
 * encabezado que D2-9 vino a matar: con la clase puesta, el elemento es libre.
 */
export function htmlDeDenegacion(opciones: OpcionesDeDenegacion): string {
  const copy = opciones.copy ?? copyDeDenegacion(opciones.causa, opciones.modulo);
  // La regla de salidas sale de la CAUSA, no del copy que le pasen: un módulo
  // puede cambiar el texto y no puede ofrecer activar donde activar no sirve.
  const ofrece = opciones.causa === "sin-modulo";
  const activar = ofrece
    ? `<a class="boton boton--primario" href="${escapar(haciaElHub(opciones.hubOrigen, "/activar"))}">Activar ${escapar(opciones.modulo)}</a>`
    : "";
  return (
    `<div class="sin-modulo">` +
    `<p class="sin-modulo__titulo">${escapar(copy.titulo)}</p>` +
    `<p class="sin-modulo__cuerpo">${escapar(copy.cuerpo)}</p>` +
    `<div class="sin-modulo__salidas">${activar}` +
    `<a class="boton boton--secundario" href="${escapar(haciaElHub(opciones.hubOrigen, "/panel"))}">Volver al Hub</a>` +
    `</div></div>`
  );
}
