import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const configDirectory = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const webEnv = loadEnv(mode, configDirectory, '')
  const apiEnv = loadEnv(mode, resolve(configDirectory, '../api'), 'API_URL')
  const rootEnv = loadEnv(mode, resolve(configDirectory, '../..'), 'API_URL')
  const apiUrl =
    process.env.API_URL ||
    webEnv.API_URL ||
    apiEnv.API_URL ||
    rootEnv.API_URL ||
    webEnv.VITE_API_URL ||
    'http://localhost:3000'
  const normalizedApiUrl = apiUrl.replace(/\/+$/, '')
  const parsedApiUrl = new URL(normalizedApiUrl)
  const isLocalApi =
    parsedApiUrl.hostname === 'localhost' ||
    parsedApiUrl.hostname === '127.0.0.1' ||
    parsedApiUrl.hostname === '::1'
  const apiBaseUrl =
    !isLocalApi && parsedApiUrl.pathname === '/'
      ? `${normalizedApiUrl}/api`
      : normalizedApiUrl

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiBaseUrl),
    },
  }
})
