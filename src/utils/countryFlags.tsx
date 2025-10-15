import Flag from 'react-world-flags';
import { useTranslation } from './i18n';

// Country code mapping for react-world-flags
const countryCodeMap: { [key: string]: string } = {
  // Portuguese names
  'Brasil': 'BR',
  'Estados Unidos': 'US',
  'Alemanha': 'DE',
  'França': 'FR',
  'Reino Unido': 'GB',
  'Japão': 'JP',
  'China': 'CN',
  'Coreia do Sul': 'KR',
  'Canadá': 'CA',
  'Austrália': 'AU',
  'Índia': 'IN',
  'Itália': 'IT',
  'Espanha': 'ES',
  'Holanda': 'NL',
  'Suíça': 'CH',
  'Suécia': 'SE',
  'Noruega': 'NO',
  'Dinamarca': 'DK',
  'Finlândia': 'FI',
  'Bélgica': 'BE',
  'Áustria': 'AT',
  'Portugal': 'PT',
  'México': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colômbia': 'CO',
  'Peru': 'PE',
  'Uruguai': 'UY',
  'Rússia': 'RU',
  'África do Sul': 'ZA',
  'Israel': 'IL',
  'Singapura': 'SG',
  'Tailândia': 'TH',
  'Malásia': 'MY',
  'Indonésia': 'ID',
  'Filipinas': 'PH',
  'Vietnã': 'VN',
  'Taiwan': 'TW',
  'Hong Kong': 'HK',
  'Nova Zelândia': 'NZ',
  
  // English names
  'Brazil': 'BR',
  'United States': 'US',
  'USA': 'US',
  'US': 'US',
  'Germany': 'DE',
  'France': 'FR',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Canada': 'CA',
  'Australia': 'AU',
  'India': 'IN',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Switzerland': 'CH',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Belgium': 'BE',
  'Austria': 'AT',
  'Mexico': 'MX',
  'Colombia': 'CO',
  'Uruguay': 'UY',
  'Russia': 'RU',
  'South Africa': 'ZA',
  'Singapore': 'SG',
  'Thailand': 'TH',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Hong Kong': 'HK',
  'New Zealand': 'NZ',
  
  // French names
  'Brésil': 'BR',
  'États-Unis': 'US',
  'Allemagne': 'DE',
  'Royaume-Uni': 'GB',
  'Japon': 'JP',
  'Corée du Sud': 'KR',
  'Australie': 'AU',
  'Inde': 'IN',
  'Italie': 'IT',
  'Espagne': 'ES',
  'Pays-Bas': 'NL',
  'Suisse': 'CH',
  'Suède': 'SE',
  'Norvège': 'NO',
  'Danemark': 'DK',
  'Finlande': 'FI',
  'Belgique': 'BE',
  'Autriche': 'AT',
  'Mexique': 'MX',
  'Colombie': 'CO',
  'Russie': 'RU',
  'Afrique du Sud': 'ZA',
  'Thaïlande': 'TH',
  'Malaisie': 'MY',
  'Indonésie': 'ID',
  'Nouvelle-Zélande': 'NZ',
  
  // Italian names
  'Brasile': 'BR',
  'Stati Uniti': 'US',
  'Germania': 'DE',
  'Francia': 'FR',
  'Regno Unito': 'GB',
  'Giappone': 'JP',
  'Cina': 'CN',
  'Corea del Sud': 'KR',
  'Australia': 'AU',
  'Spagna': 'ES',
  'Paesi Bassi': 'NL',
  'Svizzera': 'CH',
  'Svezia': 'SE',
  'Norvegia': 'NO',
  'Danimarca': 'DK',
  'Finlandia': 'FI',
  'Belgio': 'BE',
  'Portogallo': 'PT',
  'Messico': 'MX',
  'Perù': 'PE',
  'Sudafrica': 'ZA',
  'Israele': 'IL',
  'Tailandia': 'TH',
  'Filippine': 'PH',
  'Nuova Zelanda': 'NZ',
  
  // Spanish names
  'Estados Unidos': 'US',
  'Reino Unido': 'GB',
  'Corea del Sur': 'KR',
  'Países Bajos': 'NL',
  'Sudáfrica': 'ZA',
  'Nueva Zelanda': 'NZ',
  
  // Regional organizations
  'Europa': 'EU',
  'European Union': 'EU',
  'EU': 'EU',
  'EPO': 'EU',
  'European Patent Office': 'EU',
  'União Europeia': 'EU',
  'Union Européenne': 'EU',
  'Unione Europea': 'EU',
  'Unión Europea': 'EU'
};

// Function to parse countries from text - IMPROVED to extract ALL countries
export const parseCountriesFromText = (countriesText: string): string[] => {
  if (!countriesText || typeof countriesText !== 'string') {
    return [];
  }

  // Remove common suffixes that don't represent countries
  let cleanText = countriesText
    .replace(/,?\s*(mas\s+já\s+expiradas?|but\s+already\s+expired|mais\s+déjà\s+expirées?|ma\s+già\s+scadute?|pero\s+ya\s+expiradas?)\s*\.?\s*$/i, '')
    .replace(/,?\s*(entre\s+outros?|among\s+others?|entre\s+autres?|tra\s+gli\s+altri|entre\s+otros?)\s*\.?\s*$/i, '')
    .trim();

  // Split by common separators
  const separators = [',', ';', ' e ', ' and ', ' et ', ' y ', ' und ', ' en ', ' og '];
  let countries = [cleanText];
  
  separators.forEach(separator => {
    countries = countries.flatMap(country => 
      country.split(separator).map(c => c.trim())
    );
  });

  // Clean up each country name
  const cleanedCountries = countries
    .map(country => {
      return country
        .replace(/^\s*-\s*/, '') // Remove leading dashes
        .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
        .replace(/\s*\[.*?\]\s*/g, '') // Remove brackets content
        .trim();
    })
    .filter(country => {
      // Filter out empty strings and common non-country phrases
      if (!country || country.length < 2) return false;
      
      const lowerCountry = country.toLowerCase();
      const excludePatterns = [
        /^diversos\s+outros?\s+países?/i,
        /^various\s+other\s+countries?/i,
        /^divers\s+autres\s+pays/i,
        /^vari\s+altri\s+paesi/i,
        /^varios\s+otros\s+países/i,
        /^outros?\s+países?/i,
        /^other\s+countries?/i,
        /^autres?\s+pays/i,
        /^altri\s+paesi/i,
        /^otros?\s+países/i,
        /^etc\.?$/i,
        /^e\s+outros?$/i,
        /^and\s+others?$/i,
        /^et\s+autres?$/i,
        /^y\s+otros?$/i
      ];
      
      return !excludePatterns.some(pattern => pattern.test(country));
    });

  return cleanedCountries;
};

// Function to get country code from country name
export const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  
  // First try exact match
  const exactMatch = countryCodeMap[countryName];
  if (exactMatch) return exactMatch;
  
  // Try case-insensitive match
  const lowerCountry = countryName.toLowerCase();
  const foundKey = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase() === lowerCountry
  );
  
  if (foundKey) return countryCodeMap[foundKey];
  
  // Try partial match
  const partialMatch = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase().includes(lowerCountry) || lowerCountry.includes(key.toLowerCase())
  );
  
  if (partialMatch) return countryCodeMap[partialMatch];
  
  return null;
};

// Function to get translated country name
export const getTranslatedCountryName = (countryName: string): string => {
  const { t } = useTranslation();
  
  // Map common country names to translation keys
  const countryTranslationMap: { [key: string]: keyof typeof t } = {
    'Brasil': 'brazil',
    'Brazil': 'brazil',
    'Estados Unidos': 'unitedStates',
    'United States': 'unitedStates',
    'USA': 'unitedStates',
    'US': 'unitedStates',
    'Alemanha': 'germany',
    'Germany': 'germany',
    'França': 'france',
    'France': 'france',
    'Reino Unido': 'unitedKingdom',
    'United Kingdom': 'unitedKingdom',
    'UK': 'unitedKingdom',
    'Japão': 'japan',
    'Japan': 'japan',
    'China': 'china',
    'Coreia do Sul': 'southKorea',
    'South Korea': 'southKorea',
    'Canadá': 'canada',
    'Canada': 'canada',
    'Austrália': 'australia',
    'Australia': 'australia',
    'Índia': 'india',
    'India': 'india',
    'Itália': 'italy',
    'Italy': 'italy',
    'Espanha': 'spain',
    'Spain': 'spain',
    'Holanda': 'netherlands',
    'Netherlands': 'netherlands',
    'Suíça': 'switzerland',
    'Switzerland': 'switzerland',
    'Suécia': 'sweden',
    'Sweden': 'sweden',
    'Noruega': 'norway',
    'Norway': 'norway',
    'Dinamarca': 'denmark',
    'Denmark': 'denmark',
    'Finlândia': 'finland',
    'Finland': 'finland',
    'Bélgica': 'belgium',
    'Belgium': 'belgium',
    'Áustria': 'austria',
    'Austria': 'austria',
    'Portugal': 'portugal',
    'México': 'mexico',
    'Mexico': 'mexico',
    'Argentina': 'argentina',
    'Chile': 'chile',
    'Colômbia': 'colombia',
    'Colombia': 'colombia',
    'Peru': 'peru',
    'Uruguai': 'uruguay',
    'Uruguay': 'uruguay',
    'Rússia': 'russia',
    'Russia': 'russia',
    'África do Sul': 'southAfrica',
    'South Africa': 'southAfrica',
    'Israel': 'israel',
    'Singapura': 'singapore',
    'Singapore': 'singapore',
    'Tailândia': 'thailand',
    'Thailand': 'thailand',
    'Malásia': 'malaysia',
    'Malaysia': 'malaysia',
    'Indonésia': 'indonesia',
    'Indonesia': 'indonesia',
    'Filipinas': 'philippines',
    'Philippines': 'philippines',
    'Vietnã': 'vietnam',
    'Vietnam': 'vietnam',
    'Taiwan': 'taiwan',
    'Hong Kong': 'hongKong',
    'Nova Zelândia': 'newZealand',
    'New Zealand': 'newZealand',
    'Europa': 'europeanUnion',
    'European Union': 'europeanUnion',
    'EU': 'europeanUnion',
    'União Europeia': 'europeanUnion',
    'Internacional': 'international',
    'International': 'international'
  };
  
  const translationKey = countryTranslationMap[countryName];
  if (translationKey && t[translationKey]) {
    return t[translationKey] as string;
  }
  
  // Return original name if no translation found
  return countryName;
};

// Component to render country flag with name
interface CountryFlagProps {
  countryName: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ 
  countryName, 
  size = 24, 
  showName = true, 
  className = "" 
}) => {
  const countryCode = getCountryCode(countryName);
  const translatedName = getTranslatedCountryName(countryName);
  
  if (!countryCode) {
    // Fallback for unknown countries
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold"
          style={{ width: size, height: size * 0.75 }}
        >
          ?
        </div>
        {showName && <span>{translatedName}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size * 0.75 }} className="flex-shrink-0">
        <Flag 
          code={countryCode} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '2px',
            display: 'block'
          }}
          alt={`${translatedName} flag`}
        />
      </div>
      {showName && <span>{translatedName}</span>}
    </div>
  );
};

// Component to render ALL countries from text - NO LIMITS
interface CountryFlagsFromTextProps {
  countriesText: string;
  size?: number;
  showNames?: boolean;
  className?: string;
}

export const CountryFlagsFromText: React.FC<CountryFlagsFromTextProps> = ({
  countriesText,
  size = 24,
  showNames = true,
  className = ""
}) => {
  const countries = parseCountriesFromText(countriesText);
  
  if (countries.length === 0) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Nenhum país identificado
      </div>
    );
  }

  // SHOW ALL COUNTRIES - NO LIMITS
  return (
    <div className={`space-y-2 ${className}`}>
      {countries.map((country, index) => (
        <CountryFlag
          key={index}
          countryName={country}
          size={size}
          showName={showNames}
          className="mb-1"
        />
      ))}
    </div>
  );
};

export default CountryFlag;