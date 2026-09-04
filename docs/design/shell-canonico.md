# Shell canónico — UI-0a

**Fecha:** 28 de agosto de 2026
**Pasada:** UI-0a del `Plan de Vestido Canónico v1.1`
**Hogar definitivo:** `liviojanz/suynda-ui`, `docs/design/shell-canonico.md`
**Estado:** **FIRMADO** por el fundador el 28-ago-2026 —leyendo, y después **viendo** el mockup— con la enmienda de las dos píldoras de la franja (§1.1) aplicada. Nada de código.

---

## 0. Qué es esto — promoción, no invención

**La doctrina del shell ya existe y ya está implementada.** El hub la escribió en los comentarios de sus cuatro componentes, citando el §2 del congelado (`design-ui-suynda.md`). Este documento **la promueve a norma de plataforma** y responde las dos preguntas que el hub nunca tuvo que hacerse, porque era el único que renderizaba un shell:

1. **¿Cómo recibe el shell un módulo que no es el hub?** (§2)
2. **¿Qué hace Lab, que hoy lo contradice?** (§3)

Todo lo demás acá es cita, no propuesta.

---

## 1. Los cuatro niveles

| Nivel | Qué es | Contiene | De quién es | Quién lo puebla |
|---|---|---|---|---|
| **1 · La franja** | Barra superior amarilla, 54 px | wordmark · selector de espacio (píldora tinta) · ayuda · avatar | **Plataforma** | `/v1/shell` + `/v1/me` |
| **2 · El riel** | Vertical oscuro, colapsado a íconos (60 px), se ensancha al hover en desktop | Inicio → **módulos activos del espacio** → "＋ Activar módulo" → Configuración al pie | **Plataforma** | `launcher[]` de `/v1/shell` |
| **3 · La sub-barra** | Tabs bajo el título de la pantalla | **las secciones del módulo actual** | **Del módulo** | el módulo, de su propio dominio |
| **4 · La barra de estado** | Franja inferior, patrón Kaspersky: nunca grita | créditos + "Recargar" | **Plataforma** | `balance` de `/v1/shell` |

**Las tres exclusiones que el congelado ya fijó, y que se mantienen:**

- La franja **no** lleva créditos — viven en el nivel 4.
- La franja **no** lleva navegación de módulos — vive en el nivel 2.
- El riel **no** lleva secciones del módulo — viven en el nivel 3.

**Marcas de estado:** módulo activo en el riel = ícono amarillo + hilo amarillo. Tab activa en la sub-barra = subrayado amarillo.

### 1.1 Las dos píldoras de la franja — *enmienda firmada, 28-ago*

El nivel 1 lleva **dos selectores, no uno**, y el hub ya los tiene construidos y probados (`lib/doble-selector.ts`, `lib/doble-selector.test.ts`). Esto es promoción con citas.

| | Píldora | La pregunta | Qué lista | Tono |
|---|---|---|---|---|
| **Izquierda** | **Organización** | **¿desde dónde actúo?** | **todas** las organizaciones de las que el usuario forma parte — propias, hermanas, y donde sea socio o empleado | tinta |
| **Centro** | **Espacio de trabajo** | **¿sobre quién actúo?** | "Mi espacio" **+ la cartera de Nexos de la organización elegida a la izquierda** | **tinta = propio · verde = prestado** |

**Se elige el sombrero a la izquierda, la mesa al centro.**

#### El centro DEPENDE de la izquierda

**Fundamento doctrinario — Reafirmación 3: el Nexo se ata a una organización concreta, jamás al grupo.** Cada organización tiene su propia cartera. Por eso son dos selectores y no uno: **cambiar la izquierda recarga el centro.**

> **El ejemplo de las hermanas.** "Livio Janz" y "Livio Janz finanzas" son dos organizaciones del mismo grupo, y van las dos a la píldora izquierda. Si el estudio contable atiende a Ferretería Río **por** "Livio Janz finanzas", ese cliente aparece en el centro **sólo cuando la izquierda dice "Livio Janz finanzas"**. Parado en "Livio Janz", el centro no lo ofrece — porque el Nexo no existe desde ahí. Un solo selector no podría expresar eso.

**Verificado, el código ya reparte así:**

- `organizacionesPropias(me.tenants, cartera)` (`lib/doble-selector.ts:100`) mapea **todos** los `tenants` de `/v1/me` —que son todas las membresías del usuario, sin filtrar por rol— y a cada una le cuenta lo suyo: `cuantosClientes: cartera.filter(f => f.viaTenantId === t.tenantId).length`.
- `espaciosDe(organizacionTenantId, cartera)` (`:137`) devuelve `[propio, ...ajenos]`, donde `ajenos` **filtra por `viaTenantId === organizacionTenantId`** (`:151`). El centro es "Mi espacio" más los Nexos **de esa** organización, y nada más.

**El color no es decoración — es el mecanismo de seguridad.** El congelado §4 lo nombra: *"semántica de color = semántica de ubicación: tinta = lo mío, verde = operando para un cliente… la defensa visual contra cargar datos en el cliente equivocado"*. Con dos píldoras esa defensa está siempre a la vista, sin abrir nada.

**Lo que el color NO dice, y por eso el banner sobrevive:** verde significa "no es tuyo", **no cuál relación**. Un nexo y una tutela se pintan igual.

**El buscador.** Aparece a partir de **8 filas** (`shell.ts`: `caja.hidden = todos.length < 8`). El asesor con cientos de clientes tipea; *"un campo sobre tres filas es ruido en el espacio más caro de la pantalla"*.

#### La regla de aparición

> **Un menú de una opción es decoración.** Se aplica por píldora:
> - **La izquierda se oculta** si el usuario participa de **una sola** organización.
> - **El centro se oculta** si la organización activa **no tiene Nexos** — queda implícito "Mi espacio".

El enunciado es del hub, no inventado acá: su test lo dice con todas las letras — *"un menú de una opción es decoración"* (`doble-selector.test.ts:270`), sobre la izquierda.

**Lo que falta construir:** hoy la píldora del centro **no puede ocultarse** — su tipo es `derecha: { nombre, tono }`, sin campo `visible` (`doble-selector.ts:229`). Se le agrega uno en UI-4-C.

> **Corrección registrada (28-ago).** Una versión anterior de esta sección afirmaba que el centro listaba también las organizaciones hermanas, y por eso objetaba la regla. **Era falso**, y la objeción caía con él: `espaciosDe` filtra por `viaTenantId` y las hermanas viven en la píldora izquierda. El error fue leer `clase === 'propio'` —que es **una** entrada, "Mi espacio"— como si fueran las hermanas. La regla del fundador era correcta desde el principio.

#### Los datos: la lista trabajable **no** está en `/v1/shell`

Sale de un **tercer endpoint, `GET /v1/cartera`** (el hub la pide por `/api/cartera`; `scripts/shell.ts:186`). Foundation la resuelve **por USUARIO**, no por tenant — es la corrida CAR-1, y el comentario del hub lo dice: *"la cartera es del asesor"*, y **se sigue viendo estando conmutado**.

> **Precisión sobre el alcance, verificada.** El endpoint recibe **sólo `token.sub`** (`routes/session.ts:144` → `auth/session.ts:446`): devuelve la cartera del usuario **entera, de todas sus organizaciones a la vez**. Pero **no es indistinta**: cada fila trae **`viaTenantId`** (`session.ts:458`), que es exactamente "la organización por la que existe este Nexo". El reparto por organización es del cliente, y **la Reafirmación 3 está honrada en el dato**, que es donde importa. Una llamada, un reparto local, ningún round-trip por cambio de sombrero.
>
> **La consecuencia que sí hay que saber:** nada del lado del servidor acota la respuesta al espacio activo. Para el hub es correcto —es el mismo usuario—, pero **un módulo que algún día consuma la cartera recibiría clientes de organizaciones ajenas al espacio donde está parado**. Si eso llega a pasar, el acote se decide ahí, con su propio diseño. Hoy no hay tal consumidor.

**Y por eso no se pliega en `/v1/shell`.** `/v1/shell` es del **espacio activo**; la cartera es del **usuario** y sobrevive al cambio de espacio. Plegarla cambiaría su alcance y su caché: sería el error del §2.1 del plan cometido en la otra dirección — asumir que dos endpoints responden lo mismo sin verificar la pregunta. **UI-0a-bis no la toca**; su pliegue sigue siendo ícono, URL de módulo y URL del hub.

**El riel, bajo sesión prestada,** muestra los módulos del espacio activo —propio o prestado— con las facultades delegadas. Eso ya lo resuelve `/v1/shell`: en sesión prestada, `entitled` no es "el espacio tiene el módulo" sino "el espacio lo tiene **y esta sesión lo opera**" (`shell-service.ts`), para que el riel no ofrezca puertas que dan 403.

---

### 1.2 El Hub tiene asiento fijo

**Primera posición del riel, incondicional.** El Hub **no es un módulo**: no depende de entitlements ni del espacio activo. Los módulos de abajo varían; **la casita jamás**.

### El orden del riel — enmienda del 2-sep-2026

```
casita  →  vertical(es) del espacio  →  horizontales
```

Los módulos son de dos clases, y la distinción es de negocio, no de
infraestructura: **verticales** son gestión específica de un tipo de negocio
—`lab`, `vet`, `taller`, `milk`, `farm`, `comercio`, los **arcos** de la franja
de la landing— y una organización generalmente tiene **uno**. **Horizontales**
son administración general —`compra`, `factura`, `nucleo`, `talento`,
`visibilidad`, `conecta`, `deposito`, las **piezas de puzzle**— y una
organización tiene **varias**.

**El dato lo da la plataforma; el orden lo aplica quien pinta.** `/v1/shell`
devuelve `kind` por ítem del launcher y **no** ordena por él: ordenar es
decisión de presentación, y el mismo dato sirve a un riel vertical, a una barra
inferior y a la landing sin que Foundation opine sobre ninguno.

**Varios verticales se apilan por orden de activación.** Nada especial hasta
que el caso exista — un espacio con dos verticales es hipotético hoy, y
diseñarle un tratamiento propio sería resolver un problema que nadie tiene.

**La misma jerarquía rige la barra inferior en móvil.** Es el mismo orden en
otra orientación, no un segundo criterio.

> **Lo que esta enmienda NO decide:** si la diferencia de aspecto que la
> landing ya hace entre arcos y piezas de puzzle se traduce en algún matiz
> visual del riel. Eso se decide **viendo** la hoja de firma de la corrida de
> íconos, que agrupa los dibujos por clase. No se inventa antes.

**Verificado — es promoción:**

- **El hub** cablea la casita fuera del bloque dinámico: `<a class="riel__item" href="/panel">🏠 Inicio</a>` va **antes** del separador y de `<div id="shell-riel-modulos">`, que es lo único que el launcher puebla (`Riel.astro:17-24`).
- **Visibilidad** hace lo mismo sin que nadie se lo pidiera: `rail-link` con `data-testid="hub-link"` es el primer hijo del `<nav aria-label="Módulos Suynda">` (`SuyndaShell.tsx:295`).

**El wordmark también navega al Hub** — segunda puerta, convención universal. Ya es así: `<a class="franja__wordmark" href="/panel">suynda</a>` (`Franja.astro:11`).

**Precisión de contexto:** la casita lleva al **hub del espacio activo**. No cambia de mesa; para cambiar de mesa está la píldora del centro. **Cada control hace un solo trabajo.**

---

**Dónde va el nombre del módulo:** como **título de pantalla, encima de la sub-barra** — no como marca en el riel. Sin ambigüedad:

- **El wordmark dice `suynda`, siempre.** Jamás "Suynda Lab". El `.rail-brand` de Lab **muere en UI-2V**.
- **El nombre del módulo es el H1 de la pantalla**, sobre las tabs. La casa arriba, la habitación en el contenido.
- **La primera tab dice "Inicio"** — no repite el nombre del módulo. El wordmark del nivel 1 es de la plataforma (`suynda`), y es el único. Así lo muestra el mockup firmado de Visibilidad: "Visibilidad" es el título, y debajo van sus tabs.

> **La regla que gobierna las dudas futuras** (§2.1-bis del plan):
> **El paquete manda cómo se ve. Foundation manda qué se muestra.**
> El paquete jamás lleva datos de usuario; Foundation jamás lleva estilos.

---

## 2. Cómo un módulo recibe el shell

**Son dos respuestas separadas, y confundirlas es el error caro:**

| | De dónde viene | Qué es |
|---|---|---|
| **El aspecto** | `@suynda/ui` | tokens y primitivas CSS de los cuatro niveles |
| **Los datos** | `GET /v1/shell` | espacio, launcher, balance, branding |

### 2.1 El shell lo RENDERIZA cada módulo

No es un iframe, y no es HTML servido por el hub. Tres razones, todas verificables:

1. **Orígenes distintos** — `suynda.com`, `lab.suynda.com`, `compra.suynda.com` y el futuro de Visibilidad son hosts separados.
2. **Deploys separados** — Vercel para el hub, Railway para los módulos. No hay build compartido que pudiera inyectar markup.
3. **Foundation sirve con `frame-ancestors 'none'`** (`security-headers.ts:13`), así que embeber sus pantallas está prohibido por su propia CSP.

**Ya hay prueba de que funciona:** Visibilidad renderiza su propio shell (`ui/src/shell/SuyndaShell.tsx`, 403 líneas) contra `/v1/shell` (`src/platform/foundation/shell.ts`, parseo cerrado), sin que nadie se lo especificara.

### 2.2 Qué trae `/v1/shell` hoy

```
user      { id, nombre }
tenant    { id, razon_social, nombre_negocio }   ← el rótulo del espacio, resuelto
launcher  [{ key, nombre, descripcion, nivel, entitled, action }]
balance   { saldo, en_sobregiro, bajo, gracia_restante } | null
branding  { logo_url, color_primario, color_acento }
```

`launcher[]` trae **también los módulos no contratados**, con `action: "expand"` — es el "＋ Activar módulo" del riel. Y excluye la clase `plataforma`: `foundation` y `padron` no son apps del launcher.

### 2.3 Lo que falta, y va a UI-0a-bis

| Falta | Hoy está | Consecuencia visible |
|---|---|---|
| **Ícono del módulo** | cableado en 2 repos: `Riel.astro` y `launcherIcon()` de Visibilidad | En el riel de Visibilidad, **Compra y Talento son cuadraditos idénticos** |
| **URL del módulo** | `suynda-landing/src/config.ts:126` (`MODULE_URLS`) | Cada módulo tendría que cablear las mismas cinco URLs |
| **URL del hub** | variable de entorno por módulo (`platform.hubPublicUrl`) | Un hub que se mude obliga a redeploy de cada módulo |

Los tres son **qué se muestra**, no cómo se ve: por la regla del §1, van a Foundation.

---

## 3. El mapa de Lab

**Lab contradice el nivel 2.** Su riel lleva sus propias estaciones (`.rail-link` en `html.ts`), no los módulos de la plataforma. No tiene franja, ni sub-barra, ni barra de estado: su `.rail-brand` dice "Suynda Lab" y hace de wordmark.

`LAB_STATIONS` (`src/lab/stations.ts`) tiene **7 estaciones** — 6 del grupo `daily` más `configuracion` al pie:

| Estación | Rótulo | Grupo hoy | **Destino** |
|---|---|---|---|
| `inicio` | Inicio | daily | **Tab 1** de la sub-barra |
| `admitir` | Admitir | daily | **Tab 2** |
| `muestras` | Muestras | daily | **Tab 3** |
| `cargar` | Cargar | daily | **Tab 4** |
| `verificar` | Verificar | daily | **Tab 5** |
| `entregar` | Entregar | daily | **Tab 6** |
| `configuracion` | Configuración | config | **Tab 7** — ver la decisión D1 |

Las 7 caben: el mockup firmado de Visibilidad tiene 8 tabs.

### Los tres elementos que cambian de dueño

| Hoy en Lab | Va a |
|---|---|
| `.rail-brand` — "Suynda Lab" | **Muere.** El wordmark es de la franja y dice `suynda`. El nombre del módulo pasa a **título de pantalla**, encima de las tabs |
| `.rail-link` × 7 — las estaciones | **Nivel 3**, la sub-barra |
| El riel entero | **Nivel 2**, con los módulos del `launcher` de `/v1/shell` |
| *(no existe)* | **Nivel 1** franja y **nivel 4** barra de estado: nuevos en Lab, del paquete |

### D1 — la decisión que este documento pide firmar

**Hay dos "Configuración" y no son la misma.** La del pie del riel (nivel 2) es de la **plataforma**: el espacio, el equipo, los datos de la organización. La `configuracion` de Lab es del **módulo**: el catálogo clínico, sus departamentos, sus determinaciones.

**Propuesta:** la de Lab es una **tab más** de la sub-barra —es una sección del módulo, como cualquier otra— y el pie del riel queda para la Configuración de plataforma. Se llaman igual y viven en niveles distintos, lo cual es correcto pero pide cuidado en el rótulo: la del módulo puede decir **"Catálogo"**, que es lo que realmente configura.

> Alternativa descartada: que la `configuracion` de Lab vaya al pie del riel. Rompería el nivel 2, que es de plataforma, y pondría una pantalla del módulo en el lugar donde el usuario espera salir de él.

---

## 3-bis. El shell en pantalla angosta

Se congela **el comportamiento de los cuatro niveles**. El diseño de las pantallas de cada módulo en móvil **no** entra: eso es post-piloto, con datos reales.

### El punto de quiebre

**860 px**, y no es elegido a dedo: es el que el riel del hub **ya usa** para dejar de ser un riel de escritorio — `@media (hover: hover) and (min-width: 861px)` gobierna tanto el ensanche por hover como la aparición de las etiquetas (`Riel.astro:56,84`). Por debajo de 861 el hub ya se considera angosto. El resto de los quiebres del repo (1100 y 700 en `global.css`, 560 en `Franja.astro`) son de contenido, no de marco.

### Nivel por nivel — con qué es promoción y qué es cambio

| Nivel | Qué se congela | Estado |
|---|---|---|
| **3 · Tabs** | horizontales con scroll | ✅ **PROMOCIÓN** — `SubBarra.astro:49` ya tiene `overflow-x: auto` |
| **2 · Riel** | pasa a **barra inferior** con los módulos, casita del Hub en primera posición | ⚖️ **DECIDIDO — cambia lo construido, ver abajo** |
| **1 · Franja** | se comprime a wordmark + píldora del centro; la de organización se pliega al menú del avatar | 🆕 **DISEÑO** — hoy no existe |
| **4 · Barra de estado** | se pliega al menú del avatar | 🆕 **DISEÑO** — hoy queda visible, es una franja de 40 px en flujo normal (`BarraEstado.astro:105-114`) |

### El riel en móvil — DECIDIDO: barra inferior

> **NORMA.** En pantalla angosta el riel **pasa a barra inferior**, con los módulos y **la casita del Hub en primera posición**. Objetivos táctiles **≥ 44 px**.

**Se decide contra lo construido, y por eso queda documentado de los dos lados.**

**Lo que el hub hace hoy:** el riel sigue vertical, 60 px, sólo íconos. Su código lo justifica citando la norma vieja: *"En móvil (sin hover) nunca aparece [la etiqueta]: **íconos con tap, como fija el congelado §2**"* (`Riel.astro:76-79`).

**Por qué gana la barra inferior** *(motivo del fundador, 29-ago)*:

- **La puerta de entrada de Suynda es el celular** — el alta es por WhatsApp. El móvil no es el caso degradado; es el primero.
- **El riel vertical cobra ~17 % del ancho a 360 px**, de forma constante, **en todas las pantallas de todos los módulos**. La barra inferior **cobra alto, que es lo que sobra**.
- Es **el patrón que el pulgar ya conoce**.
- No choca con nada: la barra de estado **no** está fija abajo hoy, y en este modelo se pliega al menú del avatar.

**Lo que se pierde:** era lo construido, probado y desplegado, y el §2 lo había elegido a propósito.

> **Nota doctrinaria — esto no deroga el canon: lo escribe.** El código del hub justificaba el riel vertical citando el §2 del congelado del hub, que **es referencia histórica desde la firma de UI-0b**. La autoridad visual es el canon; el §2 dejó de decidir en el momento en que se firmó el documento que lo reemplaza.

**Consecuencias, declaradas:**

| Quién | Cuándo |
|---|---|
| **El hub** | **reconverge en UI-4** — su riel móvil se reconstruye ahí, **no ahora** |
| **Los módulos nuevos** | **nacen cumpliendo** |
| **Lab** | se lo lleva **UI-2V**, junto con el resto del shell corregido |

### Las dos reglas de compuerta que UI-1 hereda

1. **Toda pieza del catálogo funciona a 360 px de ancho.**
2. **Todo objetivo táctil mide ≥ 44 px.**

**El catálogo navegable se revisa también en angosto**, y la firma viendo del fundador incluye esa vista.

---

## 4. Lo que este documento NO resuelve

Se nombran para que no se descubran después como huecos:

1. **Promesas.** El Domain Model §32 la nombra como ítem diario; el congelado de UI la puso adentro de Inicio/Entregar y no como séptima entrada del riel. **No se reabre acá** — sigue donde el congelado la dejó.
2. **El orden de los módulos en el riel.** `/v1/shell` devuelve `launcher[]` sin criterio de orden declarado. Si importa, es campo nuevo y va con UI-0a-bis.
3. **El riel en móvil.** El hub lo deja "a íconos con tap"; sin íconos por módulo (§2.3) el problema es peor en móvil que en desktop, donde al menos hay hover.
4. **Qué ve un módulo sin entitlement** — hoy cada uno lo resuelve por su cuenta; es superficie del paquete, no de este documento.

---

## 5. Compuerta y firma

**Compuerta de UI-0a:** los tres entregables —doctrina (§1), cómo se recibe (§2), mapa de Lab (§3)— con recon citado y fresco.

**Firma:** del fundador, **leyendo**. Lo que se firma concretamente:

- Los cuatro niveles como norma de plataforma, con sus tres exclusiones.
- **Las dos píldoras de la franja** (§1.1), con la norma "un menú de una opción es decoración" y la cartera **fuera** del pliegue.
- **El asiento fijo del Hub** (§1.2) y el nombre del módulo como H1 sobre las tabs.
- **El comportamiento en pantalla angosta** (§3-bis), con el riel a **barra inferior** decidido contra lo construido, y las dos reglas de compuerta que UI-1 hereda.
- Que el shell lo renderiza cada módulo, contra `/v1/shell` y con el paquete.
- El mapa de las 7 estaciones de Lab, **incluida la decisión D1** sobre las dos Configuración.

Con eso firmado, UI-0a-bis y UI-0b quedan habilitadas.
