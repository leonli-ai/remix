// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const enModules = import.meta.glob("./locales/en/**/*.json", { eager: true });
const esModules = import.meta.glob("./locales/es/**/*.json", { eager: true });

function loadAllTranslations(modules: Record<string, any>) {
  const translation: { [key: string]: any } = {};

  for (const path in modules) {
    const parts = path.split("/");
    const relevantParts = parts.slice(3); // Adjust the slice index based on your directory structure

    let currentLevel = translation;
    for (let i = 0; i < relevantParts.length; i++) {
      const part = relevantParts[i].replace(".json", "");
      if (i === relevantParts.length - 1) {
        currentLevel[part] = modules[path].default;
      } else {
        currentLevel[part] = currentLevel[part] || {};
        currentLevel = currentLevel[part];
      }
    }
  }

  return { translation };
}

const enTranslations = loadAllTranslations(enModules);
const esTranslations = loadAllTranslations(esModules);
i18n.use(initReactI18next).init({
  resources: {
    en: enTranslations,
    es: esTranslations,
  },
  lng: "en", // default language
  fallbackLng: "en", // if the translation of the current language does not exist, the language used
  interpolation: {
    escapeValue: false, // react has already handled the escape
  },
});

export default i18n;
