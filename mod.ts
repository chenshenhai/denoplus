import { init } from "./core/cli/init.ts";
import { start } from "./core/cli/start.ts";
import { initHome } from "./core/cli/lib/home.ts";

const args = Deno.args;
const baseDir: string = Deno.cwd();
const order = args[1]; // TODO

function showHelp(): void {
  console.log(`
denopress
  A simple theme web based on Deno
USAGE:
  denopress  [SUBCOMMAND]
SUBCOMMANDS:
  init           initialize a denopress.json
  start          load theme basic resources and start web
`);
}

async function main() {
  initHome();
  
  if (order === 'init') {
    await init(baseDir);
  } else if (order === 'start') {
    await start(baseDir);
  } else {
    showHelp();
  }
}

main();