# B.2-21 · Módulo sin entitlement — la pieza completa

**Fecha:** 10 de septiembre de 2026
**Estado:** ENTREGADO PARA FIRMA. **Nada escrito fuera de este archivo.**
**Origen:** D2-2 de la corrida D2 (`corrida-d2.md`), y la enmienda de Fase 2 que
ya está en el canon (commit `32d7f5c`).

---

## 1. Qué hay hoy — y es menos de lo que la ficha promete

**En el paquete hay tres reglas y ninguna pantalla** (`piezas.css:828-843`):

```css
.sin-modulo        { text-align: center; max-width: 46ch; margin: 0 auto; padding: var(--space-4) var(--space-2); }
.sin-modulo__titulo{ font-family: var(--tipografia-titulo); font-weight: 600; font-size: 18px; margin: 0 0 6px; }
.sin-modulo__cuerpo{ font-size: 13.5px; color: var(--tinta-suave); line-height: 1.5; margin: 0 0 var(--space-3); }
```

Eso es todo. **No hay marcado, no hay contenedor de salidas, y no hay copy.**

**Y Lab la reescribió entera** (`lab/src/http/html.ts:302-305`):

```css
.sin-acceso            { max-width: 46ch; margin: 3rem auto; text-align: center; }
.sin-acceso h1         { font-size: 18px; font-weight: 600; margin: 0 0 0.5rem; }
.sin-acceso p          { font-size: 13.5px; color: var(--tinta-suave); margin: 0 0 1.25rem; }
.sin-acceso__salidas   { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
```

**Las tres primeras son el calco exacto** — 46ch, centrado, 18px/600, 13.5px
`--tinta-suave`. **La cuarta no está en el paquete de ninguna forma**: el
contenedor de las salidas es invención de Lab, y es la pieza que hace falta para
que las salidas quepan a 360 (`flex-wrap`).

> **El censo, para que no se lea como más grande de lo que es:** hoy **Lab es el
> único consumidor**. En `suynda-landing` los códigos `CAPABILITY_DENIED`
> aparecen sólo en lógica —`lib/espacios.ts`, `scripts/nexo.ts`,
> `lib/activacion.test.ts`— y **ninguna pantalla monta la pieza**. En
> `suynda-compra` y `visibilidad` no aparece. El segundo consumidor es futuro:
> el starter de `@suynda/modulo`.

---

## 2. Una divergencia que el recon encontró, y no es de Lab

**La hoja y el MD dicen cosas distintas sobre la misma pieza.**

La enmienda de Fase 2 corrigió el MD a «las salidas dependen de la causa»
(`hoja-de-especificacion.md:146-152`). **La hoja renderizada quedó como estaba**
(`catalogo/hoja.html:430`):

> «Receta: … **dos salidas: activar y volver**»

Y su muestra dibuja los dos botones siempre.

**Por qué no lo agarró nadie:** `cobertura-hoja.test.ts` ata que el código
`B.2-21` **aparezca** en el CSS, en la hoja, en el MD y en el catálogo. **No ata
que digan lo mismo.** Es una compuerta de presencia, no de acuerdo — y la
diferencia recién se ve cuando el texto de uno cambia y el del otro no.

**Se cierra en esta pieza**, porque la hoja es el objeto de la firma: si el
fundador firma mirando la hoja, firma «dos salidas siempre», que es justo lo que
ACT-1a-fix desmintió.

---

## 3. La decisión de fondo: **la pieza trae las dos causas, no una plantilla**

Es lo único que este documento tiene que decidir de verdad.

| | salida | qué gana | qué cuesta |
|---|---|---|---|
| **A** | La pieza es **sólo aspecto**: clases y nada más. Cada módulo arma su marcado y su copy | Mínima superficie | **Es lo que ya hay, y ya falló**: Lab escribió las cuatro reglas de nuevo. El próximo módulo también |
| **B** | La pieza trae **el marcado y las dos causas**, con el copy como parámetro `{modulo}` | Un módulo nuevo hereda la pantalla entera —incluida la distinción de causa, que es la parte que se piensa mal | Hay que decidir el copy en el paquete, y el copy es producto |
| **C** | La pieza trae el marcado y **una sola forma**, y la causa la resuelve `@suynda/modulo` | Separa aspecto de decisión | **Parte la pieza en dos repos**: el que la mira no ve por qué hay una salida o dos |

### Se propone **B**, y el argumento es el reparto que la enmienda ya firmó

La enmienda de Fase 2 dice, textual: *«la **decisión** —causa y salidas— es de
`@suynda/modulo`; **la pieza completa —markup, las dos causas, las salidas y el
copy con `{modulo}` como parámetro— es de este paquete**; el render es del
starter»*.

**B es esa frase escrita en CSS y HTML.** La decisión de *cuál* causa aplica
sigue siendo de `@suynda/modulo` —es un código de error, no un estilo—; lo que
entra acá es **qué se ve en cada una de las dos**.

**Y la parte que de verdad se hereda mal no es el borde, es la distinción.** Un
módulo nuevo va a acertarle al 46ch mirando la hoja. Lo que no va a deducir es
que **ofrecer «Activar» cuando la negativa vino de la allowlist es mentir** —
que es lo que el fundador pisó el 6-sep en su espacio «finanzas»
(`lab/src/http/denegacion.ts`, cabecera). Eso viaja con la pieza o no viaja.

### Lo que la firma de B **no** decide

**El texto exacto del copy no se congela acá.** La pieza trae el copy **de
referencia** con `{modulo}` como parámetro y la ficha lo marca como tal: un
módulo puede reemplazarlo. Lo que **no** puede es invertir la regla de salidas.

---

## 4. La pieza

**`B.2-21 · Módulo sin entitlement`**, receta corregida para la hoja **y para el
MD, en los mismos términos**:

> **Estados:** *sin módulo* (dos salidas) · *sin facultad* (una salida) · angosto
> (las salidas envuelven)
> **Receta:** centrado a 46ch · título 18px/600 en `--tipografia-titulo` · cuerpo
> 13,5px `--tinta-suave` · **las salidas en fila centrada que ENVUELVE**, gap 10px
> · **las salidas dependen de la causa:** sin módulo → activar + volver al Hub;
> sin facultad → **sólo** volver al Hub
> **Prohibición:** jamás una pantalla en blanco ni un 403 crudo. Y **jamás
> ofrecer «Activar» cuando activar no cambiaría el desenlace** — quien fue
> negado por facultad activaría el módulo y seguiría afuera.

**Las clases** — las tres que hay más **una**:

```
.sin-modulo            el bloque centrado                        (ya existe)
.sin-modulo__titulo    el título                                 (ya existe)
.sin-modulo__cuerpo    el cuerpo                                 (ya existe)
.sin-modulo__salidas   la fila de salidas, centrada y que envuelve   ← NUEVA
```

**Una sola clase nueva.** Es la que Lab tuvo que inventar, y sin ella las dos
salidas a 360 px se salen de la fila.

**El marcado canónico**, que va a la hoja y al MD:

```html
<div class="sin-modulo">
  <p class="sin-modulo__titulo">{titulo}</p>
  <p class="sin-modulo__cuerpo">{cuerpo}</p>
  <div class="sin-modulo__salidas">
    <!-- SÓLO si activar cambiaría el desenlace -->
    <a class="boton boton--primario" href="{hub}/activar">Activar {modulo}</a>
    <a class="boton boton--secundario" href="{hub}/panel">Volver al Hub</a>
  </div>
</div>
```

**Ojo con el título: es un `<p>`, no un `<h1>`.** Lab usa `<h1>` y le cuelga
`.sin-acceso h1`. Con `.sin-modulo__titulo` la clase manda y el elemento es libre
— que es lo que evita la novena regla `X h1` del módulo. **Ver el solapamiento
con D2-9 en `corrida-d2-arreglos.md` §O-3.**

**El copy de referencia**, con `{modulo}` como parámetro, tomado de la conducta
ya firmada en `lab/src/http/denegacion.ts`:

| causa | título | cuerpo | activar |
|---|---|---|---|
| **sin módulo**<br>`ENTITLEMENT_MODULE_INACTIVE` | *Este espacio no tiene {modulo} activo* | Te equivocaste de espacio, no de producto. Si éste es el espacio donde querés trabajar, activá {modulo} desde el Hub; si no, cambiá de espacio arriba y volvé a entrar. | **sí** |
| **sin facultad**<br>`CAPABILITY_DENIED` | *Tu cuenta todavía no entra acá* | {modulo} está limitado mientras dura el piloto, o tu cuenta no tiene las facultades de esta área. Activarlo no cambiaría eso: quien administra el espacio te lo habilita desde Equipo, en el Hub. | **no** |

**No es copy nuevo:** es el que ya está en producción en Lab, subido al paquete
con el módulo parametrizado. Ningún texto se inventa en este documento.

---

## 5. Lo que este diseño NO resuelve

- **Cuál causa aplica.** Eso lo decide el módulo a partir del código de error, y
  es de `@suynda/modulo`. La pieza pinta la que le digan.
- **La ruta de activación.** `{hub}/activar` es lo que Lab usa hoy; la pieza no
  la fija, la recibe.
- **La deuda de Lab.** Sacar `.sin-acceso` de su `<style>` es del delta 8 de
  UI-2V-C, no de esta pieza. Acá se construye el destino.
- **Una tercera causa.** Si mañana aparece «módulo suspendido por saldo», es otra
  corrida: hoy hay dos códigos y dos conductas.

---

## 6. Su compuerta, con el método entero

1. **Las dos causas dan dos pantallas distintas.** Con activar → dos salidas; sin
   activar → una. La roja se planta **quitando el condicional**, o sea volviendo
   a «dos salidas siempre», que es exactamente lo que la ficha decía antes de la
   enmienda.
2. **A 360 px las salidas ENVUELVEN y nada escapa al bloque.** La roja se planta
   sacándole `flex-wrap` a `.sin-modulo__salidas` — que es el arreglo.
3. **Los dos botones miden 44 px** bajo `pointer: coarse`. Van como `<a>`, y
   **`.boton` sí declara su display** — a diferencia de `.tarjeta`, que es el
   agujero de D2-6. La roja se planta sacando `.boton` de la lista de táctiles.
4. **La hoja, el MD y el CSS dicen lo mismo sobre las salidas**, no sólo que el
   código aparece en los tres. Es la divergencia de §2, y **cierra un hueco que
   `cobertura-hoja.test.ts` no mira**. La roja se planta devolviéndole a la hoja
   el texto «dos salidas: activar y volver».
5. **El copy sale del paquete con `{modulo}` sustituido**, no con «Laboratorio»
   cableado. La roja se planta cableando el nombre.

**Qué NO va a medir:** si el copy es el correcto para un usuario real —eso es la
firma viendo—, ni que el módulo elija bien la causa, que es de `@suynda/modulo`.
Y **no mide a Lab**: mientras Lab no re-pinee, sigue con su calco.

---

## 7. Lo que espera tu firma

1. **La opción B** (§3): la pieza trae marcado, las dos causas y el copy con
   `{modulo}` como parámetro — no sólo aspecto.
2. **La clase nueva `.sin-modulo__salidas`**, una sola, y que el título sea un
   `<p class="sin-modulo__titulo">` y no un `<h1>`.
3. **El copy de referencia de §4**, que es el que ya está en producción.
4. **Que la hoja se corrija** a «las salidas dependen de la causa» (§2) — hoy
   está mintiendo respecto del MD.
5. **Los cinco puntos de su compuerta** (§6), en especial el **4**: es una
   condición sobre los documentos, no sobre el CSS, y es la que descubre las
   divergencias que la compuerta de presencia deja pasar.
