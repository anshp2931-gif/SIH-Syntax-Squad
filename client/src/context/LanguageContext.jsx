import React, { createContext, useState, useEffect } from 'react';
import enDict from '../translations/en.json';
import hiDict from '../translations/hi.json';

const dictionaries = {
  en: enDict,
  hi: hiDict
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Load persisted language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('PramaanSetu_language');
    if (savedLanguage && dictionaries[savedLanguage]) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const changeLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguage(lang);
      localStorage.setItem('PramaanSetu_language', lang);
      document.documentElement.lang = lang;
    }
  };

  /**
   * Core translation function supporting dot-notation nested keys and interpolation
   * Example: t("dashboard.welcome", { name: "John" })
   */
  const t = (path, interpolations = {}) => {
    const defaultDict = dictionaries['en'];
    const activeDict = dictionaries[language] || defaultDict;

    // Helper to extract nested string
    const resolvePath = (obj, pathString) => {
      return pathString.split('.').reduce((prev, curr) => {
        return (prev && prev[curr] !== undefined) ? prev[curr] : undefined;
      }, obj);
    };

    let result = resolvePath(activeDict, path);

    // Fallback to English if active language (e.g. Hindi) is missing key
    if (result === undefined && language !== 'en') {
      result = resolvePath(defaultDict, path);
    }

    // Still undefined? Return key path as a visual warning placeholder
    if (result === undefined) return path;

    // Apply interpolations (e.g. replacing {{key}} with actual value)
    for (const key in interpolations) {
      if (Object.prototype.hasOwnProperty.call(interpolations, key)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), interpolations[key]);
      }
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
