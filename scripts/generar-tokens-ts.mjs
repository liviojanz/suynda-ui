/**
 * Genera `src/tokens.ts` desde `src/tokens.css`.
 *
 * El gemelo en string existe para las dos superficies que NO pueden importar
 * un .css: Lab, que arma su HTML como template literal, y Foundation, que
 * sirve su hoja desde una ruta por exigencia de su CSP.
 *
 * Se GENERA en vez de escribirse a mano porque un gemelo copiado a mano es un
 * oráculo que miente: se mantiene sincronizado hasta el día que alguien toca
 * uno solo de los dos.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(raiz, "src", "tokens.css"), "utf8");

// Backtick, barra invertida y `${` son lo único que rompe un template literal.
const escapado = css
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const salida = `// ARCHIVO GENERADO — no editar a mano.
// Sale de \`src/tokens.css\` vía \`scripts/generar-tokens-ts.mjs\`.
// \`tests/equivalencia.test.ts\` prueba que sigue siendo byte a byte lo mismo.

/** La capa 0 completa, tal cual está en \`tokens.css\`. */
export const TOKENS_CSS = \`${escapado}\`;
`;

writeFileSync(join(raiz, "src", "tokens.ts"), salida, "utf8");
process.stdout.write("src/tokens.ts generado desde src/tokens.css\n");
