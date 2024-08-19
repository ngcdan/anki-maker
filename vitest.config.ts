import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig as defineVitestConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env);


  return defineVitestConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.js',
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  });

}

