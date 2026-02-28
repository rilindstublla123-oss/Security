import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Wenn wir "bauen" (GitHub), nutze den /Security/ Pfad. 
  // Wenn wir lokal entwickeln ("serve"), nutze den Standard-Pfad /.
  base: command === 'build' ? '/Security/' : '/',
}))
