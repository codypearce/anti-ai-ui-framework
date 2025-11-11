#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const root = process.cwd();

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url || '/');
  if (urlPath === '/') urlPath = '/examples/';

  const filePath = path.join(root, urlPath);
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        serveFile(indexPath, res);
      } else {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        fs.readdir(filePath, (err, files) => {
          if (err) return res.end('');
          const list = files
            .map((f) => `<li><a href="${path.posix.join(urlPath, f)}">${f}</a></li>`) 
            .join('');
          res.end(`<h1>Index of ${urlPath}</h1><ul>${list}</ul>`);
        });
      }
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const type = types[ext] || 'application/octet-stream';
  fs.createReadStream(filePath)
    .on('open', () => {
      res.writeHead(200, { 'content-type': type });
    })
    .on('error', () => {
      res.writeHead(500);
      res.end('Server error');
    })
    .pipe(res);
}

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}/examples/`);
});

