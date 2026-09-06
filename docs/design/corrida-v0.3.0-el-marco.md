# Corrida v0.3.0 — el marco completo vive en el paquete

**Estado:** diseño, sin firmar · **Repo:** `suynda-ui` · **Base:** `v0.2.1` (`ac89bce`)
**Origen:** la corrección del fundador del 5-sep-2026, después de mirar Lab y el
hub uno al lado del otro.

---

## 0. La doctrina que esta corrida ejecuta

> **El shell vive COMPLETO en `@suynda/ui` — estructura, medidas y
> comportamiento — y el hub y los módulos lo MONTAN. Ningún repo escribe marco
> propio nunca más.**

Lo que se venía haciendo era lo contrario, y el fundador lo nombró así: *«no
entiendo cómo empezamos otra vez a construir cosas que solo usa Lab y después
debemos construirlo nuevamente para cada módulo»*. Tenía razón, y el mecanismo
que lo permitió está identificado — ver §6.

### Cómo pasó, para que no vuelva a pasar

La compuerta de UI-2V decía **«cero CSS propio»**. Cada vez que Lab chocó contra
una pieza que el paquete no tenía, en vez de **frenar y ponerla en el paquete**
se la puso en el `<style>` de Lab con un comentario que la llamaba «hueco
declarado, candidato a pieza». Pasó cuatro veces. Declarar el desvío no es
evitarlo.

Y lo más grande ni siquiera pasó por esa decisión: **`marco-script.ts` —las ~200
líneas de comportamiento— se escribió adentro de Lab desde el primer minuto**,
sin preguntar de quién era. Ahí no hubo desvío declarado: hubo un supuesto que
nunca se puso a prueba.

**La regla que entra a la doctrina:** cuando un módulo necesita una pieza del
marco que el paquete no tiene, **la corrida se detiene y la pieza entra al
paquete primero**. Nunca al `<style>` del módulo, ni siquiera «por ahora».

---

## 1. El recon, con citas

### 1.1 · El hallazgo que ordena todo lo demás

**El hub NO consume `@suynda/ui`.** Verificado: `grep '@suynda/ui'` sobre su
`package.json` y su `src/` no devuelve nada. Tiene su propio CSS con los mismos
nombres de clase, en los `<style>` de `Franja.astro`, `Riel.astro`,
`SubBarra.astro` y `BarraEstado.astro`.

Son **dos implementaciones del mismo canon que derivaron**. Reconciliar números
sin que el hub adopte el paquete las deja más parecidas y nada las ata: se
volverían a separar.

### 1.2 · Regla de precedencia, firmada por el fundador

> **Lo visual y dimensional: gana el hub** — es lo que se mira y se aprueba
> todos los días; el papel se corrige a la realidad aprobada, no al revés.
>
> **Lo que el hub todavía no maneja: gana el paquete.**

### 1.3 · La tabla de números finales

Fuente: las hojas que producen cada lado. **No se midieron estilos computados
del hub vivo porque `suynda.com/panel` exige sesión**; para estas propiedades
—ancho, alto, tipografía, padding— las declaraciones son directas, sin herencia
de por medio. La columna «v0.3.0» es lo que el paquete pasa a declarar.

| pieza | hub (fuente) | paquete hoy | **v0.3.0** |
|---|---|---|---|
| franja alto | 54px `Franja.astro` | 54px `piezas.css:346` | 54px |
| franja padding · gap | `0 18px` · 12px | `0 14px` · 10px | **`0 18px` · 12px** |
| avatar | 32×32 · peso **600** · `border: 2px solid transparent` | 32×32 · peso **700** · sin borde | **600 · borde 2px** |
| riel reposo | 60px | 60px `piezas.css:398` | 60px |
| **riel expandido** | **208px** `Riel.astro:58` | **176px** `piezas.css:413` | **208px** |
| riel ítem padding · gap · margin | `9px 0 9px 8px` · 14px · `1px 6px` | `10px 0 10px 7px` · 12px · `1px 8px` | **los del hub** |
| **riel ítem tipografía** | `--tx-chrome` = **15.5px** | **13px** | **`--tx-chrome`** |
| **riel ícono** | 32×32 · radio 9 · font 16 | 30×30 · radio 8 · font 15 | **32 · 9 · 16** |
| separador margen | `8px 14px` | `8px 16px` | **`8px 14px`** |
| **tabs contenedor** | alto **48px** · padding `0 22px` | **no declara ninguno** | **48px · `0 22px`** |
| **tab** | `15px 11px 11px` | `10px 12px` | **`15px 11px 11px`** |
| tab hilo activo | 3px | 3px | 3px |
| barra-estado | 40px · `0 18px` · `--tx-xs` | ídem | ídem |
| tokens `--tx-base/chrome/xs` | 17 / 15.5 / 14.5 | 17 / 15.5 / 14.5 | iguales |

**Advertencia de método:** no se sacan conclusiones midiendo píxeles de las
capturas. Ya falló una vez en esta serie —los separadores del riel se dieron por
ausentes cuando estaban, porque son líneas de 1px—, y dos capturas pueden estar
a zoom distinto. Lo que sostiene esta tabla son las hojas.

### 1.4 · Donde el hub está atrás, y el paquete gana

| tema | hub | paquete / Lab |
|---|---|---|
| **íconos** | `MODULE_ICONS = { compra: '🧾', lab: '🧪' }` y `'▦'` para el resto (`shell.ts:72,158`) — **conoce 2 de 13** | 14 dibujos reales con máscara, más `glifo--sin-dibujo` visible para la key que falta |
| **destino** | `MODULE_URLS` **cableado** en `config.ts`; ignora el `url` que `/v1/shell` sirve desde UI-0a-bis | compone del `url` servido |
| **orden** | pinta en el orden de llegada; sin división por clase | agrupa vertical → horizontal, respetando el orden servido dentro de cada clase |
| **carga** | sin esqueleto | esqueleto B.2-10 mientras carga |
| **caída** | `if (!cont) return` — se corta sin dejar rastro | devuelve `null`, deja la causa en el log **sin el token**, y el módulo opera entero |
| **módulo propio** | no tiene noción | se pinta **una** vez, marcado activo |

**Síntesis de la corrida: el montador lleva el comportamiento de Lab con la ropa
medida del hub.**

---

## 2. El montador — el contrato

El pedazo que hace que el módulo #3 no reescriba nada. **DOM puro, sin
framework**, para que sirva a Lab (HTML servido desde Node) y al hub (Astro).

```
montarMarco(opciones) → { destruir() }
```

### Qué RECIBE

| campo | qué es | por qué lo da el consumidor y no el paquete |
|---|---|---|
| `raiz` | el elemento donde se monta | el paquete no elige dónde vive |
| `traerShell()` | promesa con el shell servido | **cada módulo tiene su propio BFF**: el token va en cookie httpOnly y el JS nunca lo ve. Lab lo sirve en `/api/shell`; el hub en el suyo. El paquete no habla con Foundation. |
| `propio` | la key de este módulo | para pintarlo una vez y marcarlo activo |
| `tabs[]` | las secciones del módulo (id, rótulo, href, activa) | **nivel 3 es del módulo**, no del marco |
| `pie` | la entrada al pie del riel, o `null` | Configuración del módulo (D1 enmendada) |
| `contenido` | el slot donde va la pantalla | el marco no sabe qué se pinta adentro |

### Qué GARANTIZA

Todo lo conductual que hoy vive en `marco-script.ts` de Lab, más lo visual medido
del hub:

1. Esqueleto mientras carga; nunca un riel que aparece de golpe tarde.
2. **El marco jamás mata al módulo**: si el shell no responde, no hay riel de
   módulos, el módulo opera entero, y la causa va al log **sin `Authorization`
   ni token**.
3. Sólo se listan los módulos **activos del espacio**; lo no contratado se
   descubre en el hub, y al final va la puerta «＋ Activar módulo».
4. Agrupado **vertical → horizontal**, una sola división, orden servido dentro
   de cada clase.
5. El módulo propio, **una** vez, con las **dos** marcas: hilo amarillo **e**
   ícono amarillo.
6. La key sin dibujo cae al glifo roto **visible**, decidido después de que las
   hojas estén aplicadas (sin esa espera, un CSS lento marca todo roto).
7. La franja con el espacio servido y **las iniciales** del usuario.
8. La barra de estado con **créditos**, no guaraníes (§4.3).
9. Lo que no tiene dato **no existe en el DOM** — ni píldora con rótulo
   genérico, ni barra de saldo sin saldo.

### Cómo se entrega

El paquete publica `dist/marco.js` como módulo ES. **Requisito en el consumidor:**
Lab publica estáticos por una lista blanca de extensiones que hoy **no incluye
`.js`** (`estaticos.ts:42`). Sumar `.js` a `TIPOS` es parte de la adopción, y es
una decisión, no un descuido — igual que los tres directorios nombrados uno por
uno.

### La URL lleva la versión — y no sólo la del marco

Los estáticos se sirven con `cache-control: public, max-age=31536000,
immutable` (`estaticos.ts`). **Un marco congelado contra un shell nuevo es el
bug más confuso que se puede producir**: la pantalla mezcla dos generaciones y
nada en la consola lo explica. Así que la URL del marco lleva la versión del
paquete.

> **Y el problema es más grande que `marco.js`.** El comentario que hoy
> justifica el `immutable` dice: *«el paquete se pinea por TAG, así que el
> contenido de una URL nunca cambia sin que cambie la versión instalada»*. Eso
> **no se sigue**: la URL es la misma en todas las versiones —
> `/estaticos/css/piezas.css` no cambia al pasar de v0.2.0 a v0.2.1. O sea que
> **hoy, en producción, un visitante que ya estuvo se queda con el CSS viejo
> hasta que el navegador desaloje la caché**, que con `immutable` y un año de
> `max-age` puede no pasar nunca.
>
> **Es un bug vivo, no una hipótesis**, y explicaría cualquier «no veo el cambio»
> que no se arregle con recarga normal. Se corrige del mismo modo y para **todos
> los assets del paquete**, no sólo para el marco: la versión instalada entra en
> la URL, y `immutable` recién ahí dice la verdad.

**Forma:** query — `/estaticos/css/piezas.css?v=0.3.0`. Se elige sobre meter la
versión en la ruta porque la clave del mapa en memoria **no cambia** (el lookup
es por `pathname`), así que la lista blanca y su prueba de escape siguen intactas,
y el navegador igual cachea por URL completa. El consumidor lee la versión del
`package.json` del paquete instalado — **jamás una constante escrita a mano**.

---

## 3. Piezas nuevas que entran

Las que hoy están en el `<style>` de Lab o en el del hub, y las del lote
pendiente.

| pieza | de dónde viene | por qué entra |
|---|---|---|
| `.shell` · `.shell__cuerpo` · `.marco-columna` | `<style>` de Lab | **el armazón**: el paquete traía las partes y no la caja que las ordena |
| `.barra-estado__spacer` · `__grupo` · `__dato` | `<style>` de Lab y del hub | el dato empujado a la derecha, con el peso y el color del estado |
| `.menu-avatar` | `<style>` del hub | el desplegable del avatar (§4.2) |
| `.riel__item--mas` | `<style>` del hub | la puerta «＋ Activar módulo» |
| `.riel__item--sin-url` | `<style>` del hub | reemplaza al `data-sin-destino` de Lab, que **no tiene tratamiento visual** — hoy un módulo sin destino se ve igual que uno vivo |
| `[hidden] { display: none !important }` | **no existe en ninguno** | `display:flex` de autor le gana al `[hidden]` del navegador: los elementos «escondidos» se ven vacíos. Lab lo esquivó por estructura; el próximo consumidor tropieza igual |
| **el pie en la barra inferior** | **no existe** | `piezas.css:936` esconde `.riel__abajo` bajo 860px. Configuración salió de las tabs, así que **en un teléfono no hay puerta** para llegar |
| **una sola regla de marca activa** | hoy hay **dos** | `.riel__item--activo .riel__icono` es automática; `.icono-modulo--activo` hay que aplicarla a mano. Esa asimetría fue el bug del ícono gris que el fundador vio en producción |

**El test centinela muere acá.** `lab/tests/browser/marco.tc13.test.ts` tiene
`B-fix · agujero conocido`, que afirma que en móvil el pie se esconde y que se
pone **rojo a propósito** el día que el paquete lo arregle. Ese día es éste: el
test se borra en la adopción de Lab, y el pendiente se cierra.

---

## 4. Los tres puntos pendientes, resueltos donde tocan

### 4.1 · Tamaños
La tabla del §1.3. Nada en Lab.

### 4.2 · Avatar: iniciales y menú

**Fuente de las iniciales, citada:** el hub las saca de `shell.user.nombre`
(`shell.ts:363`), con `iniciales()` en `shell.ts:87` — primera letra del primer
nombre y del último. Y **`/v1/shell` ya sirve `user: { id, nombre }`**
(`suynda-foundation/src/shell/shell-service.ts:195`).

> **No hace falta ninguna adición a Foundation.** El dato ya está en el
> contrato; lo que falta es que cada BFF lo pase y que el marco lo pinte.

El menú lleva **Mis datos** y **Mis espacios** hacia el hub, y **Cerrar sesión**
apuntando a `{hub}/salir`.

### 4.3 · El saldo

`balance` sale del libro de créditos (`credits.balanceInfo`, Foundation), y el
hub lo dice tal cual: **`⬢ {n} créditos`** más **Recargar**
(`textos.es.json`, `BarraEstado.astro:25`).

Lab lo pintó como **«Saldo ₲ 0»** — una **unidad inventada sobre un dato real**,
que es peor que no mostrarlo: el canon prohíbe la métrica fabricada (B.2-17).
**El `₲` muere acá.**

**Recargar no tiene destino que copiar:** en el hub es un `<button>` que abre un
modal (`shell.ts:288`), no un enlace. No hay URL ni hash. Que el panel abra el
modal con `#recargar` es trabajo del hub — ver §7.

---

## 5. Enmiendas al canon

Los números medidos contradicen tres fichas. Se corrigen **a lo medido**, con el
precedente citado.

| ficha | dice hoy | pasa a decir | precedente |
|---|---|---|---|
| **B.2-13 · Franja** | «avatar 32px (44 al tacto)» | agrega **padding `0 18px`, gap 12px, avatar peso 600 con borde 2px transparente** | `Franja.astro` |
| **B.2-14 · Riel** | «expandido (**176px**, hover)» · «ítem **13px**/500» | **expandido 208px** · **ítem `--tx-chrome` (15.5px)/500** · **ícono 32 radio 9** | `Riel.astro:58,67,70,113-117` |
| **B.2-15 · Tabs** | no declara contenedor | **alto 48px, padding `0 22px`; tab `15px 11px 11px`** | `SubBarra.astro:44-55` |
| **B.2-16 · Barra de estado** | «el número toma el color del estado» | agrega **el dato a la derecha (`spacer` + grupo) y el texto «⬢ N créditos · Recargar»** | `BarraEstado.astro`, `textos.es.json` |

**Lo que NO se enmienda:** «60px en reposo, sólo íconos». Los dos lados declaran
`.riel__nombre { opacity: 0 }` en reposo — **ninguno muestra etiquetas
colapsado**. Las capturas que las muestran están con el riel **en hover**. El
canon acierta y se queda como está.

---

## 6. La compuerta nueva

**El trinquete de Lab mide lo que no era.** Cuenta hallazgos de la compuerta del
paquete —o sea, **colores crudos**— y no mide propiedad. Cada regla de marco que
se agregó usando tokens en vez de hexes lo dejó en «47, sin novedades», y ese
verde se reportó como cumplimiento. **Una compuerta que mide una cosa y se lee
como si midiera otra es peor que ninguna.**

**La compuerta que entra, adoptable por pin:**

> **Reglas de marco fuera del paquete = 0.**

Se publica en el paquete —como ya se publica `scripts/compuerta.mjs`— y cada
consumidor la corre sobre su fuente. Falla si encuentra una regla que defina un
selector del marco:

    .shell  ·  .shell__*  ·  .marco-columna  ·  .main
    .franja  ·  .franja__*
    .riel  ·  .riel__*  ·  .riel--*
    .tabs  ·  .tab  ·  .tab--*
    .barra-estado  ·  .barra-estado__*  ·  .barra-estado--*
    .menu-avatar  ·  .menu-avatar__*
    .icono-modulo  ·  .icono-modulo--*
    .glifo  ·  .glifo--*
    .esqueleto

**La lista cubre las diez reglas contadas, sin excepciones.** El sello 10 → 0 no
puede tener ítems invisibles: un selector que se cuenta en el 10 y no está en la
lista es una regla que sobrevive al cero.

**`.main` ENTRA, y la razón se escribe.** Es el slot del contenido, y podría
parecer del módulo. No lo es: lo que declara —el padding del área, la contención
del scroll (`overflow-y: auto`, `overscroll-behavior: contain`), el
`min-height: 0` que hace que la grilla no se desborde— son **decisiones del
marco**, no de la pantalla. Son exactamente las que hacen que el riel quede
quieto mientras el contenido rueda, que es una garantía del marco. Lo que la
pantalla decide vive **adentro** del slot, con clases propias.

> **Riesgo del nombre, anotado:** `.main` es un nombre genérico y un consumidor
> podría querer usarlo para otra cosa. La compuerta lo va a marcar, y eso es
> correcto: el marco reclama ese nombre. Si algún consumidor lo necesita para
> otra cosa, el que se renombra es él.

**Estado medido hoy en Lab:** el `<style>` tiene **123 reglas**, de las cuales
**10 son del marco** (`.shell`, `.shell__cuerpo`, `.marco-columna`, `.main`, y
las cinco de `barra-estado__*`). Las otras 113 son contenido de las pantallas y
se quedan. **Ese 10 → 0 es lo que la compuerta sella.**

En lo que al marco respecta, esta compuerta **reemplaza** al conteo de hexes. El
trinquete sigue vivo para el CSS de contenido, que no es asunto de esta corrida.

---

## 7. Adopción — dos consumidores, en este orden

### Prerequisito: la corrida `/salir` de `suynda-landing`

El menú del avatar **no puede nacer apuntando a un 404**. Su diseño ya está
escrito y firmado: `suynda-landing/docs/design/corrida-salir-diseno.md` —página
`/salir` con confirmación de un clic; el GET es inofensivo y el POST de mismo
origen que ya existe queda intacto. **Se le suma `#recargar`**, que el panel
necesita para que el «Recargar» de la barra tenga destino.

**Su deploy va ANTES que el de Lab.**

### 1º Lab — porque es una mudanza, no una construcción

Lab **ya tiene el comportamiento**: el montador nace de su `marco-script.ts`. La
adopción es borrar y pinear:

- se borran `marco-script.ts` y las 10 reglas de marco del `<style>`
- se suma `.js` a `TIPOS` de `estaticos.ts`
- el BFF `/api/shell` pasa a servir también `user.nombre`
- muere el test centinela del pie en móvil
- la compuerta nueva tiene que dar **0**

### 2º El hub — en UI-4, como estaba planeado, y ahora barato

Era una corrida cara porque había que decidir los números. **Ya están decididos y
son los suyos**: adoptar el paquete no le cambia el aspecto. Lo que gana son los
14 íconos reales en vez de dos emoji y un cuadradito, el `url` servido en vez del
cableado, la agrupación por clase, el esqueleto y el manejo de la caída.

**Y a partir de ahí, cada módulo que se suma monta el mismo marco.** Compra
después del hub.

---

## 8. Lo que este diseño NO resuelve, dicho de frente

- **El orden es POR CLASE por diseño — el dato no está torcido.** Corrección a
  una lectura previa de este mismo documento: la migración 070 declara
  `CREATE UNIQUE INDEX modules_orden_por_kind_uq ON modules (kind, orden) WHERE
  kind IS NOT NULL`, y su comentario lo dice sin ambigüedad — *«único DENTRO de
  su clase de negocio, no entre todas: verticales y horizontales son dos listas
  y las dos arrancan en 10»*. Que `compra` y `lab` compartan el 10 es lo
  correcto.
  **Lo que falta es la lectura:** `listModules` ordena por `orden NULLS LAST,
  key` y debería ordenar por `kind, orden`. **Pendiente con dueño: Foundation,
  próxima corrida**, junto al `VALIDATE CONSTRAINT modules_orden_chk`. Mientras
  tanto el montador agrupa, así que la pantalla ya está bien.
- **El rótulo de la puerta va a divergir.** El working copy del hub tiene sin
  commitear `«Activar módulo» → «Descubrí módulos»`; Lab desplegó diciendo
  «Activar módulo». **El rótulo tiene que salir del mismo lado que la URL** —
  con el montador, sale del paquete, y esto se cierra solo.
- **`VALIDATE CONSTRAINT modules_orden_chk`** sigue pendiente en Foundation,
  misma corrida que el `ORDER BY kind, orden`.
