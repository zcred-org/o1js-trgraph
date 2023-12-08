import { writeFileSync } from "fs";
import { O1_TR_LINKS } from "../src/graph.js";


const ROOT_DIR = new URL("../", import.meta.url);

export function createLinkTypes() {
  console.log("Create GraphLink types: start");
  const types =
    `import {type GraphLink} from "trgraph"\n\n` +
    `export const O1_GRAPH_LINKS = ${JSON.stringify(O1_TR_LINKS.map(it => it.name), null, 2)} as const\n\n` +
    `export type O1GraphLink = typeof O1_GRAPH_LINKS[number] | GraphLink`;
  writeFileSync(new URL("./src/types/graphlink.ts", ROOT_DIR), types);
  console.log("Create GraphLink types: end");
}

createLinkTypes();