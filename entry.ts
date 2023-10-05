/**
 * Entry file based on React Bun App template
 *
 * Reference: https://github.com/bun-community/create-templates/blob/main/react/
 */


import * as path from "path";
import { statSync, watch } from "fs";
import { root } from "./src";

const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
const SRC_DIR = path.resolve(PROJECT_ROOT, "src");
const BUILD_DIR = path.resolve(PROJECT_ROOT, "build");

var originalConsoleLog = console.log;
console.log = function() {
    let args = [];
    args.push( '\x1b[96m[' + new Date().toLocaleString() + ']\x1b[0m -' );
    // Note: arguments is part of the prototype
    for( var i = 0; i < arguments.length; i++ ) {
        args.push( arguments[i] );
    }
    originalConsoleLog.apply( console, args );
};

console.log(process.env.BUN_ENV)

async function buildProject() {
  console.clear();
  await Bun.build({
    entrypoints: ["./src/index.tsx"],
    outdir: "./build"
  })
}

buildProject();

if (process.env.BUN_ENV === "development") {
  watch(SRC_DIR, async () => {
    buildProject();
    console.log(`Listening on http://localhost:${server.port}/`);
  })
}

function serveFromDir(config: {
  directory: string,
  path: string
}): Response | null {
  let basePath = path.join(config.directory, config.path);
  const suffixes = ["", ".html", "index.html"];

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix);
      const stat = statSync(pathWithSuffix);
      if (stat && stat.isFile()) return new Response(Bun.file(pathWithSuffix));
    } catch (error) {}
  }

  return null;
}

function responseLog(res: Response, reqPath: string): Response {
  console.log(`[Response | ${res.status}] - ${reqPath}`);
  return res;
}

const server = Bun.serve({
  fetch(req) {
    let reqPath = new URL(req.url).pathname;
    console.log(`[Request  | ${req.method}] - ${reqPath}`);

    const publicRes = serveFromDir({ directory: PUBLIC_DIR, path: reqPath, });
    if (publicRes) return responseLog(publicRes, reqPath);

    const buildRes = serveFromDir({ directory: BUILD_DIR, path: reqPath, });
    if (buildRes) return responseLog(buildRes, reqPath);

    return new Response("File not found", {
      status: 404
    });
  }
})

console.log(`Listening on http://localhost:${server.port}/`);
