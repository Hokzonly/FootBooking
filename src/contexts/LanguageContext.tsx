import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, defaultLanguage, Translations } from '../config/languages';

interface LanguageContextType {
  currentLanguage: string;
  t: (key: keyof Translations) => string;
  setLanguage: (language: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);

  const t = (key: keyof Translations): string => {
    const translation = translations[currentLanguage];
    if (!translation) {
      console.warn(`Translation not found for language: ${currentLanguage}`);
      return translations[defaultLanguage][key] || key;
    }
    return translation[key] || translations[defaultLanguage][key] || key;
  };

  const setLanguage = (language: string) => {
    if (translations[language]) {
      setCurrentLanguage(language);
      localStorage.setItem('footbooking-language', language);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 