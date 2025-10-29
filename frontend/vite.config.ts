import path from "node:path"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig, loadEnv } from "vite"

const ensureEnvDefaults = (mode: string) => {
  const rootDir = path.resolve(__dirname, "..")
  const rootEnv = loadEnv(mode, rootDir, "")
  const localEnv = loadEnv(mode, __dirname, "")
  const mergedEnv: Record<string, string> = {
    ...rootEnv,
    ...localEnv,
  }

  // Preserve any variables that were already on process.env.
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      mergedEnv[key] = value
    }
  }

  const backendPort =
    mergedEnv.PORT_BACKEND ||
    rootEnv.PORT_BACKEND ||
    process.env.PORT_BACKEND ||
    "8000"
  const backendUrl =
    mergedEnv.BACKEND_URL ||
    rootEnv.BACKEND_URL ||
    `http://localhost:${backendPort}`

  const mailcatcherPort =
    mergedEnv.MAILCATCHER_HTTP_PORT ||
    rootEnv.MAILCATCHER_HTTP_PORT ||
    process.env.MAILCATCHER_HTTP_PORT ||
    "1080"
  const mailcatcherUrl =
    mergedEnv.MAILCATCHER_URL ||
    rootEnv.MAILCATCHER_URL ||
    `http://localhost:${mailcatcherPort}`

  if (!mergedEnv.VITE_API_URL) {
    mergedEnv.VITE_API_URL = backendUrl
  }

  if (!mergedEnv.MAILCATCHER_URL) {
    mergedEnv.MAILCATCHER_URL = mailcatcherUrl
  }

  if (!mergedEnv.MAILCATCHER_HOST) {
    mergedEnv.MAILCATCHER_HOST = mergedEnv.MAILCATCHER_URL
  }

  for (const [key, value] of Object.entries(mergedEnv)) {
    process.env[key] = value
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  ensureEnvDefaults(mode)

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
    ],
  }
})
