import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Versión desde package.json + hash de build para detectar despliegues nuevos.
// El hash cambia en cada build aunque la versión semver no se haya tocado, así
// que el banner de actualización también se dispara en re-deploys sin bump.
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
const appVersion = pkg.version;
const buildId = `${appVersion}+${Date.now().toString(36)}`;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    // Escribe public/version.json (ignorado por git) para que el cliente pueda
    // comparar su buildId contra el desplegado. Solo en build: en dev no ensucia
    // el árbol de trabajo.
    {
      name: "version-json",
      apply: "build",
      buildStart() {
        writeFileSync(
          path.resolve(__dirname, "public/version.json"),
          JSON.stringify({
            version: buildId,
            appVersion,
            buildTime: new Date().toISOString(),
          })
        );
      },
    },
    vue(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Vite's default hash-based naming already handles cache busting
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api2.mitienda.pe",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/api-reniec": {
        target: "https://api.apis.net.pe/v2/reniec",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-reniec/, ""),
        headers: {
          Authorization: `Bearer ${process.env.VITE_APISNET_TOKEN}`,
        },
      },
      "/api-sunat": {
        target: "https://api.apis.net.pe/v2/sunat",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-sunat/, ""),
        headers: {
          Authorization: `Bearer ${process.env.VITE_APISNET_TOKEN}`,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
