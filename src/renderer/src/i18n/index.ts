import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { nb } from './nb'
import { en } from './en'

i18n.use(initReactI18next).init({
  resources: { nb: { translation: nb }, en: { translation: en } },
  lng: 'nb',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
