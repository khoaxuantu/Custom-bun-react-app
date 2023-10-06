import { renderToReadableStream } from "react-dom/server";
import RootLayout from "@/layout";
import { hiConsole, responseLog } from "@configs/CustomLog";
import * as path from "path";
import { statSync } from "fs";

const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
const PORT = process.env.PORT || 3000;
const header = {
  headers: {
    "Content-Type": "text/html",
  }
};

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

Bun.serve({
  async fetch(req) {
    let reqPath = new URL(req.url).pathname;
    console.log(`[Request | ${req.method}] - ${reqPath}`);

    const publicRes = serveFromDir({ directory: PUBLIC_DIR, path: reqPath, });
    if (publicRes) return responseLog(publicRes, reqPath);

    const stream = await renderToReadableStream(<RootLayout />);
    return responseLog(new Response(stream, header), reqPath);
  },
  port: PORT
})

hiConsole(PORT);
