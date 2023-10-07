import { renderToReadableStream } from "react-dom/server";
import { hiConsole, responseLog } from "@configs/CustomLog";
import * as path from "path";
import { statSync } from "fs";
import App from "@/pages/App";

const PORT = process.env.PORT || 3000;
const header = {
  headers: {
    "Content-Type": "text/html; charset=utf-8",
  }
};
const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
const BUILD_DIR = path.resolve(PROJECT_ROOT, "build");
const DIRECTIONS_ON_DUTY = [
  PUBLIC_DIR,                 // Check public folder
  BUILD_DIR,                  // Check build folder (asset files)
  BUILD_DIR + '/src/pages'    // Check the built pages folder, the files is required to be passed to the client side
];

const pageRouter = new Bun.FileSystemRouter({
  dir: './src/pages',
  style: 'nextjs',
});

await Bun.build({
  entrypoints: [
    PROJECT_ROOT + '/hydrate.tsx',
    ...Object.values(pageRouter.routes)
  ],
  outdir: BUILD_DIR,
  target: 'browser',
  splitting: true
})

const buildRouter= new Bun.FileSystemRouter({
  dir: BUILD_DIR + '/src/pages',
  style: 'nextjs'
})

function serveFromDir(config: {
  directory: string,
  path: string,
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

async function processPagesReq(req: Request) {
  const match = pageRouter.match(req);
  if (match) {
    const buildMatch = buildRouter.match(req);
    if (!buildMatch) {
      return new Response('Unknown Error', { status: 500 });
    }

    const Component = await import(match.filePath);
    const stream = await renderToReadableStream(<Component.default />, {
      bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${buildMatch.src}"`,
      bootstrapModules: ['/hydrate.js']
    })
    return new Response(stream, header);
  }
  return null;
}

Bun.serve({
  async fetch(req) {
    let reqPath = new URL(req.url).pathname;
    console.log(`[Request  | ${req.method}] - ${reqPath}`);

    const res = await processPagesReq(req);
    if (res) return responseLog(res, reqPath);

    if (reqPath === "/") {
      const stream = await renderToReadableStream(<App />, {
        bootstrapScriptContent: "globalThis.PATH_TO_PAGE = '/App.js'",
        bootstrapModules: ['/hydrate.js']
      });
      return responseLog(new Response(stream, header), reqPath);
    }
    if (reqPath.includes('scss')) {
      const scssRes = serveFromDir({ directory: PROJECT_ROOT, path: reqPath });
      if (scssRes) return responseLog(scssRes, reqPath);
    }

    for (const dir of DIRECTIONS_ON_DUTY) {
      const res = serveFromDir({ directory: dir, path: reqPath });
      if (res) return responseLog(res, reqPath);
    }

    return responseLog(new Response('404 - Page Not Found', { status: 404 }), reqPath);
  },
  port: PORT
})

hiConsole(PORT);
