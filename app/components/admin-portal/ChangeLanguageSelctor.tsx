import React, { useEffect, useState } from "react";
import { Select } from "@shopify/polaris";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { LanguagesIcon } from "lucide-react";
import { LOCALSTORAGE_LANGUAGE_KEY } from "~/constant/common";

const ChangeLanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  // check if the code is running in the browser
  const isBrowser = typeof window !== "undefined";

  const [language, setLanguage] = useState<string>(() => {
    // check if the code is running in the browser
    if (isBrowser) {
      return localStorage.getItem(LOCALSTORAGE_LANGUAGE_KEY) || "en";
    }
    return "en";
  });

  useEffect(() => {
    if (isBrowser) {
      // initialize the language of i18n
      i18n.changeLanguage(language);
    }
  }, [language, isBrowser]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (isBrowser) {
      i18n.changeLanguage(newLanguage);
      localStorage.setItem(LOCALSTORAGE_LANGUAGE_KEY, newLanguage);
    }
  };

  const Label = () => {
    return <LanguagesIcon className="w-4 h-4" />;
  };

  return (
    <div className="w-36 text-center">
      <Select
        // label={t("admin-portal.change-language-selector.select-language")}
        label={<Label />}
        labelInline
        options={[
          { label: "English", value: "en" },
          { label: "Español", value: "es" },
        ]}
        onChange={handleLanguageChange}
        value={language}
      />
    </div>
  );
};

export default ChangeLanguageSelector;
