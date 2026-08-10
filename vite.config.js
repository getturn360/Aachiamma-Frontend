import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Appends NDJSON debug lines for the Cursor debug session. */
function agentDebugLogPlugin() {
  const logFile = path.resolve(__dirname, "..", "debug-196e3e.log");
  return {
    name: "agent-debug-log",
    configureServer(server) {
      server.middlewares.use("/__agent_debug_log", (req, res, next) => {
        if (req.method !== "POST") return next();
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8").trim();
            if (raw) fs.appendFileSync(logFile, `${raw}\n`, "utf8");
          } catch (e) {
            console.error("[agent-debug-log]", e?.message || e);
          }
          res.statusCode = 204;
          res.end();
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_BASE ||
    env.VITE_API_URL ||
    "http://127.0.0.1:5000";

  return {
    plugins: [react(), agentDebugLogPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["react-helmet-async"],
    },

    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      hmr: {
        host: "127.0.0.1",
        port: 5173,
      },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
