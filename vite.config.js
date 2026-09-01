import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages sirve este proyecto bajo /vite-ceic-usach/, no en la raíz del dominio
// (https://chelpa.github.io/vite-ceic-usach/) — sin "base" los assets se piden en /
// y salen 404, que es justo lo que se ve como página en blanco.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/vite-ceic-usach/',
})
