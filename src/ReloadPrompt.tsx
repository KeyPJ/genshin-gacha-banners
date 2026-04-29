import React, { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import './ReloadPrompt.css'

function ReloadPrompt() {
    const [dismissed, setDismissed] = useState(false);

    const {
        offlineReady,
        needRefresh,
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (r) {
                // Check for updates every hour
                setInterval(() => {
                    r.update()
                }, 60 * 60 * 1000)
            }
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    if (!offlineReady && !needRefresh) {
        return null
    }

    if (dismissed) {
        return null
    }

    return (
        <div className="ReloadPrompt-container">
            <div className="ReloadPrompt-toast">
                <div className="ReloadPrompt-message">
                    {offlineReady
                        ? <span>App ready to work offline</span>
                        : <span>New content available, reload to update.</span>
                    }
                </div>
                {needRefresh && (
                    <button className="ReloadPrompt-toast-button" onClick={() => updateServiceWorker(true)}>
                        Reload
                    </button>
                )}
                <button className="ReloadPrompt-toast-button" onClick={() => setDismissed(true)}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default ReloadPrompt
