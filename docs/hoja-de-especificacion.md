# Hoja de especificación — `@suynda/ui` v0.1.0

**Las 27 piezas, una ficha cada una.** Código, receta en tokens y la prohibición. Se citan por código como se citan las disciplinas: **B.2-02**, **B.2-14**.

Son **21 del canon §B.2** más **6 descubiertas al construir** (B.2-22 … B.2-27), que la review por capturas del fundador encontró faltando y que el canon ya registra.

> **La muestra visual vive en `catalogo/hoja.html`**, y se renderiza **del CSS real del paquete** — los mismos `tokens.css` y `piezas.css` que reciben los productos. Este MD es el texto; la hoja renderizada es la muestra. **Ninguna muestra se dibuja aparte:** si la hoja y el paquete pudieran divergir, la hoja no serviría.

**Canon:** `docs/congelado-ui.md` · **Shell:** `docs/design/shell-canonico.md` · **Consumo:** `docs/consumo.md`

---

## B.2-01 · Píldora de estado

**Estados:** positivo · pendiente · negativo · neutro
**Receta:** fondo `--verde-bg` / `--ambar-bg` / `--rojo-bg` / `--papel` · texto del mismo tono (`--verde`, `--ambar-tx`, `--rojo`, `--muted`) · radio 20px · padding 3/10 · 11px/600
**Prohibición:** jamás para marcas de dominio (el color real de un tubo o de un canal), ni un quinto tono.

## B.2-01c · CRÍTICO — el único grito

**Receta:** relleno **sólido** `--rojo` · texto `--papel` · peso 700 · ícono `▲` antes del texto. **Y comportamiento:** nunca plegable · siempre primero · nunca truncado.
**Prohibición:** **el sistema grita una sola vez.** El relleno sólido no se usa para ninguna otra pieza — si una segunda se lo apropia, las dos dejan de oírse.

## B.2-02 · Botón

**Estados:** primario · secundario · fantasma · destructivo · deshabilitado
**Receta:** primario `--tinta` sobre blanco · secundario borde `--linea` sobre `--card` · destructivo texto y borde `--rojo` · radio 8px · padding 9/15 · 13px/600 · **44px de alto bajo puntero grueso**
**Prohibición:** **el amarillo jamás es botón** sobre fondo claro. La acción es tinta.

## B.2-03 · Campo de formulario

**Estados:** reposo · foco · error · deshabilitado · sólo lectura
**Receta:** borde 1.5px `--linea` · radio 8px · padding 9/11 · rótulo 11.5px/600 `--tinta-suave` · error en `--rojo` bajo el campo · foco `--foco` con offset 2px
**Prohibición:** jamás `outline: none` — quien navega con teclado pierde la pantalla.

## B.2-04 · Estado vacío

**Receta:** centrado · título 15px/600 en `--tipografia-titulo` · cuerpo 13px `--muted` a 42ch · **una** acción
**Prohibición:** no para una lista filtrada a cero — eso es «sin resultados», otra pieza. El vacío **enseña**; el sin-resultados sólo informa.

## B.2-05 · Tarjeta

**Estados:** plana · elevada · interactiva
**Receta:** `--card` · borde `--linea` · radio `--radio` (12px) · padding 14/16 · elevada suma `--sombra`
**Prohibición:** no anidar tarjetas — dos bordes seguidos no crean jerarquía, crean ruido.

## B.2-06 · Tabla / lista de trabajo

**Estados:** cabecera pegajosa · fila seleccionable · fila en acción
**Receta:** filas 11/16 con separador `--linea` · última sin borde · seleccionada sobre `--papel` · en acción al 55% de opacidad · cabecera `position: sticky` con borde de 1.5px
**Prohibición:** jamás un monto sin su moneda, ni cifras en columna sin `tabular-nums`.

## B.2-07 · Aviso

**Estados:** informativo · pendiente · negativo
**Receta:** radio 10px · padding 11/14 · barra izquierda de 4px del tono · fondo suave del tono
**Prohibición:** no para algo transitorio — eso es un toast. El aviso **se queda**.

## B.2-08 · Toast

**Estados:** éxito · error · en curso
**Receta:** fondo `--tinta` · texto `--papel` · radio 10px · `--sombra-panel` · **la marca lleva el color, no el fondo**
**Prohibición:** no para el error de un campo — ese error va en el campo, donde está el problema.

## B.2-09 · Modal

**Estados:** confirmación · formulario · destructivo
**Receta:** ancho `min(420px, 100%)` · radio `--radio` · `--sombra-panel` · fondo `rgba(31,29,26,.45)` · acciones a la derecha, **la peligrosa nunca es la primaria**
**Prohibición:** no para navegar — si lo que sigue es otro lugar, es una pantalla.

## B.2-10 · Esqueleto de carga

**Estados:** tarjeta · tabla
**Receta:** gradiente `--papel` → `--linea` → `--papel` · onda de 1.4s · radio 6px · **sin animación** bajo `prefers-reduced-motion`
**Prohibición:** no si la espera baja de ~300 ms — el parpadeo molesta más que la espera.

## B.2-11 · Buscar y elegir

**Estados:** vacío · buscando · con resultados · elegido
**Receta:** resultados en `--card` con `--sombra` · opción activa sobre `--papel` · elegido en `--verde-bg`/`--verde`
**Prohibición:** no para listas cortas — con pocas opciones un selector alcanza y evita tipear.

## B.2-12 · Monto

**Receta:** símbolo + espacio + miles con punto · `tabular-nums` siempre · **₲ sin decimales**; USD, BRL y ARS con dos
**Prohibición:** **jamás un monto sin su moneda** — en el dato tampoco existe sin ella.

## B.2-13 · Franja (nivel 1)

**Estados:** con una píldora · con las dos · píldora prestada (verde)
**Receta:** 54px de alto · fondo `--amarillo` · wordmark 17px/600 · píldoras `--tinta`, **la prestada `--verde`** · avatar 32px (44 al tacto)
**Prohibición:** jamás créditos ni navegación de módulos acá — viven en los niveles 4 y 2. El verde **no es decoración**: es la defensa contra cargar datos en el espacio equivocado.

## B.2-14 · Riel (nivel 2)

**Estados:** **colapsado (60px, reposo)** · **expandido (176px, hover)** · módulo activo · disponible · «＋ Activar» · **barra inferior a ≤860px**
**Receta:** fondo `--riel` · **60px en reposo, sólo íconos; 176px con etiquetas al hover, y sólo donde hay hover real** — en táctil nunca se expande, como fija el shell canónico · ítem 13px/500 · activo con hilo `--amarillo` de 3.5px e ícono amarillo · en angosto pasa a `row`, ítems en columna de 44px, el hilo pasa de costado a arriba
**Prohibición:** **la casita del Hub es la primera, siempre** — no depende de entitlements ni del espacio activo.

## B.2-15 · Barra de tabs (nivel 3)

**Estados:** activa · inactiva · con scroll
**Receta:** tab 10/12 · `--tx-chrome` · activa `--tinta`/600 con subrayado `--amarillo` de 3px · `overflow-x: auto` sin barra visible
**Prohibición:** **la primera tab dice «Inicio»**, no el nombre del módulo — ese es el título de la pantalla.

## B.2-16 · Barra de estado (nivel 4)

**Estados:** normal · saldo bajo · sobregiro · sin bolsillo
**Receta:** 40px · fondo `--papel` · borde superior `--linea` · `--tx-xs` · el número toma el color del estado (`--ambar-tx`, `--rojo`)
**Prohibición:** **nunca grita.** Un saldo bajo informa; no bloquea ni interrumpe.

## B.2-17 · Tarjeta de métrica con delta

**Estados:** sube · baja · sin cambio · **sin datos**
**Receta:** tarjeta elevada · rótulo 11.5px `--muted` · valor 22px/700 en `--tipografia-titulo` · delta 11px, `--verde` si sube y `--rojo` si baja
**Prohibición:** **jamás una métrica fabricada.** Sin dato, la tarjeta muestra su vacío — un número inventado enseña a desconfiar de la pantalla.

## B.2-18 · Medidor de progreso

**Receta:** riel de 6px `--linea` · relleno `--verde` · radio 3px · valor con `tabular-nums` · rótulo a la izquierda
**Prohibición:** no para indicar carga — eso es un esqueleto. Esto **mide algo real**.

## B.2-19 · Calendario semanal

**Receta:** 7 columnas iguales · hoy en `--amarillo` circular · franja horaria sobre `--papel` · hora con `tabular-nums`
**Prohibición:** no inventar eventos para llenar la semana — una semana vacía es una semana vacía.

## B.2-20 · Chip de canal

**Receta:** fondo `--papel` · texto `--tinta-suave` · radio 20px · punto de 8px con **el color real del canal**
**Prohibición:** **no aplanar el color del canal** a los tonos del sistema — es color del mundo real, como la tapa de un tubo (§B.1.1).

## B.2-21 · Módulo sin entitlement

**Receta:** centrado a 46ch · título 18px/600 · cuerpo 13.5px `--tinta-suave` · **dos salidas**: activar y volver al Hub
**Prohibición:** jamás una pantalla en blanco ni un 403 crudo — quien llega acá se equivocó de espacio, no de producto.

---

# Piezas 22–27 — de la review por capturas (31-ago)

Seis piezas que la revisión visual del fundador encontró faltando. **Sólo aspecto**; el backend viene después.

## B.2-22 · Panel de selector

**Receta:** panel `--card` con `--sombra-panel` · **`gap: 8px` entre opciones** · opción de 44px con borde `--linea` y radio 22px · activa con borde `--tinta` · el meta ("2 titulares") a la derecha en `--muted`
**Prohibición:** se apaga con una sola opción — un menú de una opción es decoración.

## B.2-23 · Selector de módulos

**Uso:** el **primer paso del flujo de INVITAR** — a qué módulos entra la persona; después se abren sus permisos.
**Receta:** chip de 44px con su ícono de módulo · borde `--linea`, radio 22px · elegido en `--tinta` sobre blanco
**Prohibición:** **no aplica a `/equipo`.** Ahí los bloques apilados por módulo entitled quedan como están —diseño de la pasada 3, ya desplegado— y cada bloque se viste como B.2-24 en la convergencia del hub (UI-4-C). Esta pieza reemplaza al desplegable de rol pelado cuando el flujo de invitación se rediseñe.

## B.2-24 · Tarjeta de permisos de módulo

**Estados:** perfil elegido · personalizado · tilde con alcance
**Receta:** **una tarjeta por módulo** · cabecera sobre `--papel` con ícono y nombre · perfiles como chips de 44px · tildes en grilla de 210px mínimo · el alcance cuelga de su tilde, indentado 26px
**Prohibición:** **el perfil es preselección, jamás autoridad.** El rótulo se deriva por igualdad de conjunto; no se guarda cuál se eligió.

> **La consecuencia de frontera:** un módulo nuevo **manda su tarjeta** y el Hub la sabe pintar. El Hub no aprende qué es «Verificar» ni qué es un Departamento — sólo pinta lo que el módulo declaró.

## B.2-25 · Tarjeta de entrada de datos

**Estados:** compartida (padrón) · propia del módulo
**Receta:** `--card` · **`max-width: 720px`** · borde izquierdo de 4px que **dice dónde vive el dato**: `--verde` si se registra en el padrón compartido, `--amarillo` si es sólo de este módulo · píldora de origen a juego (`--verde-bg`/`--verde` o `--ambar-bg`/`--ambar-tx`) · campos en grilla de **200–300px**, con tope · acciones abajo, con «Agregar más info» al lado de la primaria

> **Por qué el ancho tiene tope.** Un campo de texto de 1.400 px no se lee mejor: se lee peor. En Lab, «Identificador» ocupaba toda la pantalla para recibir ocho dígitos.
>
> **Es norma del canon, no detalle de esta pieza.** Firmada el 31-ago y escrita en `congelado-ui.md` **§B.1.2**, hermana de «estado del sistema vs. color del mundo real». **Las tres cosas que el color dice en Suynda:** el estado, el color del mundo real, y dónde vive el dato. Ninguna más.
>
> **Por qué el color, y no más texto.** Las capturas de Lab repetían la misma distinción dos veces en cada tarjeta: en el título («Médico **(Padrón)**») y en la nota («no hay master local»). **El texto sigue diciéndolo** en la píldora de origen; el color refuerza.

**Prohibición:** **ningún formulario propio.** Hoy Lab tiene «Médico (Padrón)» y «Equipos» resolviendo el mismo problema de dos maneras distintas: eso es lo que esta pieza termina.

## B.2-26 · Agregar más info

**Estados:** cerrado · abierto
**Receta:** borde punteado `--linea`, radio 22px, 44px de alto · al abrirse revela **una tarjeta de entrada**, no campos sueltos
**Prohibición:** jamás esconder acá un campo obligatorio — lo que se oculta es opcional, por definición.

## B.2-27 · Ícono de módulo

**Estados:** sobre claro · activo · sobre el riel
**Receta:** 30×30 · radio 8px · sobre claro `--papel`/`--tinta` · activo `--amarillo`/`--tinta` · sobre riel blanco al 8%
**Prohibición:** **jamás cableado en un repo.** El dibujo lo da el paquete, **cuál** ícono lo dice Foundation (UI-0a-bis), y **el mismo juego viste la landing y el marketing**: un ícono de módulo es identidad de marca, no adorno de una pantalla.

---

## Las dos compuertas, verificadas

| Compuerta | Cómo se verificó | Resultado |
|---|---|---|
| **Toda pieza funciona a 360 px** | `scrollWidth` contra `clientWidth` con el viewport en 360 | **sin desborde horizontal** |
| **Todo objetivo táctil ≥ 44 px** | medidos los 7 selectores interactivos con `getBoundingClientRect` bajo `pointer: coarse` | **ninguno por debajo** |

**Y una tercera, que es la que sostiene a la hoja entera:** los estilos computados se leyeron del documento servido, no del archivo. La primera vez se abrió por `file://`, el navegador lo inlineó como `data:` y los `<link>` no resolvieron: la hoja se veía en Times New Roman con los tokens vacíos. **Una captura de eso habría sido una hoja mintiendo sobre el paquete.**
