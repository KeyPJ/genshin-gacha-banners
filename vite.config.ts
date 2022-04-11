import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // 选项写法
            '/uploads': {
                target: 'https://genshin-wishes.com/content/uploads', // 所要代理的目标地址
                rewrite: path => path.replace(/^\/uploads/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
                changeOrigin: true,  // true/false, Default: false - changes the origin of the host header to the target URL
            },
            '/api': {
                target: 'https://genshin-wishes.com/api', // 所要代理的目标地址
                rewrite: path => path.replace(/^\/api/, ''), // 重写传过来的path路径，比如 `/api/index/1?id=10&name=zs`（注意:path路径最前面有斜杠（/），因此，正则匹配的时候不要忘了是斜杠（/）开头的；选项的 key 也是斜杠（/）开头的）
                changeOrigin: true,  // true/false, Default: false - changes the origin of the host header to the target URL
            },
        }
    }
})
