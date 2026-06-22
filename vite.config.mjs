import { defineConfig, loadEnv } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "chinese-drama";

function resolveCertFile(envValue, fallbackName) {
  const target = envValue || path.join(".certs", fallbackName);
  return path.resolve(__dirname, target);
}

function resolveHttpsOptions(env) {
  const certPath = resolveCertFile(env.VITE_HTTPS_CERT_PATH, "dev-cert.pem");
  const keyPath = resolveCertFile(env.VITE_HTTPS_KEY_PATH, "dev-key.pem");

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error([
      "未找到 HTTPS 证书，开发服务器必须以 HTTPS 启动。",
      `证书路径：${certPath}`,
      `私钥路径：${keyPath}`,
      "请先准备 .certs/dev-cert.pem 与 .certs/dev-key.pem，或通过 VITE_HTTPS_CERT_PATH / VITE_HTTPS_KEY_PATH 指定路径。"
    ].join("\n"));
  }

  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isGitHubPages = process.env.GITHUB_ACTIONS === "true" || env.VITE_DEPLOY_TARGET === "github-pages";
  const httpsOptions = resolveHttpsOptions(env);
  const base = isGitHubPages ? `/${repoName}/` : "/";

  return {
    base,
    server: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      https: httpsOptions
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      https: httpsOptions
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          root: path.resolve(__dirname, "index.html"),
          mainSite: path.resolve(__dirname, "main-site/index.html"),
          mysteryVr: path.resolve(__dirname, "mystery-vr/index.html")
        }
      }
    }
  };
});
