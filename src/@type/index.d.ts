declare module 'virtual:pwa-register/react' {
    import type { ServiceWorkerRegistration } from './vite-env'

    export type RegisterSWOptions = {
        immediate?: boolean
        onNeedRefresh?: () => void
        onOfflineReady?: () => void
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
        onRegisterError?: (error: unknown) => void
    }

    export function useRegisterSW(options?: RegisterSWOptions): {
        needRefresh: boolean
        offlineReady: boolean
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>
    }
}
