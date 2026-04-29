import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_OPTIONS = [
    { code: "zh-CN", value: "中文" },
    { code: "en-US", value: "English" },
];

export function useLanguage() {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<string>(() => {
        return localStorage.getItem('globalAppLanguage') || 'zh-CN';
    });

    const changeLanguage = useCallback((value: string) => {
        setLanguage(value);
        i18n.changeLanguage(value);
    }, [i18n]);

    useEffect(() => {
        const savedLang = localStorage.getItem('globalAppLanguage');
        if (savedLang && savedLang !== i18n.language) {
            i18n.changeLanguage(savedLang);
        } else if (!savedLang) {
            localStorage.setItem('globalAppLanguage', i18n.language);
        }

        const languageChangeHandler = (lng: string) => {
            localStorage.setItem('globalAppLanguage', lng);
        };

        i18n.on('languageChanged', languageChangeHandler);
        return () => {
            i18n.off('languageChanged', languageChangeHandler);
        };
    }, [i18n]);

    return { language, setLanguage: changeLanguage, languageOptions: LANGUAGE_OPTIONS };
}
