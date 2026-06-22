const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const host = '0.0.0.0';
const port = 4173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Permissions-Policy': 'xr-spatial-tracking=(self)'
  });
  res.end(body);
}

http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const requestPath = rawPath === '/' ? '/index.html' : rawPath;
  const targetPath = path.resolve(root, `.${requestPath}`);

  if (!targetPath.startsWith(root)) {
    send(res, 403, 'Forbidden');
    return;
  }

  let finalPath = targetPath;
  try {
    const stat = fs.existsSync(finalPath) ? fs.statSync(finalPath) : null;
    if (stat?.isDirectory()) {
      finalPath = path.join(finalPath, 'index.html');
    }
    const data = fs.readFileSync(finalPath);
    send(res, 200, data, mimeTypes[path.extname(finalPath).toLowerCase()] || 'application/octet-stream');
  } catch (error) {
    send(res, 404, 'Not Found');
  }
}).listen(port, host, () => {
  console.log(`HTTP 开发服务器已启动：http://localhost:${port}`);
});
