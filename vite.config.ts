import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA, VitePWAOptions} from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'

const pwaOptions: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    workbox: {
        runtimeCaching: [
            {
                urlPattern: /data\/(.*?)/, // 接口缓存 此处填你想缓存的接口正则匹配
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'interface-cache',
                },
            },
            {
                urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/, // 图片缓存
                handler: 'CacheFirst',
                options: {
                    cacheName: 'image-cache',
                },
            },
            {
                // 匹配跨域请求
                urlPattern: new RegExp('^https://cdn\.jsdelivr\.net/npm'),
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'npm-cache',
                    expiration: {
                        maxAgeSeconds: 60 * 60 * 24 * 3
                    },
                    cacheableResponse: {
                        statuses: [0, 200]
                    },
                }
            }
        ],
    },
    base: '/',
    includeAssets: ['favicon.svg'],
    // strategies: 'injectManifest',
    manifest: {
        name: 'genshin-gacha-banners',
        short_name: 'Banners',
        description: "原神祈愿卡池一览GenshinGachaBanners",
        icons: [
            {
                src: 'Sayu.png', // <== don't add slash, for testing
                sizes: '256x256',
                type: 'image/png',
            },
            {
                src: 'Sayu.png', // <== don't add slash, for testing
                sizes: '512x512',
                type: 'image/png',
            }
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#F3F3F3",
        theme_color: "#F3F3F3"
    },
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA(pwaOptions),
        mkcert(),
    ],
    resolve: {
        alias: {
            // "genshin-db": "https://cdn.jsdelivr.net/npm/@keypj/genshin-db/+esm",
        }
    },
    server: {
        https: true,
        proxy: {
            '/game_record': {
                target: 'https://upload-os-bbs.mihoyo.com/game_record/', // 所要代理的目标地址
                rewrite: path => path.replace(/^\/game_record/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
                changeOrigin: true,  // true/false, Default: false - changes the origin of the host header to the target URL
            },
            '/data/': {
                // target: 'https://raw.githubusercontent.com/KeyPJ/FetchData/main/data/gacha/', // 所要代理的目标地址
                target: 'https://genshin-gacha-banners.52v6.com/', // 所要代理的目标地址
                // rewrite: path => path.replace(/^\/data/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
                changeOrigin: true,  // true/false, Default: false - changes the origin of the host header to the target URL
            },
            // 匹配以 /hsr/UI、/gi/UI 或 /zzz/UI 开头的请求
            '^/(hsr|gi|zzz)/UI': {
                target: 'https://api.hakush.in',
                changeOrigin: true, // 必要时修改请求头中的 Host
                rewrite: (path) => {
                    // 移除开头的 '/'，因为目标 URL 已经包含对应的路径
                    return path.replace(/^\/(hsr|gi|zzz)/, '$1');
                },
            },
            // 选项写法
            // '/api': {
            //     target: 'https://genshin-wishes.com/api', // 所要代理的目标地址
            //     rewrite: path => path.replace(/^\/api/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
            //     changeOrigin: true,  // true/false, Default: false - changes the origin of the host header to the target URL
            // },
        }
    }
})
