# Corrida D2 — los diez del tag, congelados

**Fecha:** 10 de septiembre de 2026
**Origen:** UI-2V-C. Los diez salieron de vestir seis estaciones de Lab y las
trece pantallas de Configuración — **ninguno de una revisión: todos de un hueco
que apareció al intentar usar el canon**.
**Alcance FIRMADO por el fundador.** La lista **se congela acá**: un candidato
once va al tag siguiente, no se cuela en éste.

---

## 0. Cómo leer esta lista

Cada línea trae **qué falta**, **quién lo pidió** y **la verificación contra el
paquete**, corrida hoy antes de congelar. Ninguna afirmación de abajo viene de
memoria.

**Dos son piezas NUEVAS** —construcción, con diseño y compuerta propia— y
**ocho son arreglos** a piezas que ya existen. Ese es el corte del plan B si la
corrida se traba, y **partirlo vuelve al fundador**.

---

## 1. Las dos piezas nuevas

### D2-1 · **B.2-29 · Tablero de estados** — pieza nueva

**Quién lo pidió:** `renderEntregar` de Lab. Su `.board` (`html.ts:367`) declara
`repeat(4, minmax(12rem, 1fr))` con `gap: 0.75rem` = **804 px de ancho mínimo**
(4×192 + 3×12), que en el slot de ~312 px no entra por dos veces y media. Hoy no se ve porque `.shell__cuerpo`
recorta (`piezas.css:392`).

**Diseño firmado:** `docs/design/pieza-tablero.md`, los cinco puntos del §7.
Conducta angosta = **apila**, con el argumento de los contadores. Las tarjetas de
adentro NO son de la pieza.

**Verificación:** no hay ninguna clase `.tablero*` en el paquete.

### D2-2 · **B.2-21 · Módulo sin entitlement, completa** — pieza nueva

**Quién lo pidió:** la enmienda de Fase 2 (commit `32d7f5c`), más el delta 8 de
UI-2V-C, que no puede vestir el fallback de `renderMain` sin ella.

**Qué falta:** markup, **las dos causas** —sin módulo (dos salidas) y sin
facultad (una sola, porque activar no resolvería la denegación)— y el copy con
`{modulo}` como parámetro.

**Verificación:** `.sin-modulo` aparece **4 veces y sólo en `piezas.css`**: la
pieza existe como CSS y nada más. Lab la calcó con `.sin-acceso` (6 usos en
`html.ts`, duplicando 46ch / 18px-600 / 13.5px `--tinta-suave`).

---

## 2. Los ocho arreglos

### D2-3 · Chip de **filtro** — y la pieza **existe, mal nombrada**

**Quién:** Cargar y Verificar (chips de departamento), Configuración.

**Verificación, que me corrigió el candidato:** el paquete tiene **dos** familias
de chip, no una. `.chip-canal` (`piezas.css:815`) es el chip de CANAL y lleva
**el color real del mundo** — usarlo de filtro aplanaría justo lo que su
prohibición protege, y eso sigue en pie. Pero **`.modulo-chip`**
(**B.2-23 · Selector de módulos**, `piezas.css:903`) ya ES un chip de selección:
`flex-wrap` en su contenedor, `min-height: 44px`, estado `--elegido`, radio de
píldora. Y está en la lista de táctiles de `@media (pointer: coarse)`
(`piezas.css:1131`).

**Comparalo con lo que Lab tuvo que inventar** (`html.ts:350-352`):
`.chips{flex-wrap}` · `.chip{min-height:44px; border-radius:999px}` ·
`.chip.is-on{fondo}`. **Es la misma mecánica.** Lab reescribió B.2-23 sin
saberlo, porque la pieza está **nombrada por su primer uso** en vez de por lo
que hace.

**Entonces el arreglo cambia de forma:** no es construir un chip de filtro
nuevo, es **generalizar B.2-23**. Más barato y menos superficie. Lo único
acoplado al módulo es `.modulo-chip--elegido .icono-modulo { filter: invert(1) }`
(`:923`), que es una regla de descendiente y no estorba sin ícono.

> **Esto se descubrió censando para congelar, no diseñando.** El candidato sigue
> siendo el número 3 de diez —el alcance no se movió— pero su forma la resuelve
> su propio diseño, que va a firma como los demás.

### D2-4 · `.entrada__campos` sin `min()`

**Quién:** todas las pantallas con formulario.
**Verificación:** `piezas.css:1054` declara
`repeat(auto-fit, minmax(200px, 300px))`. **Es la misma familia del defecto que
v0.3.5 le curó a B.2-24:** un mínimo duro que no puede achicarse. A 360 todavía
entra; en un contenedor más angosto, no.

### D2-5 · El **tubo**, color del mundo real

**Quién:** Muestras (`.tube`, `.tube-TUBO_SUERO`, `.tube-TUBO_EDTA`, `.tube-TUBO`).
**Verificación:** el canon **nombra la tapa de un tubo como su ejemplo textual**
de color del mundo real (`piezas.css:812`, y §B.1.1 de la ficha) — y no tiene la
pieza. El ejemplo del canon vive fuera del canon.

### D2-6 · Modificador de **apilado** para `.lista__fila`

**Quién:** Lab tiene **cuatro grillas propias** que existen sólo porque esto
falta: `.cargar`, `.verificar`, `.row` y `.admit`.
**Verificación:** `.lista__fila` es `display: flex` **sin `flex-wrap`**, así que
una fila con un `.boton` —que trae `white-space: nowrap`— y su meta no entra en
360 y hay que sacarla de la pieza.

> **Y esto puede matar un límite conocido:** la cura que se aplicó cuatro veces
> —pasar la fila a `.tarjeta`— devuelve sus enlaces a `display: inline`, y V-4
> deja de medirlos. Si el enlace de fila del canon garantizara área táctil
> mínima, el límite muere en la pieza en vez de vigilarse por módulo. **Se
> evalúa acá, y sólo acá.**

### D2-7 · Tratamiento de **sección crítica**

**Quién:** Inicio (`.criticals-first`: borde rojo, título rojo, va primera, no
colapsable).
**Verificación:** lo único crítico del paquete es **`.pildora--critico`** — la
píldora, no el contenedor. B.2-01c grita en una etiqueta; una sección entera que
grita no tiene pieza.

### D2-8 · Variante **punteada** de B.2-05

**Quién:** **dos consumidores**, y eso lo convierte de caso aislado en patrón:
`.recs` en Inicio («esto es un checklist, no una cola de atención») y `.confirm`
en el alta de análisis («esto todavía no se guardó»).
**Verificación:** las únicas variantes de tarjeta son `.tarjeta--elevada` y
`.tarjeta--interactiva`.

### D2-9 · Tipografía de **encabezados**

**Quién:** todas. Un `<h1>` de una sola palabra —«Recomendaciones», 324 px en un
contenedor de 280— empujaba el slot a 364 contra 360.
**Verificación, y es la más fuerte de la lista:** el paquete tiene **CERO reglas
de `h1`, `h2` o `h3`**, y **cero** `overflow-wrap`, `word-break` o `hyphens` en
sus tres hojas. El tamaño de un título sale del **default del navegador**, así
que cada módulo inventa el suyo.

### D2-10 · Envoltorio de **scroll** para tablas anchas

**Quién:** la comparación de derivaciones y las tres tablas de equipos, en C-b;
la tabla de micro en Cargar.
**Verificación:** el único `overflow-x` del paquete está **adentro de `.tabs`**
(`piezas.css:697`), para su propia barra. No hay envoltorio genérico, así que
`.scroll-x` tuvo que nacer en Lab.

---

## 3. Cómo se ejecuta

**Método entero por pieza.** Las dos nuevas con su compuerta completa y sus
rojas; los ocho arreglos con **la roja que corresponda a cada uno, plantada
revirtiendo el arreglo** — no una roja genérica de la corrida.

**Y el orden de la secuencia, que conviene tener a la vista:** este STOP termina
con **el tag commiteado y SIN pushear**. El push del fundador es lo que
desbloquea el re-pin de Lab, que exige cotejar el lock contra un tag que exista
en el remoto. **Su push está en el medio de la secuencia, no al final.**

---

## 4. Candidatos del TAG SIGUIENTE — la lista que se abre cuando ésta cerró

La lista de los diez se congeló al abrir D2 y **se respetó**. Lo que apareció
después se anotó acá en vez de colarse. Cada uno con quién lo encontró:

### C-1 · El canon **no declara tamaño base** en ningún lado

Ni regla de `body`, ni de `html`, ni de `*`, ni token de escala. Cada pieza
declara sus px y **el texto sin clase queda en el default del navegador**.
Lo encontró la prueba de D2-9 al comparar `.tarjeta__titulo` contra un `<p>`
pelado: 15 contra 16, y el título salía más chico que el párrafo.

### C-2 · **Estilos de tabla**

El paquete no tiene `<table>`. D2-10 le dio el envoltorio de scroll y
deliberadamente no los estilos — habría sido el candidato once de D2.

### C-3 · Un tono de **CERRADO / INMUTABLE** en B.2-01 — **firmado**

**Firmado por el fundador el 10-sep para el tag siguiente**, por el camino de
**B.2-01c**: pieza con código propio y su ficha, **disponible para toda la
plataforma**.

Lo pidió (e) de UI-2V-C: Entregar tiene **dos** usos del mismo `#163a73`
—`.badge-delivered` y `.lock`— y los dos dicen «esto está cerrado, es
inmutable». Dos consumidores en una sola pantalla es el mismo criterio de patrón
con que D2-8 entró. Entretanto Lab usa una traducción **declarada provisoria**
(`--neutro` y `.aviso`), que reemplaza cuando el tono exista.

### C-4 · Revisión de **nombres del canon**

Una pieza nombrada por su primer uso se vuelve invisible para el próximo módulo,
que la reinventa — R8 a nivel de canon. `.modulo-chip` es el caso probado y D2-3
lo curó con un alias. **Congelada hasta que UI-2V-C cierre**, por orden del
fundador; puede haber más casos.

---

## 5. El principio que gobierna todo esto, firmado el 10-sep

> **Nada se resuelve sólo para Lab.** Si un módulo necesita algo que el canon no
> tiene, **se construye en el canon, para todos los módulos.**

Aplica a **toda corrida de acá en adelante**, y va a la próxima regeneración
**como regla, no como nota**: le ahorra la pregunta a cada corrida. Es la razón
por la que los diez de arriba entraron al paquete en vez de arreglarse en el
`<style>` de Lab, que habría sido más corto cada vez.

