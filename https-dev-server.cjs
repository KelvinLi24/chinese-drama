const https = require('https');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const host = '0.0.0.0';
const port = 4174;
const keyPath = process.env.MYSTERY_VR_HTTPS_KEY_PATH || path.join(root, '.certs', 'dev-key.pem');
const certPath = process.env.MYSTERY_VR_HTTPS_CERT_PATH || path.join(root, '.certs', 'dev-cert.pem');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('未找到 HTTPS 证书。请先准备 .certs/dev-key.pem 与 .certs/dev-cert.pem，或通过环境变量 MYSTERY_VR_HTTPS_KEY_PATH / MYSTERY_VR_HTTPS_CERT_PATH 指定证书路径。');
  process.exit(1);
}

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

https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, (req, res) => {
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
  console.log(`HTTPS 开发服务器已启动：https://localhost:${port}`);
  console.log('如需在局域网设备中测试，请使用受信任证书并通过本机局域网地址访问。');
});

