import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLang = (lng: "en" | "tr") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => changeLang("en")}
        disabled={i18n.language === "en"}
        className="tr-button"
      >
        English
      </button>
      <button
        onClick={() => changeLang("tr")}
        disabled={i18n.language === "tr"}
        className="tr-button"
      >
        Türkçe
      </button>
    </div>
  );
};

export default LanguageSwitcher;
