#!/usr/bin/env node

const http = require('http');
const { parse: parseUrl } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

async function startServer() {
  const app = next({ dev });
  const requestHandler = app.getRequestHandler();

  const server = http.createServer((req, res) => {
    const parsedUrl = parseUrl(req.url, true);
    requestHandler(req, res, parsedUrl);
  });

  await app.prepare();

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`> PORT: ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
