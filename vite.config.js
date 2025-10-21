import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // Force new file names on each build to bust CDN cache
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
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
