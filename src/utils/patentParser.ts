import { PatentResultType, PatentByCountry, CommercialExplorationByCountry } from '../types';

// Função robusta para parse de resposta de patentes - NOVO FORMATO
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
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsedData = parsed[0]; // Take first element from array
            } else {
              jsonString = rawResponse[0].output;
            }
          } catch {
            jsonString = rawResponse[0].output;
          }
        } else {
          parsedData = rawResponse[0].output;
        }
      } else {
        // Direct array with patent data
        parsedData = rawResponse[0];
      }
    } else if (typeof rawResponse === 'string') {
      jsonString = rawResponse;
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      parsedData = rawResponse;
    }
    
    // If we still have a string, parse it
    if (jsonString && !parsedData) {
      // Remove markdown code block fences and clean up
      jsonString = jsonString
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*\[?\s*/, '') // Remove leading array bracket and whitespace
        .replace(/\s*\]?\s*$/, '') // Remove trailing array bracket and whitespace
        .trim();
      
      console.log('🧹 Cleaned JSON string:', jsonString);
      
      // Parse the actual patent data
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
            const parsed = JSON.parse(jsonMatch[0]);
            parsedData = Array.isArray(parsed) ? parsed[0] : parsed;
            console.log('✅ Alternative parsing successful');
          } catch (altError) {
            console.error('❌ Alternative parsing failed:', altError);
            throw new Error('Invalid JSON response from API');
          }
        } else {
          throw new Error('No valid JSON found in response');
        }
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

  // Parse patents by country
  const parsePatentsByCountry = (patentsData: any): PatentByCountry[] => {
    console.log('🌍 Parsing patents by country:', patentsData);
    
    if (Array.isArray(patentsData)) {
      return patentsData.map(patent => ({
        pais: patent.pais || patent.country || 'Desconhecido',
        data_expiracao: patent.data_expiracao || patent.expiration_date || 'Não informado',
        tipos: Array.isArray(patent.tipos) ? patent.tipos : 
               Array.isArray(patent.types) ? patent.types : []
      }));
    }
    
    return [];
  };

  // Parse commercial exploration by country
  const parseCommercialExplorationByCountry = (explorationData: any): CommercialExplorationByCountry[] => {
    console.log('💼 Parsing commercial exploration by country:', explorationData);
    
    if (Array.isArray(explorationData)) {
      return explorationData.map(exploration => ({
        pais: exploration.pais || exploration.country || 'Desconhecido',
        data_disponivel: exploration.data_disponivel || exploration.available_date || 'Não informado',
        tipos_liberados: Array.isArray(exploration.tipos_liberados) ? exploration.tipos_liberados :
                        Array.isArray(exploration.released_types) ? exploration.released_types : []
      }));
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

  // Parse sources
  const parseSources = (sourcesData: any): string[] => {
    console.log('📚 Parsing sources:', sourcesData);
    
    if (Array.isArray(sourcesData)) {
      return sourcesData.filter(source => source && typeof source === 'string');
    }
    
    if (typeof sourcesData === 'string') {
      return [sourcesData];
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

  // Map the fields to match PatentResultType interface with NEW FORMAT
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

    // NEW FIELDS
    patentes_por_pais: parsePatentsByCountry(
      parsedData.patentes_por_pais || 
      parsedData.patents_by_country ||
      []
    ),

    exploracao_comercial_por_pais: parseCommercialExplorationByCountry(
      parsedData.exploracao_comercial_por_pais ||
      parsedData.commercial_exploration_by_country ||
      []
    ),
                                     
    exploracao_comercial: parseBoolean(
      parsedData.exploracao_comercial || 
      parsedData.explorada_comercialmente ||
      parsedData.commercial_exploitation ||
      parsedData.commercial_use ||
      false
    ),
    
    riscos_regulatorios_ou_eticos: parsedData.riscos_regulatorios_ou_eticos || 
                                  parsedData.riscos_regulatorios_eticos ||
                                  parsedData.regulatory_risks ||
                                  parsedData.risks ||
                                  parsedData.regulatory_ethical_risks ||
                                  'Não informado',
    
    data_vencimento_para_novo_produto: parsedData.data_vencimento_para_novo_produto || 
                                      parsedData.data_vencimento_patente_novo_produto || 
                                      parsedData.data_vencimento_para_novo_produto || 
                                      parsedData.new_product_expiration ||
                                      parsedData.new_patent_expiration ||
                                      'Não informado',
                                        
    alternativas_de_compostos_analogos: parseAlternatives(
      parsedData.alternativas_de_compostos_analogos ||
      parsedData.alternativas_compostos ||
      parsedData.alternative_compounds ||
      parsedData.alternatives ||
      parsedData.analogs ||
      []
    ),

    fonte_estimativa: parseSources(
      parsedData.fonte_estimativa ||
      parsedData.sources ||
      parsedData.estimation_sources ||
      []
    ),

    // Legacy fields for backward compatibility
    paises_registrados: parsePatentsByCountry(
      parsedData.patentes_por_pais || 
      parsedData.patents_by_country ||
      parsedData.paises_registrados ||
      parsedData.registered_countries ||
      []
    ).map(p => p.pais),

    riscos_regulatorios_eticos: [parsedData.riscos_regulatorios_ou_eticos || 
                                parsedData.riscos_regulatorios_eticos ||
                                'Não informado'].filter(r => r !== 'Não informado'),

    data_vencimento_patente_novo_produto: parsedData.data_vencimento_para_novo_produto || 
                                        parsedData.data_vencimento_patente_novo_produto || 
                                        null,

    alternativas_compostos: parseAlternatives(
      parsedData.alternativas_de_compostos_analogos ||
      parsedData.alternativas_compostos ||
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