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
/** Un ítem del launcher, tal como lo sirve `/v1/shell` a través del BFF. */
export interface ModuloServido {
    readonly key: string;
    readonly nombre: string;
    readonly entitled?: boolean;
    /** `vertical` | `horizontal`. Decide de qué lado de la división va. */
    readonly kind?: string | null;
    /** `null` cuando el módulo no tiene destino desplegado todavía. */
    readonly url?: string | null;
}
export interface SaldoServido {
    /** CRÉDITOS, no dinero. Sale del libro de créditos de Foundation. */
    readonly valor: number;
    readonly bajo?: boolean;
    readonly enSobregiro?: boolean;
}
/** Lo que el BFF del consumidor devuelve. Todo opcional salvo el launcher. */
export interface ShellServido {
    readonly launcher: readonly ModuloServido[];
    readonly hubUrl?: string | null;
    /** Razón social del espacio activo, para la píldora de la franja. */
    readonly espacio?: string | null;
    /** Nombre de quien está en sesión, para las iniciales del avatar. */
    readonly usuario?: string | null;
    readonly saldo?: SaldoServido | null;
}
/** Una sección del módulo — nivel 3, que es del módulo y no del marco. */
export interface TabDelModulo {
    readonly id: string;
    readonly rotulo: string;
    readonly href: string;
    readonly activa?: boolean;
}
/** La entrada al pie del riel: la Configuración del módulo. */
export interface PieDelRiel {
    readonly id: string;
    readonly rotulo: string;
    readonly href: string;
    readonly activa?: boolean;
}
export interface OpcionesDelMarco {
    /** Dónde se monta. El paquete no elige dónde vive. */
    readonly raiz: HTMLElement;
    /** El shell servido por el BFF del consumidor. Nunca debe lanzar. */
    readonly traerShell: () => Promise<ShellServido | null>;
    /** La key de ESTE módulo, para pintarlo una vez y marcarlo activo. */
    readonly propio: string;
    /** Las secciones del módulo. Vacío para el hub, que no tiene sub-barra. */
    readonly tabs?: readonly TabDelModulo[];
    /** El pie del riel, o `null` si este actor no lo ve. */
    readonly pie?: PieDelRiel | null;
    /** El nodo con la pantalla. Se cuelga del slot del contenido. */
    readonly contenido: Node;
    /** Rótulo de la barra de tabs, para lectores de pantalla. */
    readonly rotuloDeTabs?: string;
    /** Adónde va «Recargar». Sin esto, el enlace no se dibuja. */
    readonly urlDeRecarga?: string | null;
    /** Para los tests: reemplaza la espera de las hojas. */
    readonly alAplicarseLasHojas?: (seguir: () => void) => void;
}
export interface MarcoMontado {
    /** Saca el marco y deja la raíz como estaba. */
    destruir(): void;
    /** Promesa que resuelve cuando el shell terminó de pintarse (o de fallar). */
    readonly listo: Promise<void>;
}
/**
 * Las iniciales: primera letra del primer nombre y del último.
 *
 * Mismo criterio que el hub (`shell.ts:87`), para que la misma persona vea las
 * mismas dos letras en el hub y en cada módulo.
 */
export declare function iniciales(nombre: string): string;
/**
 * MONTA EL MARCO.
 *
 * Nunca lanza. Si el shell no responde, el módulo queda entero con su franja,
 * sus tabs y su contenido — lo único que se pierde es el riel de módulos.
 * **El marco jamás mata al módulo.**
 */
export declare function montarMarco(opciones: OpcionesDelMarco): MarcoMontado;
