import { renderToReadableStream } from "react-dom/server";
import RootLayout from "@/layout";
import { hiConsole } from "./configs/CustomLog";

const PORT = process.env.PORT || 3000;
const header = {
  headers: {
    "Content-Type": "text/html",
  }
};

Bun.serve({
  async fetch(req) {
    let reqPath = new URL(req.url).pathname;
    console.log(`[Request | ${req.method}] - ${reqPath}`);

    let stream;
    try {
      stream = await renderToReadableStream(<RootLayout />);
    } catch (err) {
      console.log(err);
    }
    return new Response(stream, header);
  },
  port: PORT
})

hiConsole(PORT);
