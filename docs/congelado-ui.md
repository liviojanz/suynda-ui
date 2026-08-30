# Congelado de UI de Suynda — el canon

**Fecha:** 28 de agosto de 2026
**Pasada:** UI-0b del `Plan de Vestido Canónico v1.1`
**Hogar definitivo:** `liviojanz/suynda-ui`, `docs/congelado-ui.md`
**Estado:** **FIRMADO** por el fundador el 28-ago-2026 —leyendo, y después **viendo** el mockup aprobado (shell · Inicio · Admitir · catálogo de piezas · CRÍTICO invertido · tubos literales)— con la enmienda de CRÍTICO (§B.1.1) aplicada.

> **Este documento es la autoridad visual de Suynda (F1).** Después de firmarlo, los mockups de Visibilidad, el congelado del hub y los tokens de Foundation son **referencia histórica**: se cita este documento, no ellos. Ningún otro documento repite un valor que acá esté declarado.

---

## A. Tokens y tipografía

### A.1 El color

**En castellano (F4).** No es una traducción: el hub ya los tenía así, Foundation también, y el mockup firmado de Visibilidad los declara igual. Acá se unifican y se les da una sola casa.

> **F4, enmendada — regla con excepciones nombradas** *(reviewer, 30-ago).*
> **Vocabulario en castellano. Tres préstamos heredados —`--muted`, `--card` y `--maxw`— se conservan por estar desplegados idénticos en las tres fuentes firmadas; ningún token nuevo entra en inglés.**
>
> Se enmienda porque el enunciado anterior no era literalmente cierto del set, y una regla que su propio ejemplo incumple no gobierna nada. Con la excepción declarada, la hoja de UI-1-B muestra **tres préstamos nombrados**, no una contradicción.

| Token | Valor | Qué es | Regla de uso |
|---|---|---|---|
| `--amarillo` | `#ffc20e` | **LA identidad.** Puerta plena, franja, acentos | **Jamás color de texto. Jamás botón de acción sobre fondo claro** |
| `--tinta` | `#1f1d1a` | Texto, siluetas, estructura, acción primaria | El botón primario es tinta con texto blanco |
| `--tinta-suave` | `#3d4a45` | Texto secundario con peso | |
| `--muted` | `#6b7772` | Texto terciario, metadatos | Nunca para dato que importa |
| `--papel` | `#f6f7f5` | El fondo de la aplicación | |
| `--card` | `#ffffff` | Superficie elevada sobre papel | |
| `--linea` | `#e3e7e2` | Bordes, divisores | |
| `--riel` | `#1c2a25` | El fondo del riel (nivel 2) | |
| `--riel-hover` | `#2a3b34` | Hover dentro del riel | |
| `--verde` | `#0e7a5f` | Positivo, confirmado, nexo | |
| `--verde-bg` | `#e7f3ef` | Fondo suave de lo positivo | |
| `--rojo` | `#b0453a` | Negativo, rechazado, vencido | |
| `--rojo-bg` | `#f9ecea` | Fondo suave de lo negativo | |
| `--ambar-bg` | `#fbf1dc` | Fondo suave de lo pendiente | |
| `--ambar-tx` | `#8a6410` | Texto de lo pendiente (contraste AA sobre `--ambar-bg`) | |
| **`--oro`** | `#7a5b00` | **PROMOVIDO** — texto secundario y rótulos **sobre amarillo**, con contraste AA verificado | Es el único texto legítimo sobre el campo amarillo |
| **`--ambar`** | `#e0a200` | **PROMOVIDO** — profundidad y hover **sobre amarillo** | |

**Dos defunciones, declaradas:**

- **`--coral` (`#f15a2b`) muere ahora.** Cero usos en todo el hub; era "excepción ruidosa rara" y nunca se usó. No entra al canon.
- **`--mist` (`#e6e6e6`) muere con el re-vestido de marketing.** Ya estaba deprecada por mesa (21-ago): la acción es tinta, no gris. Sigue viva sólo porque `SystemCart` y las páginas estáticas la usan (8 usos). **No entra al canon**; se anota como deuda de UI-4-C.

**Los alias en inglés se retiran.** `--ink` (68 usos), `--gold` (18), `--yellow` (13) y `--amber` (5) son la misma cosa dos veces. Se retiran en UI-4-C, cuando el hub converja; **el paquete nace sin ellos**.

#### La temperatura de los neutros — decidida el 29-ago, mirando

El mockup firmado de Visibilidad declara sus neutros **cálidos**; A.1 los declara **verdosos**, tomados del hub y de Foundation. **Los dos estaban firmados**, así que se resolvió mirando un comparador, no por regla de precedencia.

| Token | Mockup (cálido) | **A.1 — GANA** |
|---|---|---|
| `--tinta-suave` | `#4A4741` | **`#3d4a45`** |
| `--muted` | `#75726B` | **`#6b7772`** |
| `--linea` | `#E5E4E0` | **`#e3e7e2`** |

**Son tres, no cuatro:** `--papel` es `#f6f7f5` en los dos. Nunca difirió.

**Criterio del fundador:** menor retrabajo —es lo que el hub y Foundation ya tienen **desplegado en producción**— y **la familia verdosa empareja con el riel (`--riel #1c2a25`) y con el verde de marca**.

**A.1 queda como está. El mockup cede en esos tres**, y pasa a referencia histórica (F1).

**El desvío que este canon corrige, medido:** Visibilidad declara `--yellow: #ffc010` — el amarillo de marca errado por dos dígitos, invisible al ojo — más `--ink #14201c` y un `--muted #6b756f` que no es ni el del canon ni el del mockup. **Los tres mueren en UI-3-C.**

> **Lo que NO era desvío:** su `--line #e5e4e0` es **exactamente** el del mockup firmado. Visibilidad lo copió bien; el desacuerdo era entre el mockup y el hub, y lo resolvió la decisión de arriba. Un recon anterior lo había contado como deriva — queda corregido acá.

### A.2 Escala, espaciado y forma

| Token | Valor |
|---|---|
| `--tx-xs` · `--tx-chrome` · `--tx-sm` · `--tx-base` · `--tx-lg` | `14.5px` · `15.5px` · `16px` · `17px` · `19px` |
| `--space-1` … `--space-5` | `0.5rem` · `1rem` · `1.5rem` · `2.5rem` · `4rem` |
| `--space-6` · `--space-7` | `clamp(4rem,10vw,8rem)` · `clamp(6rem,16vw,12rem)` |
| `--maxw` | `1120px` |
| `--radio` | `12px` |
| `--sombra` | `0 1px 3px rgba(20,32,28,.07), 0 4px 14px rgba(20,32,28,.05)` |
| `--sombra-panel` | `0 8px 30px rgba(20,32,28,.18)` |
| `--foco` | `3px solid var(--tinta)` |

`--space-6` y `--space-7` son de página de marketing; el producto vive entre `--space-1` y `--space-5`.

### A.3 La tipografía — y la enmienda de CSP

| Token | Valor |
|---|---|
| `--tipografia-titulo` | `Poppins, system-ui, sans-serif` |
| `--tipografia-cuerpo` | `Inter, system-ui, sans-serif` |

**Las fuentes se auto-hospedan en el paquete**, con su licencia **SIL OFL** adentro, junto a los `.woff2`. Nunca por CDN.

#### La enmienda declarada a la decisión de mesa del 21-ago

`PUBLIC_SURFACE_CSP` (`foundation/src/http/security-headers.ts:13`) es `default-src 'none'` con lista blanca. **No declara `font-src`**, así que hoy Foundation no puede cargar ninguna fuente, ni siquiera una que sirva él mismo.

**Se agrega una directiva y sólo una: `font-src 'self'`.** Mantiene la postura exacta que ya tienen `script-src`, `style-src` e `img-src`. El comentario de `assets.ts:16` —*"la CSP no se abre por estética"*— se escribió contra CDNs; esto no es un CDN.

**El bug vivo que esto cura, y que ya se reprodujo solo:** Lab declara `Poppins, Inter` y **no carga ninguna** (`src/http/html.ts`). Visibilidad hace exactamente lo mismo, en un repo que nunca tocó Lab. Dos veces el mismo fallback silencioso, porque no había de dónde heredar.

**Nota que viaja con la CSP:** `img-src 'self'` **bloquea `data:`**. El favicon en data-URI de Lab no porta al núcleo; donde Foundation lo adopte, va por ruta servida.

---

## B. Las piezas

### B.1 La reconciliación de la píldora — siete implementaciones, una doctrina

Es la pieza con más deriva del sistema. Hoy existe **siete veces, en tres estilos visuales incompatibles**:

| Dónde | Qué | Estilo |
|---|---|---|
| facturas | `StatusBadge` (6 estados) | fondo suave + anillo, paleta Tailwind |
| facturas | `ConfidenceBadge` | ídem |
| facturas | `FiscalBadge` (4 estados) | ídem |
| facturas | `InvoiceOriginBadge` | ídem |
| lab | `.badge` · `.badge-wait` · `.badge-reject` · `.badge-overdue` · `.badge-verified` · `.badge-delivered` | **relleno sólido saturado**, texto papel |
| lab | `.flag-*` (6 niveles) | relleno sólido, 4 colores fuera de paleta |
| visibilidad | `.pill` · `.pill-ok` · `.pill-pen` · `.pill-al` · `.pill-gris` | fondo suave |

#### La doctrina

**Una sola forma: fondo suave + texto oscuro del mismo tono.** Se elige el estilo suave —no el relleno sólido de Lab— por tres razones: es el de los mockups firmados, es el de dos de las tres superficies, y el relleno sólido de Lab exige texto papel sobre saturado, que en una tabla densa grita.

**El texto siempre dice el estado. El color sólo refuerza** — un daltónico lee la píldora igual.

| Tono | Fondo | Texto | Significa |
|---|---|---|---|
| **Positivo** | `--verde-bg` | `--verde` | aprobado, verificado, entregado, activo |
| **Pendiente** | `--ambar-bg` | `--ambar-tx` | por aprobar, esperando, en revisión |
| **Negativo** | `--rojo-bg` | `--rojo` | rechazado, vencido, fuera de rango |
| **Neutro** | `--papel` con borde `--linea` | `--muted` | sin asignar, no aplicable, desconocido |

**Cuatro tonos, no más.** Las paletas `sky`, `orange`, `emerald` y `slate` de Tailwind desaparecen; el `#163a73` de `.badge-delivered` también — "entregado" es **positivo**, no una cuarta categoría.

> **Corrección al congelado viejo:** la §8 de `design-ui-suynda.md` decía *"Sin asignar (rojo)"*. Es **neutro**, no negativo — "todavía no se asignó" no es un error. El código de facturas ya lo trataba como naranja, discrepando del doc. **Gana el neutro**, y queda escrito acá.

#### La distinción que salva a Lab de perder información

**No todo lo que parece píldora es una píldora de estado.**

- **`.flag-*` (NORMAL · BAJO · ALTO · CRÍTICO · FUERA_DE_RANGO · NO_APLICABLE) es una rampa de severidad**, no cuatro estados. Se mapea a los tonos del canon (neutro · pendiente · pendiente · **negativo con excepción, ver B.1.1** · negativo · neutro).

#### B.1.1 CRÍTICO — la única excepción con grito propio

**Un valor crítico es lo único del sistema que puede costar una vida si se pasa por alto.** Distinguirlo de ALTO por peso tipográfico es insuficiente, y esta sección corrige esa versión.

**El recurso: la inversión de tono.** Dentro del tono negativo, CRÍTICO se pinta **al revés** — relleno sólido `--rojo` con texto `--papel` — más un **ícono**, para que no dependa del color: un informe en escala de grises, o una persona con daltonismo, tiene que separarlo igual.

**Por qué ése y no otro.** Es exactamente el estilo que el §B.1 descartó como norma general, y con la misma frase: *"el relleno sólido exige texto papel sobre saturado, que en una tabla densa **grita**"*. Acá gritar es el punto. No es una inconsistencia con la doctrina: es la doctrina gastando su único grito donde debe oírse.

> **La norma general que esto crea: el sistema grita una sola vez.** El relleno sólido queda **reservado a CRÍTICO en toda Suynda**. Si una segunda cosa se lo apropia, las dos dejan de oírse.

**Y no es sólo aspecto: es comportamiento**, promovido de lo que Lab ya hace y ya prueba (`.criticals-first`, `data-criticals-collapsible="false"`, y el test `tests/browser/criticals.tc13.test.ts` que afirma "primero y nunca plegable"):

1. **Nunca plegable.** Un panel de críticos no se colapsa.
2. **Siempre primero.** Antes de cualquier otra cola, incluidas las promesas.
3. **Nunca truncado.** No se esconde detrás de un "Ver todas": si son doce, se ven doce.

**La justificación es la misma que salvó a los `.tube-*`.** Allá, el color del mundo real cargaba información física que el sistema no debe aplanar. Acá, **la consecuencia del mundo real** carga información que el sistema no debe aplanar. En los dos casos gana el mundo, no la coherencia visual.
- **`.tube-*` (`#f5d76e`, `#6b4c9a`, `#c5c8c4`) NO es una píldora: es una marca de dominio.** Son los colores reales de las tapas de los tubos. Un tubo de suero es amarillo porque el tubo **es** amarillo. **Quedan fuera del sistema de tonos, literales y documentados**, porque aplanarlos al canon destruiría información física que el bioquímico usa.

Esta distinción —**estado del sistema** contra **color del mundo real**— es norma general, no una excepción de Lab.

### B.2 El catálogo de piezas

Cada pieza se especifica con la misma anatomía: **qué es · sus estados · cuándo NO usarla**.

| # | Pieza | Estados | Cuándo NO |
|---|---|---|---|
| 1 | **Píldora de estado** | positivo · pendiente · negativo · neutro | para marcas de dominio (§B.1) |
| 2 | **Botón** | primario (tinta/blanco) · secundario (borde sobre blanco) · fantasma · destructivo | el amarillo **nunca** es botón sobre fondo claro |
| 3 | **Campo de formulario** | reposo · foco (`--foco`) · error · deshabilitado · sólo lectura | — |
| 4 | **Estado vacío** | enseña: qué es esto + acción + canal donde aplique | cuando hay datos filtrados a cero: eso es "sin resultados", otra pieza |
| 5 | **Tarjeta** | plana · elevada (`--sombra`) · interactiva | no anidar tarjetas |
| 6 | **Tabla / lista de trabajo** | con cabecera pegajosa · fila seleccionable · fila en acción | — |
| 7 | **Aviso** | informativo · pendiente · negativo | para algo transitorio: usar toast |
| 8 | **Toast** | éxito · error · en curso | para un error de formulario: va en el campo |
| 9 | **Modal** | confirmación · formulario · destructivo | para navegación: es una pantalla |
| 10 | **Esqueleto de carga** | tarjeta · tabla | si la espera es menor a ~300 ms |
| 11 | **Buscar y elegir** | vacío · buscando · con resultados · elegido | para listas cortas: es un selector |
| 12 | **Monto** | con símbolo de SU moneda, `tabular-nums` | **jamás un monto sin moneda** |
| 13 | **Franja** (nivel 1) | — | — |
| 14 | **Riel** (nivel 2) | módulo activo · disponible · "＋ Activar" | — |
| 15 | **Barra de tabs** (nivel 3) | activa (subrayado amarillo) · inactiva | — |
| 16 | **Barra de estado** (nivel 4) | normal · saldo bajo · sobregiro · sin bolsillo | — |
| 17 | **Tarjeta de métrica con delta** | sube · baja · sin cambio | **jamás una métrica fabricada** (§C) |
| 18 | **Medidor de progreso** | con rótulo y porcentaje | para carga: es un esqueleto |
| 19 | **Calendario semanal** | con franjas horarias | — |
| 20 | **Chip de canal** | con ícono de la plataforma | — |
| 21 | **Módulo sin entitlement** | la pantalla que ve quien no lo contrató | *(dueño explícito, F-observación 28-ago: hoy cada módulo lo resuelve solo)* |

**Sobre el monto:** el guaraní se escribe **`₲ 1.833.750`** — símbolo, espacio, separador de miles con punto, sin decimales. El `G. 1.833.750` que usa `suynda-landing/src/lib/format.ts` **muere**; era la única superficie que lo escribía distinto. USD, BRL y ARS llevan dos decimales y su propio símbolo.

---

## C. La plantilla de Inicio

**Es una pieza del sistema, no una pantalla libre.** Estructura fija; el contenido lo pone cada módulo.

| Zona | Qué va | Regla |
|---|---|---|
| **1 · Saludo y contexto** | quién sos, y de qué período habla la pantalla | — |
| **2 · Fila de métricas** | 3–4 tarjetas de métrica con delta | **jamás una métrica fabricada** |
| **3 · Zona de atención** | lo que espera una decisión — aprobaciones, vencidos, bloqueados | **posición constante entre módulos**: quien aprende dónde mirar en un módulo, lo sabe en todos |
| **4 · Paneles de trabajo** | las colas del módulo, cada una con "Ver todas" | — |
| **5 · Vacíos que enseñan** | cada panel vacío dice qué es y qué hacer | nunca un panel en blanco |

**Las dos instancias de referencia** son el Inicio de Lab y el del mockup firmado de Visibilidad.

> **La prohibición, escrita fuerte: jamás una métrica fabricada.** Si el dato no existe todavía, la tarjeta muestra su estado vacío. Un número inventado en la zona 2 es peor que no tener la zona: convierte la pantalla en decoración y enseña a desconfiar de ella.

---

## D. Las tres enmiendas

Al firmarse este documento, los tres documentos existentes **pasan a citar en vez de definir**. Ninguno vuelve a declarar un valor.

| # | Documento | Qué cambia |
|---|---|---|
| **D-1** | `visibilidad/docs/VISIBILIDAD-UI-CONTRACT-v1.md` **§1** | La precedencia se **invierte**: hoy lista *"1. este contrato · 2. los PNG · 3. la especificación canónica del design system"*. Pasa a: **1. el canon de plataforma** · 2. este contrato · 3. los PNG. Los PNG siguen siendo normativos para jerarquía, densidad y tono — no para color, tipografía ni componentes |
| **D-2** | `suynda-landing/docs/design/design-ui-suynda.md` **§8** | Deja de definir píldoras, botones, vacíos y montos. Cita §B de este canon. **Incluye la corrección de "Sin asignar": era rojo, es neutro** |
| **D-3** | `foundation/src/http/assets.ts`, comentario de cabecera | Hoy dice que los tokens salen del congelado del hub y que `system-ui` se queda por CSP. Pasa a citar este canon y a registrar la enmienda `font-src 'self'` con su fecha de firma |

---

## E. Compuerta y firma

**Compuerta de UI-0b:** ningún documento repite un valor que el canon declara, y los tres viejos citan.

**Firma:** del fundador, **leyendo**. Lo que se firma:

1. La tabla de color completa, con las dos promociones (`--oro`, `--ambar`) y las dos defunciones (`--coral` ahora, `--mist` con marketing).
2. La tipografía de marca auto-hospedada, y la enmienda `font-src 'self'` como desviación declarada.
3. **La doctrina de la píldora**: cuatro tonos, fondo suave, el texto siempre dice el estado — y la distinción entre estado del sistema y color del mundo real.
3-bis. **CRÍTICO con grito propio** (§B.1.1): inversión de tono, ícono, y las tres reglas de comportamiento. *Enmienda del fundador, aplicada.*
4. **La corrección de "Sin asignar"**: neutro, no rojo.
5. **El monto**: `₲`, y la muerte del `G.` del hub.
6. La plantilla de Inicio, con la prohibición de métricas fabricadas.
7. Las tres enmiendas.

Con esto firmado, **UI-1 queda habilitada**: el paquete se construye contra este documento y contra nada más.
