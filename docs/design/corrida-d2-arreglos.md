# D2 · Los ocho arreglos — diseño agrupado

**Fecha:** 10 de septiembre de 2026
**Estado:** ENTREGADO PARA FIRMA. **Nada escrito fuera de este archivo.**
**Origen:** `corrida-d2.md`, candidatos D2-3 a D2-10. Las dos piezas nuevas van
por separado (`pieza-tablero.md` ya construida, `pieza-modulo-sin-entitlement.md`
esperando firma).

**Por qué van juntos:** son ocho cambios chicos a piezas que ya existen, y
**tres de ellos se pisan**. Separados, dos se arreglarían dos veces y uno se
arreglaría en el lugar equivocado. Los solapamientos están en §O y **se resuelven
antes de la lista**, no después.

---

## O · LOS SOLAPAMIENTOS, resueltos

### O-1 · D2-6 **descubrió un agujero en V-4**, y el arreglo puede taparlo o agrandarlo

Éste no es un solapamiento entre dos arreglos: es un arreglo contra **el aparato
de medición**, que es peor.

**El hecho, medido hoy en el navegador:**

```
<a class="tarjeta tarjeta--interactiva">   display: inline    47 x 212    exento de V-4: SÍ
<div class="tarjeta tarjeta--interactiva"> display: block     48 x 312    exento de V-4: NO
```

**`.tarjeta` no declara `display`** (`piezas.css:189-193` — cinco propiedades, y
ninguna es `display`). Un `<a>` con esa clase **sigue siendo `inline`**. Y V-4
exime exactamente eso (`lab/tests/helpers/estacion-vestida.ts:167`):

```ts
(el.tagName === "A" && !getComputedStyle(el).display.startsWith("inline"))
```

**La exención está bien escrita** —un enlace en medio de una oración no es un
objetivo táctil— pero **atrapa algo que no es prosa**: una tarjeta que se toca
entera. Los tres enlaces de fila de Inicio (`html.ts:2635, 2653, 2657`) **hoy no
los mide nadie**. Ese `212` de ancho es el largo del texto: con una etiqueta
corta el objetivo se achica y **V-4 sigue callado**.

**Y esto lo produjo una cura nuestra.** `.tarjeta--interactiva` fue la respuesta
del canon a «una fila que se toca entera»; aplicarla **creó el punto ciego**.

**Resolución:** el arreglo de **D2-6 incluye `display: block` en `.tarjeta`**.
Con eso el enlace deja de ser `inline`, **vuelve a entrar en V-4** y se mide como
lo que es. **No se toca la exención de V-4**: la exención sigue siendo correcta,
lo que estaba mal era que la tarjeta cayera dentro de ella.

> **Y ésta es la dirección contraria, que hay que mirar:** poner `display: block`
> en `.tarjeta` **puede volver rojas estaciones ya cerradas**, porque empieza a
> medir tres enlaces que antes no se medían. **Si eso pasa, es un hallazgo, no
> una regresión** — y se arregla, no se exime. La corrida tiene que correr las
> compuertas de Lab después de este arreglo, con Lab re-pineado. Va en (d).

### O-2 · D2-9 vs el `overflow-wrap` que B.2-29 ya se pagó

`.tablero__titulo` lleva hoy `overflow-wrap: anywhere`, con este comentario:
*«B.2-29 se paga su propio ajuste de título: la hoja no tiene reglas de h1/h2/h3
y el rótulo de una columna puede ser una palabra larga»*.

**Cuando D2-9 aterrice, esa línea sobra.**

**Resolución:** D2-9 es **el dueño único** del ajuste de envoltura de títulos, y
su diff **borra la línea de `.tablero__titulo`**. Queda escrito acá porque si no,
dentro de tres meses alguien la ve y no sabe si es intencional.

**Y no son la misma declaración, que es la trampa:** el tablero usa `anywhere` y
lo que Lab tiene es `break-word` (`html.ts:269`). D2-9 tiene que elegir **una**,
no heredar las dos. Se propone `break-word` —que es lo que está en producción— y
**si el título del tablero necesita `anywhere`, esa excepción se declara con su
razón**, no se deja por inercia.

### O-3 · D2-7, D2-8 **y** D2-9 convergen en lo mismo: **`.tarjeta` no tiene título**

El recon lo dejó a la vista. `.entrada` tiene `.entrada__titulo`
(`piezas.css:1040`). **`.tarjeta` no tiene ninguno** — sólo `.tarjeta`,
`--elevada` y `--interactiva`.

Por eso Lab tiene **ocho reglas de encabezado por contenedor**, además de la
global:

```
html.ts:310  .card h2               :330  .block h2          :369  .board-col h2
     :388  .criticals-first h2      :390  .config-group h2   :405  .recs h2
     :418  .analysis-selected-block h3                       :303  .sin-acceso h1
```

**Cada una de esas ocho existe porque la tarjeta que las contiene no trae
título.** Y los tres candidatos las tocan desde ángulos distintos: D2-7 necesita
un título **rojo**, D2-8 vive en dos tarjetas **con** título, y D2-9 es
justamente la tipografía de encabezados.

**Resolución, y es la decisión más cara de este documento:**

- **`.tarjeta__titulo` entra con D2-9**, no con D2-7 ni con D2-8. D2-9 deja de
  ser «poner `overflow-wrap` en algún lado» y pasa a ser **el arreglo de títulos
  del canon**: la envoltura **más** el título de B.2-05.
- **D2-7 y D2-8 no definen tipografía de título.** D2-7 sólo declara **el color**
  de `.tarjeta__titulo` dentro de la sección crítica; D2-8 no lo toca.
- **D2-9 se construye ANTES que D2-7 y D2-8**, porque los dos apoyan en él.

**Lo que esto NO hace:** no toca `h1/h2/h3` como selectores de elemento. La
tipografía del canon vive en clases, que es como está el resto del paquete. Un
módulo que quiera que su `<h2>` se vea, le pone la clase. **Se anota como límite
conocido:** un `<h2>` sin clase sigue saliendo con el default del navegador.

---

## 1 · D2-3 · Chip de filtro — **generalizar B.2-23**, no construir uno nuevo

**Qué hay:** `.modulo-chip` (`piezas.css:903-923`) es un chip de selección
completo: `flex-wrap` en `.modulos`, `min-height: 44px`, radio de píldora, estado
`--elegido`, y está en la lista de `@media (pointer: coarse)` (`:1131`).

**Qué reinventó Lab** (`html.ts:350-352`): `.chips{flex-wrap}` ·
`.chip{min-height:44px; border-radius:999px}` · `.chip.is-on{fondo}`. **Es la
misma mecánica**, escrita de nuevo.

**El arreglo:** un **alias neutro** — `.chip-filtro` / `.chips` como nombres de
rol, compartiendo la receta con `.modulo-chip`, que queda como el caso con
ícono. Sin CSS duplicado: una lista de selectores, no un bloque nuevo.

**Su roja:** revertir el alias y comprobar que el chip de filtro pierde los 44 px
bajo puntero grueso.

> **EL PATRÓN, que el fundador mandó registrar y no se arregla en esta corrida:**
> una pieza del canon **nombrada por su primer uso** en vez de por lo que hace se
> vuelve **invisible para el próximo módulo, que la reinventa**. Es **R8 a nivel
> de canon** — el fixture que dejó de decir lo que su nombre dice, pero en la
> hoja. `.modulo-chip` es el caso probado; puede haber más. **Candidato a una
> revisión de nombres cuando UI-2V-C cierre, NO ahora.**

## 2 · D2-4 · `.entrada__campos` sin mínimo duro

**Qué hay:** `repeat(auto-fit, minmax(200px, 300px))` (`piezas.css:1054`), con
`justify-content: start` y su comentario explicando el tope de 300.

**El arreglo:** `minmax(min(200px, 100%), 300px)`. **Es literalmente la cura que
v0.3.5 le hizo a B.2-24**, aplicada a la otra grilla que quedó con la misma
forma. El tope de 300 y el `justify-content: start` **no se tocan** — el
comentario explica por qué existen y siguen valiendo.

**Su roja:** montar la entrada en un contenedor de 180 px y comprobar que el
campo no es más ancho que su grilla. Se planta devolviendo el `200px` pelado.

**Límite declarado:** a 360 px **hoy entra igual**. Esto no arregla una pantalla
rota, cierra una familia de defecto ya conocida antes de su tercer caso.

## 3 · D2-5 · El tubo — el ejemplo del canon que vive fuera del canon

**Qué hay:** el canon **nombra la tapa de un tubo como su ejemplo textual** de
color del mundo real (`piezas.css:812`, y la excepción `--tubo-|\.tube-` en
`scripts/compuerta.mjs`). **La pieza no existe.** Lab la tiene
(`html.ts:284-287`): círculo de 0.85rem con borde `--tinta` y tres variantes,
`#f5d76e`, `#6b4c9a`, `#c5c8c4`.

**El arreglo:** `.tubo` + `.tubo--<clase>` en el paquete, con **los colores como
tokens `--tubo-*`** — que es el patrón que la compuerta anti-deriva ya exime por
nombre.

**Su roja:** la compuerta anti-deriva corriendo sobre un consumidor que use la
pieza, y comprobando que **no la marca** — porque el token está nombrado. Se
planta renombrando el token fuera del patrón exento.

**Lo que NO decide:** **cuáles** tipos de tubo existen. Hoy Lab dibuja tres; el
juego real es del dominio. La pieza trae los tres que están en producción y el
molde para agregar.

## 4 · D2-6 · Apilado para `.lista__fila` — **y el `display` de `.tarjeta`**

**Qué hay:** `.lista__fila` es `display: flex` **sin `flex-wrap`**
(`piezas.css:218-225`), y `.boton` es `white-space: nowrap`. Una fila con
etiqueta larga y su meta no entra en 360 y hay que sacarla de la pieza. Lab usa
`.lista__fila` **19 veces** y tiene **cuatro grillas propias** que existen sólo
por esto: `.row` (`:295`), `.admit` (`:326`), `.cargar` (`:363`),
`.verificar` (`:365`).

**El arreglo, dos partes:**

1. **`.lista__fila--apilable`**: bajo 860 px la fila pasa a columna y `.lista__der`
   suelta su `margin-left: auto`.
2. **`display: block` en `.tarjeta`** — el arreglo de O-1. **Va acá porque es el
   mismo problema**: cómo se comporta una fila que se toca entera.

**Sus rojas, y son dos distintas:**
- revertir el `--apilable` y ver la fila desbordar a 360;
- **revertir el `display: block`** y ver que el `<a class="tarjeta">` vuelve a
  `inline` — o sea, **vuelve a ser invisible para V-4**. Esta segunda no se mide
  con una compuerta de píxeles: se mide **afirmando el `display` computado**,
  porque lo que se protege es que el nodo *entre* en la medición.

**Las cuatro grillas de Lab no se borran en esta corrida.** Sacarlas es de
UI-2V-C, con Lab re-pineado. Acá se construye el destino.

## 5 · D2-7 · Sección crítica

**Qué hay:** `.criticals-first` (`html.ts:387-388`): `border: 2px solid RED` y
`h2 { color: RED }`, aplicado como `class="tarjeta criticals-first"`
(`html.ts:2707`). El canon sólo tiene `.pildora--critico` — **la etiqueta grita,
la sección no**.

**El arreglo:** `.tarjeta--critico`: borde de 2 px en el rojo del sistema, y
`.tarjeta--critico .tarjeta__titulo { color: … }`. **Nada más** — que vaya
primera y que no colapse es conducta del módulo, no de la pieza.

**Depende de O-3:** necesita `.tarjeta__titulo`, que entra con D2-9.

**Su roja:** revertir el modificador y comprobar que la sección crítica se lee
igual que una tarjeta común.

**Lo que NO decide:** cuántos niveles de gravedad hay. Uno, el que existe.

## 6 · D2-8 · Variante punteada de B.2-05

**Qué hay:** dos consumidores, y por eso es patrón y no caso aislado.
`.recs { border-style: dashed }` (`html.ts:404`) en Inicio — *«esto es un
checklist, no una cola de atención»* — y `.confirm`
(`html.ts:372`), *«esto todavía no se guardó»*.

**El arreglo:** `.tarjeta--punteada`. Una línea.

**Su roja:** revertir y comprobar que la tarjeta punteada se lee igual que una
sólida.

> **Un dato que la corrida tiene que saber:** `.confirm` aparece **también suelto**
> —sin `.tarjeta`— en tres lugares de Entregar (`html.ts:3893, 3918, 4004`), que
> es la estación que todavía no se vistió. Esos tres son de **(e)**, no de acá,
> **pero heredan esta pieza**: si D2-8 no existiera, (e) inventaría la cuarta.

## 7 · D2-9 · Títulos del canon — **envoltura y `.tarjeta__titulo`**

Es el arreglo más grande de los ocho, y O-3 explica por qué.

**Qué hay:** el paquete tiene **cero reglas de `h1`, `h2` o `h3`** y **cero**
`overflow-wrap`, `word-break` o `hyphens` en sus tres hojas. El tamaño de un
título sale del **default del navegador**. Lab lo tapa con nueve reglas
(`html.ts:269` global, más las ocho de O-3).

**Y ya costó una medición:** un `<h1>` de una sola palabra —«Recomendaciones»,
324 px en un contenedor de 280— empujaba el slot a 364 contra 360.

**El arreglo, dos partes:**

1. **`.tarjeta__titulo`** — el título que a B.2-05 le falta, con su tamaño y su
   margen, alineado con `.entrada__titulo`, que ya existe y es el precedente.
2. **La envoltura**: `overflow-wrap: break-word` en las clases de título del
   canon —`.tarjeta__titulo`, `.entrada__titulo`, `.vacio__titulo`,
   `.sin-modulo__titulo`, `.tablero__titulo`—, **y se borra la línea local de
   `.tablero__titulo`** (O-2).

**Su roja:** un título de una palabra larga en un contenedor angosto, midiendo
que **el título no es más ancho que su contenedor**. Se planta sacando la
envoltura. Es la misma forma que la prueba de B.2-24: **se mide el ítem contra su
caja**, no la página.

**Límite declarado (O-3):** un `<h2>` **sin clase** sigue saliendo con el default
del navegador. El canon vive en clases y esto no lo cambia.

## 8 · D2-10 · Envoltorio de scroll

**Qué hay:** el único `overflow-x` del paquete está adentro de `.tabs`
(`piezas.css:697`) para su propia barra. Lab tuvo que escribir
`.scroll-x { overflow-x: auto; }` (`html.ts:398`) y lo usa **cuatro veces**
(`:633, :980, :990, :1001`), siempre envolviendo un `<table>`.

**El arreglo:** `.envoltorio-scroll` en el paquete.

**Y trae una decisión que no es cosmética.** V-3 exige declarar todo contenedor
con scroll propio como exención — *cada exención es una zona donde la compuerta
deja de mirar*. Si el canon da la clase, **la exención pasa a ser del canon y se
declara una vez**, en vez de que cada módulo declare la suya con su propio
nombre. **Eso es lo que se firma acá**: no la regla CSS, sino **quién declara la
exención**.

**Su roja:** revertir el `overflow-x` y comprobar que la tabla ancha empuja a su
contenedor.

**Lo que NO trae:** estilos de tabla. El paquete no tiene `<table>` y esta
corrida no lo agrega — **sería el candidato once, y la lista está congelada.**

---

## 9 · Orden de construcción

O-3 lo fija, y lo demás es preferencia:

```
D2-9  (títulos: .tarjeta__titulo + envoltura)   ← primero, D2-7 y D2-8 apoyan acá
D2-7  (crítico)      D2-8  (punteada)           ← después de D2-9
D2-6  (apilable + display:block en .tarjeta)    ← el que puede volver roja a Lab
D2-3  (chip)   D2-4  (min())   D2-5  (tubo)   D2-10 (scroll)   ← independientes
```

**D2-6 va tarde a propósito:** es el único que puede volver rojas estaciones ya
cerradas, y conviene que llegue con el resto del tag construido.

---

## 10 · Lo que este diseño NO resuelve

- **Sacar de Lab las clases que estos ocho reemplazan.** Es UI-2V-C con Lab
  re-pineado, o sea (d) y (f). Acá se construye el destino.
- **La revisión de nombres del canon** que el patrón de §1 levanta. Congelada
  hasta que UI-2V-C cierre, por orden del fundador.
- **Estilos de tabla** (§8) y **una tercera causa de denegación** — los dos serían
  el candidato once.
- **Si `display: block` en `.tarjeta` rompe una pantalla que hoy está verde.** No
  se puede saber sin correr las compuertas de Lab contra el paquete nuevo, y eso
  es (d). **Está declarado como riesgo, no descartado.**

---

## 11 · Lo que espera tu firma

1. **O-1** — que D2-6 incluya `display: block` en `.tarjeta`, que **no se toque la
   exención de V-4**, y que un rojo nuevo en Lab se lea como hallazgo.
2. **O-2** — que D2-9 sea dueño único de la envoltura, que **borre** la línea de
   `.tablero__titulo`, y que la declaración elegida sea `break-word`.
3. **O-3** — que **`.tarjeta__titulo` entre con D2-9**, no con D2-7 ni D2-8; y el
   límite: el canon vive en clases, un `<h2>` pelado no se estiliza.
4. **D2-3 como alias de B.2-23**, no como pieza nueva; y **el patrón registrado y
   congelado** hasta que UI-2V-C cierre.
5. **D2-10**: que la **exención de V-3 pase a declararse una vez en el canon** en
   vez de una por módulo.
6. **El orden de §9**, con D2-9 primero y D2-6 tarde.
