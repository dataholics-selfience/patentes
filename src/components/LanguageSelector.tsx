import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation, Language } from '../utils/i18n.tsx';

const LanguageSelector = () => {
  const { t, language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'pt', name: t.portuguese, flag: '🇧🇷' },
    { code: 'en', name: t.english, flag: '🇺🇸' },
    { code: 'fr', name: t.french, flag: '🇫🇷' },
    { code: 'it', name: t.italian, flag: '🇮🇹' },
    { code: 'es', name: t.spanish, flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
      >
        <Globe size={16} className="text-gray-500" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium">{currentLanguage?.name}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              } first:rounded-t-lg last:rounded-b-lg`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;