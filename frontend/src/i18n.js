import i18n from "i18next"
import detector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import translationGr from "./locales/gr/translation.json"
import translationCH from "./locales/ch/translation.json"
import translationSP from "./locales/sp/translation.json"
import translationENG from "./locales/eng/translation.json"
import translationTR from "./locales/tr/translation.json"
import translationUA from "./locales/ua/translation.json"
import translationAR from "./locales/ar/translation.json"



// the translations
const resources = {
  gr: {
    translation: translationGr,
  },
  ar: {
    translation: translationAR,
  },
  ch: {
    translation: translationCH,
  },
  sp: {
    translation: translationSP,
  },
  eng: {
    translation: translationENG,
  },
  tr: {
    translation: translationTR,
  },
  ua: {
    translation: translationUA,
  }
}

const language = localStorage.getItem("I18N_LANGUAGE")
if (!language) {
  localStorage.setItem("I18N_LANGUAGE", "en")
}

i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("I18N_LANGUAGE") || "en",
    fallbackLng: "en", // use en if detected lng is not available

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export default i18n
