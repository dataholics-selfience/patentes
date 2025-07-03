import { PatentResultType } from '../types';

// Função robusta para parse de resposta de patentes
export const parsePatentResponse = (rawResponse: any): PatentResultType => {
  console.log('🔍 Raw response received:', rawResponse);
  
  let jsonString = '';
  let parsedData: any = null;
  
  try {
    // Handle nested array structure
    if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      if (rawResponse[0].output) {
        // Check if it's a nested structure
        if (typeof rawResponse[0].output === 'string') {
          try {
            const parsed = JSON.parse(rawResponse[0].output);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
              jsonString = parsed[0].output;
            } else {
              jsonString = rawResponse[0].output;
            }
          } catch {
            jsonString = rawResponse[0].output;
          }
        } else {
          jsonString = JSON.stringify(rawResponse[0].output);
        }
      }
    } else if (typeof rawResponse === 'string') {
      jsonString = rawResponse;
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      jsonString = JSON.stringify(rawResponse);
    }
    
    // Remove markdown code block fences and clean up
    jsonString = jsonString
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\s*\[?\s*/, '') // Remove leading array bracket and whitespace
      .replace(/\s*\]?\s*$/, '') // Remove trailing array bracket and whitespace
      .trim();
    
    console.log('🧹 Cleaned JSON string:', jsonString);
    
    // Parse the actual patent data - handle both array and object formats
    try {
      const parsed = JSON.parse(jsonString);
      // If it's an array, take the first element
      parsedData = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      console.log('📝 Attempting alternative parsing...');
      
      // Try to extract JSON from text using regex
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('✅ Alternative parsing successful');
        } catch (altError) {
          console.error('❌ Alternative parsing failed:', altError);
          throw new Error('Invalid JSON response from API');
        }
      } else {
        throw new Error('No valid JSON found in response');
      }
    }
    
    console.log('📊 Parsed data:', parsedData);
    
  } catch (error) {
    console.error('💥 Critical parsing error:', error);
    throw new Error(`Failed to parse patent response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate that we have some data
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('Invalid patent data structure received');
  }

  // Parse countries from various formats
  const parseCountries = (countriesData: any): string[] => {
    console.log('🌍 Parsing countries:', countriesData);
    
    if (Array.isArray(countriesData)) {
      return countriesData.filter(country => country && typeof country === 'string');
    }
    
    if (typeof countriesData === 'string') {
      // Split by common separators and clean up
      const countries = countriesData
        .split(/[,;]/)
        .map(country => country.trim())
        .filter(country => country.length > 0);
      
      console.log('🌍 Parsed countries from string:', countries);
      return countries;
    }
    
    return [];
  };

  // Parse risks from various formats
  const parseRisks = (risksData: any): string[] => {
    console.log('⚠️ Parsing risks:', risksData);
    
    if (Array.isArray(risksData)) {
      return risksData.filter(risk => risk && typeof risk === 'string');
    }
    
    if (typeof risksData === 'string') {
      // If it's a single string, return as array with one element
      return [risksData];
    }
    
    return [];
  };

  // Parse alternatives from various formats
  const parseAlternatives = (alternativesData: any): string[] => {
    console.log('🧪 Parsing alternatives:', alternativesData);
    
    if (Array.isArray(alternativesData)) {
      return alternativesData
        .map(alt => {
          if (typeof alt === 'string') return alt;
          if (typeof alt === 'object' && alt !== null) {
            return alt.nome || alt.name || alt.descricao || alt.description || String(alt);
          }
          return String(alt);
        })
        .filter(alt => alt && alt.length > 0);
    }
    
    if (typeof alternativesData === 'string') {
      // Split by common separators and clean up
      return alternativesData
        .split(/[,;]/)
        .map(alt => alt.trim())
        .filter(alt => alt.length > 0);
    }
    
    return [];
  };

  // Parse boolean values safely
  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === 'sim' || lower === 'yes' || lower === '1';
    }
    if (typeof value === 'number') return value > 0;
    return false;
  };

  // Map the fields to match PatentResultType interface with improved field mapping
  const resultado: PatentResultType = {
    substancia: parsedData.substancia || 
               parsedData.produto || 
               parsedData.substance || 
               parsedData.product ||
               'Produto consultado',
               
    patente_vigente: parseBoolean(
      parsedData.patente_vigente || 
      parsedData.patent_valid || 
      parsedData.valid ||
      parsedData.vigente ||
      false
    ),
    
    data_expiracao_patente_principal: parsedData.data_expiracao_patente_principal || 
                                     parsedData.data_estimativa_expiracao || 
                                     parsedData.data_vencimento_patente ||
                                     parsedData.expiration_date ||
                                     parsedData.main_patent_expiration ||
                                     'Não informado',
                                     
    paises_registrados: parseCountries(
      parsedData.paises_registrados || 
      parsedData.paises_registro ||
      parsedData.registered_countries ||
      parsedData.countries ||
      []
    ),
    
    exploracao_comercial: parseBoolean(
      parsedData.exploracao_comercial || 
      parsedData.explorada_comercialmente ||
      parsedData.commercial_exploitation ||
      parsedData.commercial_use ||
      false
    ),
    
    riscos_regulatorios_eticos: parseRisks(
      parsedData.riscos_regulatorios_eticos || 
      parsedData.riscos_regulatorios_ou_eticos ||
      parsedData.regulatory_risks ||
      parsedData.risks ||
      parsedData.regulatory_ethical_risks ||
      'Não informado'
    ),
    
    data_vencimento_patente_novo_produto: parsedData.data_vencimento_patente_novo_produto || 
                                        parsedData.data_vencimento_para_novo_produto || 
                                        parsedData.data_vencimento_patente ||
                                        parsedData.new_product_expiration ||
                                        parsedData.new_patent_expiration ||
                                        null,
                                        
    alternativas_compostos: parseAlternatives(
      parsedData.alternativas_compostos ||
      parsedData.alternativas_de_compostos_analogos ||
      parsedData.alternative_compounds ||
      parsedData.alternatives ||
      parsedData.analogs ||
      []
    )
  };
  
  console.log('✅ Final resultado:', resultado);
  
  // Validate the result has minimum required data
  if (!resultado.substancia || resultado.substancia === 'Produto consultado') {
    console.warn('⚠️ Warning: No substance name found in response');
  }
  
  return resultado;
};