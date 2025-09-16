// Utility functions for translating dynamic content from AI responses

export const translatePatentContent = (targetLanguage: string) => {
  // Translation mappings for common patent terms
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      'Não informado': 'Not informed',
      'Vigente': 'Active',
      'Expirada': 'Expired',
      'Ativa': 'Active',
      'Inativa': 'Inactive',
      'Permitida': 'Permitted',
      'Restrita': 'Restricted',
      'SIM': 'YES',
      'NÃO': 'NO',
      'Alta': 'High',
      'Média': 'Medium',
      'Baixa': 'Low',
      'Brasil': 'Brazil',
      'Estados Unidos': 'United States',
      'União Europeia': 'European Union',
      'Alemanha': 'Germany',
      'França': 'France',
      'Reino Unido': 'United Kingdom',
      'Japão': 'Japan',
      'China': 'China',
      'Coreia do Sul': 'South Korea',
      'Canadá': 'Canada',
      'Austrália': 'Australia',
      'Índia': 'India',
      'Itália': 'Italy',
      'Espanha': 'Spain',
      'Holanda': 'Netherlands',
      'Suíça': 'Switzerland',
      'México': 'Mexico',
      'Argentina': 'Argentina',
      'Chile': 'Chile',
      'Colômbia': 'Colombia',
      'Peru': 'Peru',
      'Uruguai': 'Uruguay',
      'Rússia': 'Russia'
    },
    es: {
      'Não informado': 'No informado',
      'Vigente': 'Vigente',
      'Expirada': 'Expirada',
      'Ativa': 'Activa',
      'Inativa': 'Inactiva',
      'Permitida': 'Permitida',
      'Restrita': 'Restringida',
      'SIM': 'SÍ',
      'NÃO': 'NO',
      'Alta': 'Alta',
      'Média': 'Media',
      'Baixa': 'Baja',
      'Brasil': 'Brasil',
      'Estados Unidos': 'Estados Unidos',
      'União Europeia': 'Unión Europea',
      'Alemanha': 'Alemania',
      'França': 'Francia',
      'Reino Unido': 'Reino Unido',
      'Japão': 'Japón',
      'China': 'China',
      'Coreia do Sul': 'Corea del Sur',
      'Canadá': 'Canadá',
      'Austrália': 'Australia',
      'Índia': 'India',
      'Itália': 'Italia',
      'Espanha': 'España',
      'Holanda': 'Países Bajos',
      'Suíça': 'Suiza',
      'México': 'México',
      'Argentina': 'Argentina',
      'Chile': 'Chile',
      'Colômbia': 'Colombia',
      'Peru': 'Perú',
      'Uruguai': 'Uruguay',
      'Rússia': 'Rusia'
    },
    de: {
      'Não informado': 'Nicht angegeben',
      'Vigente': 'Gültig',
      'Expirada': 'Abgelaufen',
      'Ativa': 'Aktiv',
      'Inativa': 'Inaktiv',
      'Permitida': 'Erlaubt',
      'Restrita': 'Eingeschränkt',
      'SIM': 'JA',
      'NÃO': 'NEIN',
      'Alta': 'Hoch',
      'Média': 'Mittel',
      'Baixa': 'Niedrig',
      'Brasil': 'Brasilien',
      'Estados Unidos': 'Vereinigte Staaten',
      'União Europeia': 'Europäische Union',
      'Alemanha': 'Deutschland',
      'França': 'Frankreich',
      'Reino Unido': 'Vereinigtes Königreich',
      'Japão': 'Japan',
      'China': 'China',
      'Coreia do Sul': 'Südkorea',
      'Canadá': 'Kanada',
      'Austrália': 'Australien',
      'Índia': 'Indien',
      'Itália': 'Italien',
      'Espanha': 'Spanien',
      'Holanda': 'Niederlande',
      'Suíça': 'Schweiz',
      'México': 'Mexiko',
      'Argentina': 'Argentinien',
      'Chile': 'Chile',
      'Colômbia': 'Kolumbien',
      'Peru': 'Peru',
      'Uruguai': 'Uruguay',
      'Rússia': 'Russland'
    },
    fr: {
      'Não informado': 'Non renseigné',
      'Vigente': 'En vigueur',
      'Expirada': 'Expirée',
      'Ativa': 'Active',
      'Inativa': 'Inactive',
      'Permitida': 'Autorisée',
      'Restrita': 'Restreinte',
      'SIM': 'OUI',
      'NÃO': 'NON',
      'Alta': 'Élevée',
      'Média': 'Moyenne',
      'Baixa': 'Faible',
      'Brasil': 'Brésil',
      'Estados Unidos': 'États-Unis',
      'União Europeia': 'Union Européenne',
      'Alemanha': 'Allemagne',
      'França': 'France',
      'Reino Unido': 'Royaume-Uni',
      'Japão': 'Japon',
      'China': 'Chine',
      'Coreia do Sul': 'Corée du Sud',
      'Canadá': 'Canada',
      'Austrália': 'Australie',
      'Índia': 'Inde',
      'Itália': 'Italie',
      'Espanha': 'Espagne',
      'Holanda': 'Pays-Bas',
      'Suíça': 'Suisse',
      'México': 'Mexique',
      'Argentina': 'Argentine',
      'Chile': 'Chili',
      'Colômbia': 'Colombie',
      'Peru': 'Pérou',
      'Uruguai': 'Uruguay',
      'Rússia': 'Russie'
    },
    ru: {
      'Não informado': 'Не указано',
      'Vigente': 'Действующий',
      'Expirada': 'Истёк',
      'Ativa': 'Активный',
      'Inativa': 'Неактивный',
      'Permitida': 'Разрешено',
      'Restrita': 'Ограничено',
      'SIM': 'ДА',
      'NÃO': 'НЕТ',
      'Alta': 'Высокая',
      'Média': 'Средняя',
      'Baixa': 'Низкая',
      'Brasil': 'Бразилия',
      'Estados Unidos': 'Соединённые Штаты',
      'União Europeia': 'Европейский Союз',
      'Alemanha': 'Германия',
      'França': 'Франция',
      'Reino Unido': 'Великобритания',
      'Japão': 'Япония',
      'China': 'Китай',
      'Coreia do Sul': 'Южная Корея',
      'Canadá': 'Канада',
      'Austrália': 'Австралия',
      'Índia': 'Индия',
      'Itália': 'Италия',
      'Espanha': 'Испания',
      'Holanda': 'Нидерланды',
      'Suíça': 'Швейцария',
      'México': 'Мексика',
      'Argentina': 'Аргентина',
      'Chile': 'Чили',
      'Colômbia': 'Колумбия',
      'Peru': 'Перу',
      'Uruguai': 'Уругвай',
      'Rússia': 'Россия'
    },
    zh: {
      'Não informado': '未提供信息',
      'Vigente': '有效',
      'Expirada': '已过期',
      'Ativa': '活跃',
      'Inativa': '非活跃',
      'Permitida': '允许',
      'Restrita': '受限',
      'SIM': '是',
      'NÃO': '否',
      'Alta': '高',
      'Média': '中',
      'Baixa': '低',
      'Brasil': '巴西',
      'Estados Unidos': '美国',
      'União Europeia': '欧盟',
      'Alemanha': '德国',
      'França': '法国',
      'Reino Unido': '英国',
      'Japão': '日本',
      'China': '中国',
      'Coreia do Sul': '韩国',
      'Canadá': '加拿大',
      'Austrália': '澳大利亚',
      'Índia': '印度',
      'Itália': '意大利',
      'Espanha': '西班牙',
      'Holanda': '荷兰',
      'Suíça': '瑞士',
      'México': '墨西哥',
      'Argentina': '阿根廷',
      'Chile': '智利',
      'Colômbia': '哥伦比亚',
      'Peru': '秘鲁',
      'Uruguai': '乌拉圭',
      'Rússia': '俄罗斯'
    }
  };

  const translateText = (text: string, targetLang: string): string => {
    if (!text || targetLang === 'pt') return text;
    
    const langTranslations = translations[targetLang];
    if (!langTranslations) return text;

    // Try exact match first
    if (langTranslations[text]) {
      return langTranslations[text];
    }

    // Try partial matches for compound phrases
    let translatedText = text;
    Object.keys(langTranslations).forEach(key => {
      if (text.includes(key)) {
        translatedText = translatedText.replace(new RegExp(key, 'g'), langTranslations[key]);
      }
    });

    return translatedText;
  };

  const translateObject = (obj: any, targetLang: string): any => {
    if (!obj || targetLang === 'pt') return obj;

    if (typeof obj === 'string') {
      return translateText(obj, targetLang);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => translateObject(item, targetLang));
    }

    if (typeof obj === 'object' && obj !== null) {
      const translated: any = {};
      Object.keys(obj).forEach(key => {
        translated[key] = translateObject(obj[key], targetLang);
      });
      return translated;
    }

    return obj;
  };

  return { translateText, translateObject };
};

// Simple hook that doesn't depend on react-i18next
export const useContentTranslation = () => {
  // Default to Portuguese if no language is available
  const currentLanguage = 'pt';
  return translatePatentContent(currentLanguage);
};