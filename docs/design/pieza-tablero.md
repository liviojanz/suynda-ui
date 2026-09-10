# B.2-29 · Tablero de estados — diseño de la pieza

**Fecha:** 9 de septiembre de 2026
**Estado:** ENTREGADO PARA FIRMA. **Nada escrito fuera de este archivo.**
**Origen:** D2 de UI-2V-C, firmada = **A** (la pieza va al paquete, no se resuelve en Lab).

---

## 1. Qué hay hoy, y por qué no alcanza

`renderEntregar` de Lab (`lab/src/http/html.ts:3760-3821`) dibuja cuatro columnas
fijas, una por estado de entrega:

```
PENDIENTE DE PAGO · EN PROCESO · LISTO PARA RETIRO · ENTREGADO
```

Cada columna es una `<section>` con su `<h2>`, su contador (`data-column-count`) y
sus tarjetas `<a>`. La primera puede venir **inerte** cuando el flujo es
`EXTERNAL_MANAGED`, y lo dice con un texto propio.

**El CSS, que es el problema:**

```css
.board     { display: grid; grid-template-columns: repeat(4, minmax(12rem, 1fr)); gap: 0.75rem; }
.board-col { border: 1px solid #d5d8d4; border-radius: 12px; padding: 0.75rem; min-height: 12rem; }
```
*(`lab/src/http/html.ts:345-348`, más `.inert` en `:326`)*

**4 × 12rem + 3 × 0.75rem = 804 px de ancho mínimo.** En el slot de ~312 px que
deja `.main` a 360 no entra por dos veces y media. **Hoy no se ve porque
`.shell__cuerpo` lo recorta** (`piezas.css:392`) — el tablero está cortado y
nadie lo reporta.

Es la misma familia del defecto que v0.3.5 le curó a B.2-24, cuatro veces más
grande.

---

## 2. La decisión angosta — **APILA**, y la razón

Es lo único que este documento tiene que decidir de verdad. Tres salidas reales:

| | salida | qué gana | qué cuesta |
|---|---|---|---|
| **A** | **Apilar** las cuatro columnas, una debajo de otra, con el contador en cada título | El pulgar recorre en **vertical**, que es el gesto natural. **El panorama no se pierde**: los cuatro contadores quedan visibles apenas se entra, y ésa es la pregunta real del tablero — *cuántas hay en cada estado* | Se pierde la comparación **lado a lado** de las tarjetas |
| **B** | **Scroll horizontal**, columnas de ancho fijo | Conserva el tablero tal cual está en escritorio | A 360 se ven **1,6 columnas**: se scrollea a ciegas. Y un scroll horizontal adentro de una página que scrollea en vertical es de los gestos más frágiles que hay |
| **C** | **Un selector de columna** (chips) y una columna por vez | Lo más compacto | **Inventa una interacción que en escritorio no existe**: la pieza se comporta distinto según el ancho, no sólo se ve distinto |

### Se firma **A**, y el argumento está medido, no es preferencia

**El panorama del tablero vive en los contadores, no en las columnas.** La
pregunta que responde esta pantalla es *«¿cuántas órdenes hay en cada estado?»*,
y eso lo contestan cuatro números. Apilado, los cuatro títulos entran en el
primer viewport de 360 px; con scroll horizontal hay que barrer para verlos.

**La puerta de entrada de Suynda es el celular** — el alta es por WhatsApp
(`shell-canonico.md` §3-bis, motivo del fundador del 29-ago). El móvil no es el
caso degradado del tablero: es el primero.

**Y B se descarta por algo más duro que la comodidad:** un contenedor con scroll
horizontal adentro del slot `.main` —que ya scrollea en vertical— es el patrón
que V-3 obliga a declarar como exención. Cada exención es una zona donde la
compuerta deja de mirar. Apilar **no necesita exención**: es la salida que
conserva la medición.

> **Umbral: 860 px**, el mismo del marco (`piezas.css:1146`), y con `@media
> screen and` — una A4 impresa mide ~779 px CSS y caería del lado angosto. Es la
> trampa que UI-1 ya pagó una vez.

### Lo que la firma de A **no** decide

Apilar es la conducta **de la pieza**. Si mañana un módulo quiere el tablero
horizontal en móvil, eso es una decisión de ese módulo y **no se resuelve con un
modificador**: se discute. La pieza no nace con la puerta abierta.

---

## 3. La pieza

**`B.2-29 · Tablero de estados`**, para la hoja de especificación:

> **Estados:** columna con ítems · columna vacía · **columna inerte** (no aplica
> en este flujo) · angosto (≤ 860 px) apilado
> **Receta:** columnas en grilla de igual ancho, `gap` de 12 px · cada columna
> con borde `--linea`, radio `--radio`, fondo `--card` y alto mínimo · título
> 11,5 px/600 en `--muted` con el contador a la derecha · **la inerte al 55 % de
> opacidad, y su texto dice por qué** · **bajo 860 px las columnas apilan**, el
> contador se queda en el título y el alto mínimo se suelta
> **Prohibición:** **jamás scroll horizontal** — si no entra, apila. Y **jamás
> una columna sin su contador**: el número es el panorama, y sin él el tablero
> apilado es una lista larga.

**Las clases**, con el molde de nombres del paquete:

```
.tablero               la grilla de columnas
.tablero__columna      una columna
.tablero__columna--inerte   no aplica en este flujo
.tablero__titulo       el rótulo de la columna
.tablero__cuenta       el contador, a la derecha del título
```

**Lo que la pieza NO trae, y es deliberado:** las tarjetas de adentro. Cada
módulo pone las suyas, y el molde probado es **`.tarjeta--interactiva`** —lo
demostró Inicio: es la respuesta del canon a «una fila que se toca entera», es
bloque, el texto envuelve y el objetivo táctil es la tarjeta completa.

---

## 4. Una dependencia que levanté y **resultó no serlo**

Al cerrar Inicio anoté que la conducta angosta del tablero podía depender del
modificador de apilado para `.lista__fila`, y que convenía decidirlos juntos.

**No dependen.** Si el tablero apila sus columnas y las tarjetas de adentro son
`.tarjeta--interactiva` —que es bloque—, **no hay ninguna fila flex en el
camino**. Los dos candidatos siguen en el mismo tag, pero **ninguno bloquea al
otro** y pueden construirse en cualquier orden.

---

## 5. Lo que este diseño NO resuelve

- **El orden de las columnas** lo sigue decidiendo el módulo. La pieza pinta lo
  que le den, en el orden que le den.
- **Qué hace una columna con cincuenta tarjetas.** No hay paginación ni scroll
  propio de columna; apilada, la columna crece y la página scrollea. Si el
  volumen real lo pide, es una corrida aparte **con datos del piloto**, no una
  decisión de escritorio.
- **El arrastre entre columnas.** El tablero de Lab no lo tiene hoy y esta pieza
  no lo agrega.
- **Cómo se ve con las cuatro columnas vacías.** Queda para la compuerta.

---

## 6. Su compuerta, con el método entero

La pieza es del paquete, así que su compuerta vive acá y no en Lab:

1. **A 360 px con puntero grueso, `scrollWidth === clientWidth`** del contenedor
   del tablero, y **ningún descendiente lo escapa**. La roja se planta
   revirtiendo el `@media` de apilado — que es el arreglo, no un defecto
   parecido.
2. **Los cuatro contadores visibles en el primer viewport** a 360×800. Es la
   afirmación de §2 y, si no se mide, «el panorama no se pierde» es una opinión.
3. **La columna inerte se distingue** de una vacía: la roja se planta quitándole
   el modificador.
4. **A escritorio, cuatro columnas de igual ancho** — que apilar no se filtre
   hacia arriba. Es la dirección contraria de R9.
5. **Impresión:** el `@media screen and` probado con `emulateMedia({ media:
   'print' })`. Sin eso, la trampa de UI-1 vuelve.

**Qué NO va a medir:** que el tablero *se vea bien*, ni que apilar sea la
decisión correcta de producto. Eso es la firma viendo.

---

## 7. Lo que espera tu firma

1. **La conducta angosta: APILA** (§2), con el argumento de los contadores.
2. **El nombre y las clases** (§3) — `B.2-29`, `.tablero__*`.
3. **Que las tarjetas de adentro NO son de la pieza**, y que el molde
   recomendado es `.tarjeta--interactiva`.
4. **Que la pieza no nace con modificador para volver a horizontal en móvil**
   (§2, «lo que la firma de A no decide»).
5. **Los cinco puntos de su compuerta** (§6), en especial el 2 y el 4.

---

## 8. Enmienda al construir — **dos cosas que el diseño dijo mal**, con la evidencia

Se agrega **después** de la firma y **no cambia ninguna decisión**: cambia dónde
dije que estaban dos cosas. Se escribe acá para que nadie lea §5 y §6 y crea que
siguen vigentes tal cual.

### 8.1 · §6 punto 1 se equivocó de roja, y lo dijo R10

§6 punto 1 dice: *«La roja se planta revirtiendo el `@media` de apilado»*.
**No es cierto**, y se comprobó plantando la mutación en vez de escribirla a ojo.
Al revertir el `@media`, la que cae es **G-2**, no G-1:

```
G-2 - le saca el apilado al @media de 860
   ROJA   -> cae "G-2 a 360 px apila, y los cuatro contadores entran"
G-1 - devuelve el minimo duro de Lab: 12rem por columna
   ROJA   -> cae "G-1 ningun descendiente escapa al tablero"
```

**Las dos condiciones miden cosas distintas y no se cubren entre sí:**

| | qué mide de verdad | su revert |
|---|---|---|
| **G-1** | el **mínimo duro** — `minmax(0, 1fr)` contra `minmax(12rem, 1fr)` | devolver el mínimo de 12rem |
| **G-2** | el **apilado** — una pista de grilla a ≤860 | sacar la regla del `@media` |

Sin el apilado, a 312 px las cuatro columnas de `minmax(0, 1fr)` **se encogen a
~69 px cada una y no desbordan**: quedan ilegibles, no desbordadas. Por eso G-1
sale verde con el apilado revertido, y por eso hacían falta las dos.

**La lección, que ya es R10 y acá se cobra otra vez:** el diseño escribió a ojo
de dónde venía una roja y se equivocó. La lista de qué mide cada condición **se
valida plantando**, nunca redactando.

### 8.2 · §5 dejaba «cómo se ve con las cuatro columnas vacías» **para la compuerta**, y ahí no va

§5 lo listó entre lo no resuelto y lo mandó a la compuerta. **La compuerta no
puede contestarlo**: la promesa —«jamás una columna sin su contador»— es una
regla de **marcado**, y ninguna mutación del CSS la rompe. Un test así saldría
verde contra cualquier cambio de la pieza, o sea que mediría su propio fixture.
Es la trampa que R10 nombra, agarrada **antes** de escribir el test y no después.

**Se contesta mirando, y está contestado:** con las cuatro vacías a 360 px el
tablero son cuatro filas rotuladas con su cero, una debajo de otra, y **el
panorama queda intacto** — que es exactamente lo que §2 prometió. La captura va
con el STOP.

### 8.3 · Y una trampa de medición, para el próximo

La primera lectura de la captura decía que la columna inerte medía ~320 px y se
comía la pantalla. **Medida en el navegador son 165 px.** La diferencia era
`deviceScaleFactor: 2`: la imagen sale al doble. **No se miden píxeles de una
captura** — la captura es para ver, el navegador es para medir.

