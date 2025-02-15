import { resolve } from 'node:path'
import process from 'node:process'
import { webUpdateNotice } from '@plugin-web-update-notification/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import postcssPresetEnv from 'postcss-preset-env'
import Unocss from 'unocss/vite'
import AutoExport from 'unplugin-auto-export/vite'
import Icons from 'unplugin-icons/vite'
import Info from 'unplugin-info/vite'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import VitePluginDebug from 'vite-plugin-debug'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import svgSfc from 'vite-plugin-svg-sfc'
import ServerUrlCopy from 'vite-plugin-url-copy'
import { vitePluginVersionMark } from 'vite-plugin-version-mark'
import VueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts'
import WebfontDownload from 'vite-plugin-webfont-dl'
import svgLoader from 'vite-svg-loader'
import { VitePluginAutoImport, VitePluginComponents, VitePluginI18n, VitePluginMarkdown } from './config'

const host = process.env.TAURI_DEV_HOST
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_DEV_PORT, VITE_BASE, VITE_API_BASE_PREFIX, VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), '')
  const debug = !!process.env.VSCODE_DEBUG || !!process.env.TAURI_ENV_DEBUG

  return {

    plugins: [
      VueRouter({
        extensions: ['.vue', '.md', '.tsx'],
      }), // https://github.com/posva/unplugin-vue-router
      vue({
        include: [/\.vue$/, /\.md$/, /\.tsx$/],
      }), // https://github.com/vitejs/vite-plugin-vue
      vueJsx(), // https://github.com/vitejs/vite-plugin-vue
      Unocss(), // https://github.com/antfu/unocss
      Icons({ compiler: 'vue3' }), // https://github.com/antfu/unplugin-icons
      Layouts(), // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
      VueDevTools({
        appendTo: 'src/main.ts',
      }), // https://devtools-next.vuejs.org/
      ServerUrlCopy({
        qrcode: {
          disabled: false,
          color: 'white',
        },
      }), // https://github.com/XioDone/vite-plugin-url-copy
      AutoExport({
        path: ['src/{utils,api}/*'],
        extname: 'ts',
        formatter: fileName => `export * from './${fileName}'`,
      }), // https://github.com/coderhyh/unplugin-auto-export
      VitePluginDebug(), // https://github.com/hu3dao/vite-plugin-debug/blob/master/README.zh-CN.md
      // virtual({
      //   'virtual:module': 'export default { mode: \'web\' }',
      // }), // https://github.com/patak-dev/vite-plugin-virtual Vite5 type=module 报错
      svgLoader(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }), // https://github.com/vbenjs/vite-plugin-svg-icons
      UnpluginSvgComponent({
        iconDir: 'src/assets/icons',
      }),
      svgSfc(),
      webUpdateNotice({
        logVersion: true,
      }), // https://github.com/GreatAuk/plugin-web-update-notification
      vitePluginVersionMark({
        // name: 'test-app',
        // version: '0.0.1',
        // command: 'git describe --tags',
        ifGitSHA: true,
        ifShortSHA: true,
        ifMeta: true,
        ifLog: true,
        ifGlobal: true,
      }), // https://github.com/ZhongxuYang/vite-plugin-version-mark
      Info(), // https://github.com/yjl9903/unplugin-info
      // viteVueCSSVars({
      //   include: [/.vue/],
      //   includeCompile: ['**/**.scss'],
      //   server: false,
      // }), // https://github.com/baiwusanyu-c/unplugin-vue-cssvars
      WebfontDownload(), // https://github.com/feat-agency/vite-plugin-webfont-dl
      TurboConsole(), // https://github.com/unplugin/unplugin-turbo-console
      analyzer({
        analyzerMode: 'static',
      }), // https://github.com/nonzzz/vite-bundle-analyzer
      ...VitePluginAutoImport(),
      ...VitePluginComponents(),
      ...VitePluginI18n(),
      ...VitePluginMarkdown(),
    ],
    clearScreen: false,
    base: VITE_BASE ?? '/',
    server: {
      port: Number(VITE_DEV_PORT),
      host: true,
      open: false,
      cors: true,
      strictPort: true,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 5678,
          }
        : undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
      proxy: {
        [VITE_API_BASE_PREFIX]: {
          target: VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${VITE_API_BASE_PREFIX}`), ''),
        },
      },
    },
    preview: {
      host: true,
    },
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    build: {
      target: process.env.TAURI_ENV_PLATFORM === 'windows'
        ? 'chrome105'
        : 'safari13',
      minify: debug ? false : 'esbuild',
      sourcemap: debug,
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      assetsDir: 'static/assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          loading: resolve(__dirname, 'loading.html'),
        },
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {},
        },
      },
    },
    resolve: {
      alias: {
        '~': resolve(__dirname, './src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
        scopeBehaviour: 'local',
      },
      postcss: {
        plugins: [
          postcssPresetEnv(),
        ],
      },
    },
  }
})
