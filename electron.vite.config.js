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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    }
  }
})
