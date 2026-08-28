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

| | Píldora | Qué elige | Tono |
|---|---|---|---|
| **Izquierda** | **Organización** | desde cuál de tus organizaciones propias trabajás | tinta |
| **Centro** | **Espacio de trabajo** | "Mi espacio", una hermana, o el cliente activo por Nexo | **tinta = propio · verde = prestado** |

**El color no es decoración — es el mecanismo de seguridad.** El congelado §4 lo nombra: *"semántica de color = semántica de ubicación: tinta = lo mío, verde = operando para un cliente… la defensa visual contra cargar datos en el cliente equivocado"*. Con dos píldoras esa defensa está siempre a la vista, sin abrir nada.

**Lo que el color NO dice, y por eso el banner sobrevive:** verde significa "no es tuyo", **no cuál relación**. Un nexo y una tutela se pintan igual.

**El buscador.** Aparece a partir de **8 filas** (`shell.ts`: `caja.hidden = todos.length < 8`). El asesor con cientos de clientes tipea; *"un campo sobre tres filas es ruido en el espacio más caro de la pantalla"*.

#### La regla de aparición — con una corrección al enunciado firmado

El enunciado decía *"el selector de trabajo existe sólo si el usuario tiene al menos un Nexo como asesor"*. **Eso rompería algo:** la píldora del centro lista **también las organizaciones hermanas propias** (`espacio.clase === 'propio'` en `shell.ts`). Un titular con tres espacios propios y **cero** Nexos la necesita para moverse entre ellos.

**La regla correcta ya existe en el hub, y es más general** — la izquierda se apaga con una sola organización, y su test lo dice con todas las letras: *"un menú de una opción es decoración"* (`doble-selector.test.ts:270`).

> **Norma: un selector de la franja se muestra cuando tiene más de una opción; con una sola, se apaga.**

Aplicada a las dos, da exactamente el resultado que la firma buscaba —**sin Nexos y con un solo espacio, la franja queda simple**— y además no rompe al titular con hermanas. **Es un cambio real, no una promoción:** hoy la píldora del centro **no puede ocultarse** — su tipo `derecha: { nombre, tono }` no tiene campo `visible` (`doble-selector.ts:229`). Se le agrega uno en UI-2V/UI-4-C.

#### Los datos: la lista trabajable **no** está en `/v1/shell`

Sale de un **tercer endpoint, `GET /v1/cartera`** (el hub la pide por `/api/cartera`; `scripts/shell.ts:186`). Foundation la resuelve **por USUARIO**, no por tenant — es la corrida CAR-1, y el comentario del hub lo dice: *"la cartera es del asesor"*, y **se sigue viendo estando conmutado**.

**Y por eso no se pliega en `/v1/shell`.** `/v1/shell` es del **espacio activo**; la cartera es del **usuario** y sobrevive al cambio de espacio. Plegarla cambiaría su alcance y su caché: sería el error del §2.1 del plan cometido en la otra dirección — asumir que dos endpoints responden lo mismo sin verificar la pregunta. **UI-0a-bis no la toca**; su pliegue sigue siendo ícono, URL de módulo y URL del hub.

**El riel, bajo sesión prestada,** muestra los módulos del espacio activo —propio o prestado— con las facultades delegadas. Eso ya lo resuelve `/v1/shell`: en sesión prestada, `entitled` no es "el espacio tiene el módulo" sino "el espacio lo tiene **y esta sesión lo opera**" (`shell-service.ts`), para que el riel no ofrezca puertas que dan 403.

---

**Dónde va el nombre del módulo:** como **título de pantalla, encima de la sub-barra** — no como marca en el riel. El wordmark del nivel 1 es de la plataforma (`suynda`), y es el único. Así lo muestra el mockup firmado de Visibilidad: "Visibilidad" es el título, y debajo van sus tabs.

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
- Que el shell lo renderiza cada módulo, contra `/v1/shell` y con el paquete.
- El mapa de las 7 estaciones de Lab, **incluida la decisión D1** sobre las dos Configuración.

Con eso firmado, UI-0a-bis y UI-0b quedan habilitadas.
