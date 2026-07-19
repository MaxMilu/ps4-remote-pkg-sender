import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: 'src/main/index.js'
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    publicDir: '../../static',
    plugins: [vue()],
    optimizeDeps: {
      exclude: ['fs', 'path', 'os', 'child_process', 'crypto', 'electron', 'net', 'url', 'http', 'express', 'uaup-js', '@njzy/ps4-pkg-info', 'vuex-electron']
    },
    build: {
      rollupOptions: {
        external: ['fs', 'path', 'os', 'child_process', 'crypto', 'electron', 'net', 'url', 'http', 'express', 'uaup-js', '@njzy/ps4-pkg-info', 'vuex-electron']
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    }
  }
})
