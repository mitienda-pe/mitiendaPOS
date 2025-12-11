import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
