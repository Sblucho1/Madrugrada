import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // CONFIGURACIÓN CRÍTICA: 'base: "./"' asegura que los assets se carguen con rutas relativas.
    // Esto es necesario para despliegues manuales (drag & drop) en Netlify.
    base: './', 
    define: {
      // Define process.env.API_KEY specifically to avoid exposing all env vars
      // and to ensure it works in the browser after build.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});