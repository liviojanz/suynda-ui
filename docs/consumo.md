# Cómo se consume `@suynda/ui`

Cuatro formas, porque cinco superficies con cinco tecnologías no pueden compartir una sola. **Lo que comparten es el contenido**, no el mecanismo: las cuatro sirven exactamente el mismo `tokens.css`, y un test prueba que el archivo y el string no pueden divergir.

**Se pinea por tag de git, igual que `@suynda/contracts`.** Subir una versión es un acto deliberado; cada repo adopta cuando quiere.

```json
"@suynda/ui": "github:liviojanz/suynda-ui#v0.1.0"
```

---

## Forma 1 — Astro / Vite (hub, Visibilidad)

```css
/* en tu hoja global */
@import "@suynda/ui/tokens.css";
@import "@suynda/ui/piezas.css";
@import "@suynda/ui/fuentes/fuentes.css";
```

El bundler resuelve los `.woff2` relativos y los emite como assets. Nada más que hacer.

## Forma 2 — Next (el frontend futuro de compra)

Igual que la 1, en `app/globals.css`, **antes** de las directivas de Tailwind para que los tokens estén disponibles en `theme.extend`.

> **Recordatorio de UI-4:** `facturas-py` tiene hoy `extend: {}` vacío y usa las paletas `slate`/`gray` por defecto. Su UI no se retoca — muere estrangulada.

## Forma 3 — String embebido (Lab)

Lab arma su HTML como template literal y **no sirve estáticos**. Toma el string y lo mete en su `<style>`:

```ts
import { TOKENS_CSS } from "@suynda/ui";

const html = `<!doctype html>
<html lang="es">
<head>
  <style>${TOKENS_CSS}</style>
  ...`;
```

**Las fuentes no viajan en el string.** Los `.woff2` necesitan una URL, así que Lab tiene que servirlos — es la ruta de estáticos que UI-2V-V1 construye, con el molde de `/flow/assets/app.css` de Foundation.

## Forma 4 — Ruta servida, bajo CSP (Foundation)

Foundation sirve con `default-src 'none'` y no puede embeber estilo. Sirve el string como archivo, igual que ya hace con su `APP_CSS`:

```ts
import { TOKENS_CSS } from "@suynda/ui";

scope.get("/flow/assets/tokens.css", async (_req, reply) => {
  reply.type("text/css; charset=utf-8").send(TOKENS_CSS);
});
```

**Y tres cosas que sólo aplican acá:**

1. **`font-src 'self'` tiene que estar en la CSP** — es la enmienda declarada del canon §A.3. Sin eso `default-src 'none'` bloquea las caras aunque las sirva Foundation mismo.
2. **Los `.woff2` se sirven desde el propio origen**, con su propia ruta, y `fuentes.css` se reescribe para apuntar ahí.
3. **`img-src 'self'` bloquea `data:`** — cualquier ícono o favicon embebido va por ruta servida, no en data-URI.

---

## La compuerta anti-deriva — se adopta con el pin

El paquete trae su propio verificador. **Cualquier repo que lo pinee lo corre sobre su propio código:**

```bash
node node_modules/@suynda/ui/scripts/compuerta.mjs src app components
```

Rechaza dos cosas y nombra archivo, línea y el texto ofensor:

1. **Color crudo** —hex, `rgb()`, `hsl()`— fuera de `tokens.css`.
2. **Clases de las paletas por defecto de Tailwind.** Es la forma exacta que tomó la deriva en `facturas-py`: **79 `border-slate-200` conviviendo con 52 `border-gray-300`**, y ni uno solo de la marca.

**Los comentarios no cuentan** — un hex citado en una explicación no es deriva.

**Las excepciones se nombran, nunca se infieren.** Están en `EXCEPCIONES`, dentro del propio script, y cada una **tiene que escribir por qué**; un test falla si alguna no lo hace. Hoy son las marcas de dominio que el canon §B.1.1 protege: el color real de la tapa de un tubo y el de la plataforma de un canal. **Una excepción anónima es una deriva con permiso.**

Recomendado en el `package.json` del consumidor:

```json
"scripts": { "compuerta": "suynda-ui-compuerta src app components" }
```

---

## Lo que ninguna forma hace

**Ninguna trae datos de usuario.** El paquete manda **cómo se ve**; Foundation manda **qué se muestra** (`shell-canonico.md` §2.1-bis). Si algo necesita saber el nombre de un espacio, el saldo o qué módulos hay, eso es `/v1/shell`, no esto.
