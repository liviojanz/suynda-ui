# Plan de Vestido Canónico de Suynda — v1.1 CONGELADO

**Fecha:** 28 de agosto de 2026
**Molde:** `Suynda_Lab_Plan_Integracion_Canonica_v1.1` — mismo nivel de precisión, formato congelable
**Estado:** **CONGELADO**. Firmado por el fundador el 28-ago-2026. La v1.1 invierte el §2.1 con la corrección registrada y reordena las pasadas (E5–E9).
**Hogar definitivo:** `liviojanz/suynda-ui`, `docs/plan-vestido-canonico.md`

**El orden:** UI-0a → UI-0a-bis → UI-0b → UI-1 → **UI-2P ∥ UI-3** → UI-2V → UI-4

> **ENMENDADO (E12, 2-sep): UI-2V va ANTES que UI-3.** El orden vigente es
> **UI-0a-bis → UI-2V → UI-3 → UI-4**. Ver el registro de enmiendas.

---

## 0. Qué es este plan, y qué no

Es el camino por el que Suynda pasa de **cuatro superficies que dibujan pantallas cada una a su manera** a **un sistema visual único, versionado y con compuerta**, sin detener el producto y sin re-escribir lo que va a morir.

**No es** un rediseño. La identidad ya está decidida y firmada: los mockups de Visibilidad, el congelado del hub y los tokens de Foundation dicen lo mismo. Este plan la **consolida, la distribuye y la hace obligatoria**.

**No hace** cuatro cosas, a propósito: no toca `facturas-py`, no abre la CSP a terceros, no crea una librería de componentes compartida (imposible entre Astro, React y strings de TypeScript), y no promete fidelidad de píxel contra los PNG.

---

## 1. Premisas firmadas — entran como hecho, no se reabren

| # | Decisión | Consecuencia operativa |
|---|---|---|
| F1 | **La autoridad nace en UI-0.** El congelado canónico supera a todas las fuentes. Después de UI-0 los mockups son referencia histórica; el documento es lo único citable. | Tres documentos viejos pasan a citar en vez de repetir |
| F2 | **Shell: riel = módulos de la plataforma · tabs = secciones del módulo.** | El hub ya cumple · **Lab es el desviado y se corrige** · Visibilidad y Núcleo nacen cumpliendo |
| F3 | **Precedencia §1 de Visibilidad se invierte** — canon de plataforma primero | Enmienda a `VISIBILIDAD-UI-CONTRACT-v1.md` en UI-0b |
| F4 | **Castellano** como vocabulario del sistema | Ya probado: el mockup firmado declara `--amarillo`, `--papel`, `--verde`, `--riel` |
| F5 | **Tipografía de marca (Poppins/Inter) en las CUATRO superficies**, auto-hospedada, con `font-src 'self'` en la CSP de Foundation | Enmienda declarada a la decisión de mesa del 21-ago; ver §2.2 |
| F6 | **El catálogo se dimensiona con las DOS listas** — el inventario del recon + las piezas de los mockups | Ver §3.3, tabla de piezas |
| F7 | **Plantilla de Inicio como pieza del sistema** — estructura fija, contenido del módulo, jamás métricas fabricadas | Lab y el mockup de Visibilidad son las dos instancias de referencia |
| F8 | `facturas-py` **no se retoca**; se le rescatan modal, toast y esqueleto antes del estrangulamiento | UI-4 |
| F9 | **Compuerta anti-deriva** adoptable por pin | UI-1, sub-corrida D |
| F10 | Ruta de estáticos de Lab como **trabajo nombrado**, no efecto colateral | UI-2, sub-corrida A |

---

## 2. Lo que este plan agrega a lo firmado

### 2.1 El shell se alimenta de `/v1/shell` — **INVERTIDA respecto de v1.0**

**La decisión:** el marco lee `GET /v1/shell` (`suynda-foundation/src/http/routes/shell.ts:45`, registrado en `server.ts:523`). Es el endpoint del marco —nació como *"the frame"*, Fase 5 §7.5— y el marco es exactamente lo que este plan diseña. **`/v1/me` queda como está: identidad, no marco.** Ninguno de los dos muere.

**Lo que ya trae `/v1/shell`:** `user`, `tenant { id, razon_social, nombre_negocio }` —el rótulo del espacio, resuelto— y `launcher[]` con `{ key, nombre, descripcion, nivel, entitled, action }` — **el rótulo del módulo, resuelto**, incluidos los no contratados con `action: "expand"`. Más `balance` y `branding`.

**Lo que trae `/v1/me` y el otro no:** la lista de espacios (`tenants[]`, con `role`, `slug` y `grupo`), `modulosSinFacultades`, y los claims `mandateId`/`tutelaId` de sesión prestada. **Ninguno es superconjunto del otro.**

#### Por qué la v1.0 estaba mal fundada — registrado, no borrado

La v1.0 decía *"`/v1/shell` sería un segundo endpoint respondiendo la misma pregunta"*, invocando el precedente D12. **Se aplicó el precedente sin verificar que fuera la misma pregunta, y no lo es.**

- **D12 rechazaba un endpoint NUEVO** para algo que un endpoint existente ya resolvía.
- **Acá había dos endpoints VIEJOS**, vivos desde julio, con trabajos distintos: `/v1/me` nació el 23-jul (`9c299b7`, Batch D, cierre de Fase 2 — identidad) y `/v1/shell` el 24-jul (`7041e99`, Fase 5 §7.5 — el marco). Ningún commit agregó uno y retiró el otro; el más reciente (`b0c14d8`, 26-ago) **toca los dos a la vez**.
- El hub consume **los dos**, por BFF separados (`pages/api/auth/me.ts` y `pages/api/shell.ts`), y pide `/api/shell` en toda pantalla con AppShell.
- Y **Visibilidad eligió bien sin que nadie se lo dijera**: `src/platform/foundation/shell.ts` consume `/v1/shell` con parseo cerrado.

El error de método fue declarar un hueco sin buscar el nombre: se verificó qué devuelve `/v1/me` y nunca se buscó `/v1/shell`. **El plan se enmienda con evidencia; no se defiende una firma vieja.**

### 2.1-bis La frontera, como regla

> **El paquete manda cómo se ve. Foundation manda qué se muestra.**
> El paquete **jamás** lleva datos de usuario. Foundation **jamás** lleva estilos.

Es la que decide, ante cualquier duda futura, si algo va al `@suynda/ui` o a un endpoint.

### 2.2 La enmienda de CSP, con su alcance exacto

`PUBLIC_SURFACE_CSP` (`src/http/security-headers.ts:12`) es `default-src 'none'` con lista blanca explícita. **No declara `font-src`**, así que hoy Foundation no puede cargar ninguna fuente — ni siquiera una que sirva él mismo.

La enmienda agrega **una directiva, `font-src 'self'`**, y nada más. Mantiene la postura: mismo `'self'` que ya tienen `script-src`, `style-src` e `img-src`. El comentario de `assets.ts:16` que dice *"la CSP no se abre por estética"* se escribió contra CDNs; esto no es un CDN.

**Hallazgo que cura de paso:** Lab declara `font-family: Poppins, Inter, sans-serif` en `src/http/html.ts` y **no carga ninguna de las dos** — sin `@font-face`, sin `<link>`. En cualquier máquina sin Poppins instalada, `lab.suynda.com` cae a `sans-serif` en silencio. Su tipografía de marca es ficción, hoy, en producción. Es un caso vivo de la trampa del fallback silencioso.

### 2.3 El favicon en data-URI no porta al núcleo

`img-src 'self'` bloquea `data:`. La diana que Lab lleva embebida (commit `02c7043`) **no funcionaría en Foundation**. Donde el núcleo la adopte, va por ruta servida — el molde es `/flow/assets/app.css`.

---

## 3. Las pasadas

### UI-0a — El shell, especificado

**Por qué existe separada:** la decisión de fondo (F2) está firmada, pero *ejecutarla* es una decisión de producto sobre una pantalla desplegada y en uso. El congelado no se puede escribir honestamente antes, y la UI-1 y la UI-2 se dimensionan de acá.

**Write-scope:** se crea el repo `liviojanz/suynda-ui` **con documentos solamente, sin código**. Un archivo: `docs/design/shell-canonico.md`.

| Sub-corrida | Qué produce | Cierra cuando |
|---|---|---|
| **A · Doctrina** | Qué es el riel, la franja, la sub-barra y las tabs. Qué le toca a la plataforma y qué al módulo, atado a la doctrina `frontera-modulo-plataforma-rev1` | La frontera está dicha sin ambigüedad para un módulo que todavía no existe |
| **B · Cómo un módulo recibe el shell** | **Dos respuestas separadas: el ASPECTO viene del paquete, los DATOS de `/v1/me`.** Recon citado de qué falta en `/v1/me` y decisión sobre §2.1 | Ningún módulo necesita pedirle HTML al hub |
| **C · El mapa de Lab** | Las **7** estaciones de `LAB_STATIONS` (`src/lab/stations.ts`) — 6 del grupo `daily` más `configuracion` al pie —, una por una: cuál va a tab, cuál desaparece, cuál cambia de nombre. Más el destino de `.rail-brand` y `.rail-link-config` | Un ejecutor puede reestructurar Lab sin preguntar nada |

**Restricción que la sub-corrida B debe declarar explícitamente:** los módulos viven en **orígenes distintos** (`lab.suynda.com`, `compra.suynda.com`, `suynda.com`) y se despliegan por separado; Foundation además sirve con `frame-ancestors 'none'`. El shell **lo renderiza cada módulo**, con las piezas del paquete y los datos de Foundation. No es un iframe ni HTML servido por el hub.

**Compuerta:** los tres entregables, con el recon citado y fresco.
**Firma que la gatea:** del fundador, **leyendo**.

---

### UI-0a-bis — Ícono y URL de módulo se pliegan en `/v1/shell`

**El rótulo ya lo trae** (`launcher[].nombre`). Lo que falta es **el ícono y la URL de destino**, y la falta está medida:

- **Tres repos inventan íconos por su cuenta.** El hub los cablea en `Riel.astro`, sus URLs en `src/config.ts:126`; Visibilidad los cablea en `launcherIcon()` (`ui/src/shell/SuyndaShell.tsx:52`).
- **Y ya se degrada a la vista:** Visibilidad devuelve `◉` para sí mismo y un `▣` genérico para todos los demás. **Hoy, en su riel, Compra y Talento son cuadraditos idénticos.**
- **Tercer campo del pliegue: la URL del hub.** Hoy es variable de entorno por módulo (`platform.hubPublicUrl` en Visibilidad, `src/http/app.ts:218`). **Un hub que se mude obliga a redeployar todos los módulos.** Misma justificación que los otros dos.

Por F2 cada módulo renderiza el riel; cablear ícono y URL en cada repo es exactamente la deriva que este plan existe para frenar. Por 2.1-bis, son **qué se muestra**: van a Foundation.

**Por qué es corrida propia y no un renglón de UI-0a:** UI-0a es documentos. Esto es **código en Foundation**, el repo del núcleo. Tiene write-scope propio, suites propias, y **el push es un deploy de producción** con su ritual completo: `npm test` · `npm run test:pg` · `npm run build` (obligatorio: tsx no chequea tipos, Railway sí) · diff nombrado · STOP · push como acto separado, ejecutado por el fundador.

**Write-scope:** `src/shell/shell-service.ts` (`LauncherItem` y su armado), `src/http/routes/shell.ts`, la fuente del dato (catálogo de módulos, hoy `contracts/data/modules.json` → tabla `modules`), y las suites que congelan el contrato de respuesta.

**Dos advertencias de la casa que aplican acá:**

- **El contrato de respuesta se congela con `Object.keys` contra el shape completo**, no comparando contra la misma función que produce el valor — ese assert es circular y pasa igual si las dos se mueven juntas (lección de la pasada 2).
- **`fa829e8` viaja con este push.** Foundation está ahead 1 con el docs-only de las reglas 37/38; el primer push que salga se lo lleva. Se declara, no se descubre.

**Compuerta:** suites verdes con exit code real · build limpio · el shape nuevo probado.
**Firma:** del fundador, **leyendo el diff**; y el deployment verificado después del push (regla 16: el push no es evidencia, el deployment sí).

---

### UI-0b — El congelado canónico

**Write-scope:** `suynda-ui/docs/congelado-ui.md` (nuevo, la autoridad) + tres enmiendas nombradas a documentos existentes.

| Sub-corrida | Qué produce |
|---|---|
| **A · Tokens y tipografía** | La paleta completa en castellano, la escala tipográfica, el espaciado, los radios. La enmienda `font-src 'self'` escrita con su justificación |
| **B · Las piezas** | Una especificación por pieza: anatomía, estados, cuándo se usa y cuándo no. **Incluye la reconciliación de la píldora: siete implementaciones hoy, una doctrina** — rótulos, colores y estados exactos, y las siete convergen ahí |
| **C · La plantilla de Inicio** | Estructura fija: saludo+contexto · fila de tarjetas de métrica · zona de atención en posición constante · paneles de trabajo con "Ver todas" · estados vacíos que enseñan. **Prohibición explícita de métricas fabricadas** |
| **D · Las enmiendas** | `VISIBILIDAD-UI-CONTRACT-v1.md` §1 (precedencia invertida) · `design-ui-suynda.md` §8 pasa a citar en vez de definir · el comentario de cabecera de `foundation/src/http/assets.ts` |

**Compuerta:** ningún documento repite un valor que el canon ya declara. Los tres viejos citan.
**Firma:** del fundador, **leyendo**.

---

### UI-1 — `@suynda/ui`, el paquete

**Write-scope:** `liviojanz/suynda-ui`, ahora con código. Distribuido **por tag de git**, igual que `@suynda/contracts`.

| Sub-corrida | Qué produce | Cierra cuando |
|---|---|---|
| **A · Capa 0 + entrega** | `tokens.css` y su gemelo exportado como **string TS**. Las fuentes auto-hospedadas como archivos del paquete, **con su licencia adentro**: Poppins e Inter son SIL OFL —que permite exactamente este uso— y el archivo de licencia viaja junto a los `.woff2` | Las cuatro formas de consumo funcionan: import de Astro, import de Next, string embebido, y ruta servida |
| **B · Capa 1 + la hoja** | Primitivas CSS planas (`.pildora`, `.boton`, `.campo`, `.vacio`, `.tarjeta`, `.tabs`, `.metrica`, `.medidor`, `.chip-canal`, `.calendario-semana`) **y la HOJA DE ESPECIFICACIÓN** (§UI-1-hoja) | Cada pieza del congelado tiene su clase y su ficha; ninguna clase existe sin estar en el congelado |
| **C · El catálogo navegable** | Una página que muestra **cada pieza en cada estado**, generada del mismo CSS que consumen los productos. **Complemento interactivo de la hoja** — hover, foco, angosto | Un desconocido entiende el sistema sin leer el congelado |
| **D · La compuerta** | Test que rechaza hex crudos y clases de paleta por defecto, con lista de excepciones nombradas. CI real | **Se lo vio fallar**: un caso rojo a propósito antes de firmarlo (regla 12) |

**Las piezas, de las dos listas (F6):**

| Del inventario | De los mockups firmados |
|---|---|
| píldora de estado · botón · campo de formulario · estado vacío · tarjeta · tabla y lista de trabajo · aviso · toast · modal · esqueleto · buscar-y-elegir · monto · riel · franja | tarjeta de métrica con delta · medidor de progreso · calendario semanal con franjas · chip de canal con ícono · barra de tabs |

**Pieza con dueño explícito (observación del fundador, 28-ago): "qué ve un módulo sin entitlement".** Hoy cada módulo lo resuelve por su cuenta. **Es pieza del catálogo**, y entra a la sub-corrida B para que no reaparezca como hueco en UI-3.

#### UI-1-hoja — la hoja de especificación *(enmienda E10, 29-ago)*

**El §B.2 del canon es un índice, no una especificación.** El aspecto de una pieza necesita **identificación y muestra visual**, no descripción larga. La sub-corrida B produce, además del catálogo, una **hoja de especificación en PDF + MD**.

**Una ficha por pieza, formato fijo:**

1. **Código + nombre** — `B.2-NN`, citable como se citan las disciplinas (`B.2-02`, `B.2-14`).
2. **Muestra visual renderizada del CSS real del paquete**, en cada estado. **Jamás dibujada aparte:** si la hoja y el paquete pueden divergir, la hoja no sirve.
3. **Receta telegráfica en tokens** — fondo · texto · radio · padding · tipografía.
4. **La prohibición, en una línea.**

**Sin prosa larga.** Incluye **vista angosta (360 px)** donde aplique y las reglas táctiles (**≥ 44 px**).

**Dónde vive:** el MD en `suynda-ui/docs/`; **el PDF es el artefacto de firma y de archivo**.

**Punto de partida del aspecto:** el **mockup HTML ya aprobado** por el fundador. UI-1 no arranca de cero — arranca de ahí para **forma**: anatomía, densidad, proporción. **Sobre el color manda A.1**, siempre (ver la nota de neutros en el registro E10).

**Compuerta:** la hoja completa · catálogo renderizando · CI verde · el gate visto fallar · **toda pieza a 360 px y todo objetivo táctil ≥ 44 px**.
**Firma:** del fundador, **VIENDO la hoja, pieza por pieza**. El catálogo navegable es complemento, no el objeto de firma.

> **Lo que se firma ahí es el aspecto CONGELADO.** Cambiar un padding después es **enmienda con tag nuevo**, no improvisación. El tag `v0.1.0` se corta **después** de la firma de la hoja, no antes.

---

### UI-2P — Lab, producto — *corre en paralelo con UI-3*

**No depende del paquete**, y es la urgencia real. Por eso se separó del vestido y se adelantó: arranca apenas cierra UI-1 y corre en paralelo con UI-3.

| Sub-corrida | Qué produce |
|---|---|
| **P1 · CRUD de determinaciones y departamentos** | Editar y borrar, hoy ausentes |
| **P2 · Determinaciones + Análisis** | La fusión en una sola pantalla de tarea |
| **P3 · Nombre de médico, centro y aseguradora** | Con diagnóstico previo de **dónde vive el dato** — Padrón o Lab — antes de escribir una línea |

**Compuerta por sub-corrida:** suites verdes **con exit code real, a log completo, nunca por pipe** (regla 37) · `npm run build` · diff nombrado · STOP.
**Firma:** **VIENDO**, pantalla por pantalla.

---

> **↓ Acá va UI-3 en el orden de ejecución** — su detalle está más abajo. Corre en este lugar porque **valida el paquete antes de que Lab lo reciba**: es la superficie más chica (1.333 líneas entre CSS, componentes y shell), la más nueva, la única que ya cumple F2, y **no está en producción**.

---

### UI-2V — Lab, vestido — *ANTES que UI-3 desde E12*

> **E12 (2-sep) invirtió esto.** Lo de abajo es el motivo del orden ANTERIOR y se conserva porque sigue siendo cierto — no se borra un argumento válido por haber perdido contra otro. Lo que ganó es la prioridad: **Lab tiene piloto real y Visibilidad no tiene usuarios.** El riesgo que este párrafo describe **se acepta**, con la mitigación de E12.

**Motivo del orden ANTERIOR, escrito:** Lab está en producción con un piloto encima. **Descubrir un hueco del paquete a mitad de la reestructura de un módulo en uso es el peor lugar posible.** Cuando UI-2V arranca, el paquete ya viene curtido por un consumidor real.

| Sub-corrida | Qué produce |
|---|---|
| **V1 · Cimiento** | Ruta de estáticos (molde: `/flow/assets/app.css` de Foundation) · pin de `@suynda/ui` · **las fuentes se entregan de verdad** — cura el bug de §2.2 |
| **V2 · Shell corregido** | El riel pasa a módulos de plataforma, las estaciones a tabs, según el mapa de UI-0a |
| **V3 · Capa visual** | Pantalla por pantalla, en el orden del flujo: Inicio · Admitir · Muestras · Cargar · Verificar · Entregar · Ver · Config |

**Advertencia de método:** los 146 tests de `tests/http` y `tests/browser` afirman estructura y clases del DOM. **Van a ponerse rojos, y eso es correcto.** Cada rojo se clasifica antes de arreglarse (regla 38): o el recon no lo encontró, o el comportamiento cambió a propósito y se re-firma.

**Compuerta por sub-corrida:** igual que UI-2P.
**Firma:** **VIENDO** — maquetas antes de V3, y el `lab.suynda.com` desplegado al cierre. El push es acto separado; producción la ejecuta el fundador.

> **DEPENDENCIA EXTERNA — la firma final de UI-2V está condicionada.** El pendiente vivo de la Fase 6 del plan de Lab sigue abierto: **Padrón no responde desde producción** y el smoke del §9 nunca se completó. No es trabajo de este plan, pero la compuerta de cierre —ver Lab desplegado y funcionando— **no se puede dar sin eso**. Se nombra acá para que no se descubra a mitad de la pasada. **Dueño: infraestructura, fuera de este plan.**

---

### UI-3 — Visibilidad se integra vestida

**RAMA R CONFIRMADA por recon (28-ago).** `SuyndaFactory/visibilidad` está construido: VIS-001A (dominio), VIS-001B (UI de producto + aceptación por navegador), **BFF de shell autoritativo de Foundation**, runtime integrado y entorno de Cloud Agent. UI-3 es **reconciliación + re-vestido**, no construcción.

**Dos cosas que el módulo ya hace bien, sin que nadie se lo pidiera:**

- **Consume `/v1/shell`** (`src/platform/foundation/shell.ts`) con parseo cerrado y error propio — valida el §2.1.
- **Su riel son los módulos de la plataforma** (`aria-label="Módulos Suynda"`, `data-testid="launcher"`) y sus secciones son páginas — **F2 obedecida**, y el shell renderizado por el módulo, que es la restricción de UI-0a-B.

**Y la deriva naciendo, en un módulo de días — la demostración de por qué existe el paquete:**

| Token | Visibilidad | El de la casa | |
|---|---|---|---|
| `--yellow` | `#ffc010` | `#ffc20e` | ✗ **el amarillo de marca, errado por dos dígitos — invisible al ojo** |
| `--ink` | `#14201c` | `#1f1d1a` | ✗ |
| `--line` | `#e5e4e0` | `#e3e7e2` | ⚠️ **NO es deriva** — es el valor del mockup firmado (ver E10-nota) |
| `--muted` | `#6b756f` | `#6b7772` | ✗ un tercer valor, distinto del canon **y** del mockup |

Los nombres están **en inglés** (`--yellow`, `--ink`, `--paper`, `--rail`), contra F4 y contra su propio mockup firmado, que los declara en castellano. Y declara `Poppins, Inter` **sin cargar ninguna**: ni `@font-face`, ni `link`, ni `fontsource`. **Es el bug exacto de Lab, reproducido en un repo que nunca tocó Lab** — porque no había de dónde heredar.

| Sub-corrida | Qué produce |
|---|---|
| **A · Contrato y rebind** | Manifiesto `visibilidad.json` en contracts (la `ModuleKey` ya existe) + siembra · **rebind de `@suynda/contracts` `v0.7.0` → `v0.8.1`**, calcado de la sub-corrida B de la pasada 4 de Lab. **Atención al gate anti-resurrección y a la compuerta de `manifest_version`** |
| **B · Arco de plataforma** | Auth, gate de entitlement con `functions[]`, cookie de sesión, Padrón obligatorio, frontera piloto. **El molde es la pasada 4 de Lab, sub-corrida por sub-corrida** |
| **C · Re-vestido** | Los tokens propios mueren y entra el paquete: **673 líneas de `ui/src/styles.css`, 257 de `components.tsx`, 403 de `shell/SuyndaShell.tsx`**. Su UI nació antes que `@suynda/ui` |
| **D · Deploy** | Repo real, CI, deployment piloto |

**La quinta tecnología, declarada sin reabrir la premisa:** Visibilidad es **React + Vite (SPA)**. La premisa "sin componentes compartidos" (§7) se firmó contra cuatro stacks incompatibles; con **dos superficies React** —Visibilidad y el frontend futuro de compra— dejó de ser estrictamente cierta. **No se reabre en v1.1**; queda anotada para cuando el frontend de compra exista y haya con qué comparar.

**Para UI-0a, UI-0b y UI-1 el código de Visibilidad no hace falta** — alcanzan los mockups y los contratos del starter pack.

**Compuerta:** la compuerta anti-deriva pasa **sin excepciones nombradas** — un módulo nuevo no tiene derecho a deuda.
**Firma:** **VIENDO** las pantallas.

---

### UI-4 — Compra por el estrangulador, y el hub converge

| Sub-corrida | Qué produce |
|---|---|
| **A · Rescate** | Modal, toast y esqueleto de `facturas-py` portados como piezas del paquete. **Antes** de que su UI muera |
| **B · El frontend nuevo** | La UI de `suynda-compra` nace consumiendo el paquete |
| **C · El hub, dueño del shell** | Sus 35 hex sueltos → tokens. El hub es el dueño del shell que los módulos replican, así que su convergencia es doctrina, no limpieza |

`facturas-py` queda **congelado visualmente**. No se retoca.

**Compuerta:** el gate en verde en los tres repos vivos.
**Firma:** **VIENDO**.

---

## 4. El régimen de firmas

> **Las reglas se firman leyendo; las pantallas se firman viendo.**

| Pasada | Cómo se firma | Superficie de firma |
|---|---|---|
| UI-0a · UI-0b | leyendo | los documentos |
| UI-0a-bis *(si se activa)* | leyendo | el diff, y el deployment después del push |
| UI-1 | **viendo** | **la hoja de especificación**, pieza por pieza (el catálogo navegable es complemento) |
| UI-2P | **viendo** | las pantallas, sub-corrida por sub-corrida |
| UI-3 | **viendo** | las pantallas desplegadas |
| UI-2V | **viendo** | **las maquetas**, y después el deployment |
| UI-4 | **viendo** | las pantallas desplegadas |

Ninguna pasada arranca sin la firma de la anterior. Un gate en rojo frena la secuencia entera, no sólo su fase (regla 34).

---

## 5. Disciplina transversal

Vale la disciplina completa del repo, y estas cinco con nombre propio en este plan:

1. **Declaración de apertura** con baseline verde y citas frescas.
2. **Compuerta:** suites → diff nombrado → STOP. El push es un acto **separado**; docs-only también espera.
3. **El instrumento se verifica** (regla 37): exit code real capturado aparte, nunca por pipe; el grep léxico no encuentra dependencias semánticas; el runner lleva su flag de serie.
4. **Un rojo se clasifica antes de arreglarse** (regla 38).
5. **Producción la ejecuta el fundador.** El asistente no tiene credenciales de producción.

---

## 6. Riesgos nombrados

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | La reestructura del shell de Lab toca una pantalla **desplegada y en uso** | El mapa se firma en UI-0a, antes de tocar código; sub-corrida propia y revertible |
| R2 | El bump de contracts por el manifiesto de Visibilidad puede resucitar junctions | El gate permanente ya existe (`db/anti-resurreccion.pgtest.ts`); se corre de nuevo |
| R3 | Un hueco del paquete se descubre a mitad de la reestructura de un módulo en producción | **REABIERTO por E12 (2-sep).** Ya no lo resuelve el orden: UI-2V se adelantó y el paquete **se estrena sobre producción**. Queda mitigado, no eliminado: el hueco se cierra en `suynda-ui` con firma y tag nuevo —jamás CSS inline en Lab—, la compuerta anti-deriva entra al CI de Lab en la primera sub-corrida, y el producto de Lab (UI-2P) ya está aparte, así que un revert del vestido no se lo lleva |
| R4 | `font-src 'self'` enmienda una decisión de mesa | Se firma como desviación declarada (regla 8), no se cuela |
| R5 | El catálogo envejece y vuelve la deriva | La compuerta de UI-1, adoptada por pin en cada repo |
| R6 | Una base que conoció otra siembra rompe la de Visibilidad | Reset desde cero; la trampa ya está documentada |

---

## 7. Lo que este plan deja explícitamente afuera

- **`facturas-py`**: congelado, muere estrangulado.
- **Componentes compartidos**: imposibles entre cuatro tecnologías; cada repo los construye delgados sobre la capa 1.
- **Fidelidad de píxel** contra los PNG: son normativos para jerarquía, densidad y tono, no para píxeles.
- **Los siete `ModuleKey` restantes** (`deposito`, `talento`, `conecta`, `comercio`, `vet`, `taller`, `milk`, `farm`): heredan el paquete cuando nazcan, sin pasada propia.
- **Modo oscuro**: no está en ninguna referencia firmada. Si se quiere, es una decisión propia y posterior.

---

## 8. El estado de las firmas

**El plan está firmado y congelado.** El siguiente acto es **UI-0a: el shell, especificado** — que es sólo documentos, así que no espera nada más.

Las firmas que siguen abiertas son las de cada pasada, en su momento y con su superficie (§4). La primera es la de UI-0a, leyendo.

---

## 9. Registro de enmiendas

| # | Enmienda | Origen |
|---|---|---|
| E1 | §2.1 pasa de propuesta a decisión tomada; el §8 deja de ser lista de espera | Fundador, 28-ago |
| E2 | UI-3 abre con recon del estado real y se bifurca en rama R (reconciliación con re-vestido) o rama C (construcción vestida) | Fundador, 28-ago — **aplicada en forma bifurcada**: la evidencia disponible (`README-FIRST.md`) dice que el código de producto no había arrancado al 21-ago, y el repo privado no se pudo inspeccionar. El plan no afirma el estado; lo determina el recon |
| E3 | El pliegue en `/v1/me` se separa como **UI-0a-bis**, corrida de Foundation con ritual de producción; `fa829e8` viaja con ese push | Fundador, 28-ago |
| E4 | La firma final de UI-2 queda declarada como condicionada por Padrón desde producción y el smoke §9 de la Fase 6 de Lab | Fundador, 28-ago |
| — | Las fuentes llevan su licencia SIL OFL dentro del paquete | Fundador, 28-ago |

### v1.1 — las enmiendas de la segunda vuelta

| # | Enmienda | Origen |
|---|---|---|
| **E5** | **§2.1 se INVIERTE**: el shell se alimenta de `/v1/shell`, no de `/v1/me`. Ninguno muere. **Con el registro de por qué la v1.0 estaba mal fundada**: se aplicó el precedente D12 sin verificar que fuera la misma pregunta | Recon con citas, 28-ago · firmada por el fundador |
| **E6** | **UI-0a-bis se redefine sobre el archivo correcto**: pliegue de **ícono y URL** en `/v1/shell` — el rótulo ya lo trae. Justificación medida: tres repos inventan íconos, y en el riel de Visibilidad Compra y Talento son cuadraditos idénticos | Recon, 28-ago |
| **E7** | **La frontera entra como regla** (§2.1-bis): el paquete manda cómo se ve, Foundation manda qué se muestra | Fundador, 28-ago |
| **E8** | **Nuevo orden**: UI-2 se parte en **UI-2P** (producto, no depende del paquete, es la urgencia) y **UI-2V** (vestido). UI-2P corre **en paralelo con UI-3**, y UI-2V va **después**, con el paquete ya curtido por un consumidor real | Fundador, 28-ago |
| **E11** | **F4 pasa a regla con excepciones nombradas:** *"Vocabulario en castellano. Tres préstamos heredados (`--muted`, `--card`, `--maxw`) se conservan por estar desplegados idénticos en las tres fuentes firmadas; ningún token nuevo entra en inglés."* Encontrado al construir la capa 0: el enunciado anterior no era literalmente cierto del set. Detalle en el §A.1 del canon | Reviewer, 30-ago |
| **E10** | **La compuerta de UI-1 cambia.** La sub-corrida B produce además una **hoja de especificación (PDF + MD)**: una ficha por pieza con código `B.2-NN`, muestra renderizada **del CSS real**, receta en tokens y la prohibición en una línea. **La firma viendo es sobre la hoja**; el catálogo pasa a complemento. El tag `v0.1.0` se corta después de esa firma, y cambiar un padding después es enmienda con tag nuevo. Punto de partida: el mockup HTML aprobado, para **forma**; sobre color manda A.1 | Fundador, 29-ago |
| **E10-nota** | **RESUELTA el 29-ago, mirando un comparador: ganan los VERDOSOS.** A.1 queda como está y el mockup cede en `--tinta-suave`, `--muted` y `--linea` —**tres, no cuatro: `--papel` nunca difirió**—. Criterio: menor retrabajo (es lo desplegado en producción) y la familia verdosa empareja con el riel y el verde de marca. Detalle en el §A.1 del canon. *El registro original de la discrepancia:* | Fundador, 29-ago |
| | **La temperatura de los neutros.** El mockup firmado declara `--tinta-suave #4A4741`, `--muted #75726B` y `--linea #E5E4E0` —**cálidos**—; A.1 los declara `#3d4a45`, `#6b7772` y `#e3e7e2` —**verdosos**—, tomados del hub y de Foundation. **Los dos están firmados.** Por F1 gana el canon, pero es una decisión de aspecto que el fundador debe tomar mirando, no heredar por regla de precedencia. **Corolario:** el `--line #e5e4e0` de Visibilidad que E9 reportó como deriva **no lo es** — es fiel al mockup. La deriva real de Visibilidad son `--yellow #ffc010` y `--ink #14201c`; `--muted #6b756f` es un tercer valor propio | Recon, 30-ago |
| **E12** | **UI-2V se adelanta: va ANTES que UI-3.** La prioridad es Lab funcionando de punta a punta — es el módulo con **piloto real**; Visibilidad no tiene usuarios. **Se conserva el motivo del orden viejo, que sigue siendo cierto:** UI-3 iba primero para validar el paquete en la superficie más chica, más nueva y **fuera de producción**, de modo que Lab lo recibiera curtido. **Riesgo aceptado, con nombre:** el paquete se estrena sobre el módulo en producción, así que el R3 del §6 deja de estar resuelto por el orden. **Mitigación firmada:** todo hueco del paquete que aparezca en UI-2V se resuelve **en `suynda-ui` como pieza candidata, con firma del fundador y tag nuevo** — jamás CSS inline en Lab; y la **compuerta anti-deriva se adopta en el CI de Lab en la primera sub-corrida**, no al final | Fundador, 2-sep |
| **E9** | **Rama R confirmada**: Visibilidad está construido. Entran al plan sus cuatro tokens desviados, los nombres en inglés, el bug de Poppins reproducido, la quinta tecnología (React+Vite) declarada sin reabrir la premisa, y el rebind `v0.7.0`→`v0.8.1` en UI-3-A | Recon, 28-ago |

> **Nota de método sobre la E5.** La v1.0 afirmaba que `/v1/shell` no existía. Existía desde el 24 de julio. El error no fue de criterio sino de verificación: se comprobó qué devuelve `/v1/me` y **nunca se buscó el nombre `/v1/shell`** — un hueco declarado sin ir a buscarlo. Queda escrito acá, y no borrado, porque el plan se enmienda con evidencia.
