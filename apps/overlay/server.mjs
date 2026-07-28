import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/health") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    response.end(JSON.stringify({ status: "ok", app: "@rodrigol/browser-overlay", version: "0.1.1" }));
    return;
  }

  // Evita o erro 404 que navegadores antigos geram ao procurar /favicon.ico.
  const requestedPath = pathname === "/favicon.ico" ? "/assets/favicon.svg" : pathname;
  const relative = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const target = normalize(join(root, relative));

  if (!target.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const info = await stat(target);
    const file = info.isDirectory() ? join(target, "index.html") : target;
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Arquivo não encontrado");
  }
});

server.listen(port, host, () => {
  console.log("");
  console.log("RodriGol Browser Overlay iniciado com sucesso.");
  console.log(`Overlay:      http://${host}:${port}`);
  console.log(`Demonstração: http://${host}:${port}/?demo=1`);
  console.log(`Diagnóstico:  http://${host}:${port}/health`);
  console.log("Pressione Ctrl+C para encerrar.");
  console.log("");
});
