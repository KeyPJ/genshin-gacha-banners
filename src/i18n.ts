import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import cn from './locales/cn/translation.json'
import en from './locales/en/translation.json'

const resources = {
    cn: { translation: cn },
    en: { translation: en },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'cn',
        debug: false,
        detection: {
            caches: ['localStorage', 'sessionStorage', 'cookie'],
        }
    });

export default i18n;
