import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'appTheme';

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return 'dark';
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY, t);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [theme]);

    return { theme, setTheme, toggleTheme };
}
