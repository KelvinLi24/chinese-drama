import https from "node:https";
import http from "node:http";
import configFactory from "../vite.config.mjs";

const PORT = 4173;
const HTTPS_URL = `https://localhost:${PORT}`;
const HTTP_URL = `http://localhost:${PORT}`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ok(message) {
  console.log(message);
}

function fetchText(url, client, options = {}) {
  return new Promise((resolve, reject) => {
    const request = client.get(url, {
      timeout: 4000,
      ...options,
      headers: {
        Accept: "text/html",
        ...(options.headers || {})
      }
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 0,
          headers: response.headers,
          body
        });
      });
    });

    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error(`请求超时：${url}`)));
  });
}

const serveConfig = await configFactory({ command: "serve", mode: "development" });
if (!serveConfig?.server?.https) {
  fail("HTTPS 验证失败：vite.config.mjs 的 server.https 未启用。请确保开发服务器只能以 HTTPS 启动。");
}
if (serveConfig.server.port !== PORT || serveConfig.server.strictPort !== true) {
  fail(`HTTPS 验证失败：开发端口必须固定为 ${PORT} 且 strictPort 为 true。`);
}

const previewConfig = await configFactory({ command: "preview", mode: "production" });
if (!previewConfig?.preview?.https) {
  fail("HTTPS 验证失败：vite.config.mjs 的 preview.https 未启用。");
}

const httpsResult = await fetchText(HTTPS_URL, https, { rejectUnauthorized: false });
if (httpsResult.statusCode < 200 || httpsResult.statusCode >= 400 || !httpsResult.body.includes("<html")) {
  fail(`HTTPS 验证失败：${HTTPS_URL} 未返回有效 HTML，状态码 ${httpsResult.statusCode}。`);
}

let httpPassed = false;
try {
  const httpResult = await fetchText(HTTP_URL, http);
  httpPassed = httpResult.statusCode >= 200 && httpResult.statusCode < 400;
} catch {
  httpPassed = false;
}
if (httpPassed) {
  fail(`HTTPS 验证失败：${HTTP_URL} 仍可正常访问，当前开发环境不是强制 HTTPS。`);
}

ok("HTTPS 验证通过。");
ok(`开发地址：${HTTPS_URL}`);
ok(`端口：${PORT}`);
ok("server.https：已启用");
ok("preview.https：已启用");
ok("HTTP：未提供可用回退");
