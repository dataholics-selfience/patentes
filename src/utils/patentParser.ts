import { PatentResultType, PatentData, ChemicalData, ClinicalTrialsData, OrangeBookData, RegulationByCountry, ScientificEvidence, PatentByCountry, CommercialExplorationByCountry } from '../types';

// Função robusta para parse de resposta de patentes - PARSER COMPLETO E MELHORADO
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
            parsedData = JSON.parse(rawResponse[0].output);
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
      // Check if the string looks like conversational text instead of JSON
      const trimmedString = jsonString.trim();
      if (!trimmedString.startsWith('{') && !trimmedString.startsWith('[')) {
        console.warn('⚠️ Response appears to be conversational text, not JSON:', trimmedString.substring(0, 100));
        throw new Error('O servidor retornou uma resposta em texto ao invés de dados estruturados. Tente novamente em alguns instantes.');
      }
      
      // Remove markdown code block fences and clean up
      jsonString = jsonString
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      console.log('🧹 Cleaned JSON string:', jsonString);
      
      // Parse the actual patent data
      try {
        parsedData = JSON.parse(jsonString);
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
            throw new Error('Resposta inválida do servidor. O formato dos dados não pôde ser processado.');
          }
        } else {
          throw new Error('Nenhum dado estruturado válido encontrado na resposta do servidor.');
        }
      }
    }
    
    console.log('📊 Parsed data:', parsedData);
    
  } catch (error) {
    console.error('💥 Critical parsing error:', error);
    
    // Provide more specific error messages based on error type
    if (error instanceof SyntaxError) {
      throw new Error('O servidor retornou dados em formato inválido. Verifique sua conexão e tente novamente.');
    }
    
    if (error instanceof Error) {
      // Re-throw our custom error messages
      throw error;
    }
    
    throw new Error(`Erro ao processar resposta da consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  // Validate that we have some data
  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('Estrutura de dados de patente inválida recebida do servidor');
  }

  // Ensure we're working with the correct data structure
  // The response should have the main patent data structure
  if (!parsedData.patentes && !parsedData.quimica && !parsedData.ensaios_clinicos) {
    throw new Error('Estrutura de dados de patente incompleta - campos obrigatórios não encontrados');
  }

  // Parse patents data - FUNÇÃO MELHORADA
  const parsePatentsData = (patentsArray: any[]): PatentData[] => {
    if (!Array.isArray(patentsArray)) return [];
    
    return patentsArray.map(patent => {
      console.log('🔬 Parsing individual patent:', patent);
      
      // Parse patentes por país
      const parsePatentsByCountry = (patentsByCountry: any[]): PatentByCountry[] => {
        if (!Array.isArray(patentsByCountry)) return [];
        
        return patentsByCountry.map(country => ({
          pais: country.pais || 'Não informado',
          data_expiracao_primaria: country.data_expiracao_primaria || 'Não informado',
          data_expiracao_secundaria: country.data_expiracao_secundaria || 'Não informado',
          tipos: Array.isArray(country.tipos) ? country.tipos : []
        }));
      };

      // Parse exploração comercial por país
      const parseCommercialExplorationByCountry = (explorationByCountry: any[]): CommercialExplorationByCountry[] => {
        if (!Array.isArray(explorationByCountry)) return [];
        
        return explorationByCountry.map(exploration => ({
          pais: exploration.pais || 'Não informado',
          data_disponivel: exploration.data_disponivel || 'Não informado',
          tipos_liberados: Array.isArray(exploration.tipos_liberados) ? exploration.tipos_liberados : []
        }));
      };

      return {
        patente_vigente: Boolean(patent.patente_vigente),
        data_expiracao_patente_principal: patent.data_expiracao_patente_principal || 'Não informado',
        data_expiracao_patente_secundaria: patent.data_expiracao_patente_secundaria || 'Não informado',
        patentes_por_pais: parsePatentsByCountry(patent.patentes_por_pais || []),
        exploracao_comercial_por_pais: parseCommercialExplorationByCountry(patent.exploracao_comercial_por_pais || []),
        exploracao_comercial: Boolean(patent.exploracao_comercial),
        riscos_regulatorios_ou_eticos: patent.riscos_regulatorios_ou_eticos || 'Não informado',
        data_vencimento_para_novo_produto: patent.data_vencimento_para_novo_produto || 'Não informado',
        alternativas_de_compostos_analogos: Array.isArray(patent.alternativas_de_compostos_analogos)
          ? patent.alternativas_de_compostos_analogos 
          : Array.isArray(patent.alternativas_compostos) 
            ? patent.alternativas_compostos
            : Array.isArray(patent.alternativas_de_compostos)
              ? patent.alternativas_de_compostos
              : [],
        fonte_estimativa: Array.isArray(patent.fonte_estimativa) ? patent.fonte_estimativa : []
      };
    });
  };

  // Parse chemical data - FUNÇÃO MELHORADA
  const parseChemicalData = (quimica: any): ChemicalData => {
    console.log('🧪 Parsing chemical data:', quimica);

    if (!quimica || typeof quimica !== 'object') {
      return {
        iupac_name: 'Não informado',
        molecular_formula: 'Não informado',
        molecular_weight: 'Não informado',
        smiles: 'Não informado',
        inchi_key: 'Não informado',
        topological_polar_surface_area: 'Não informado',
        hydrogen_bond_acceptors: 'Não informado',
        hydrogen_bond_donors: 'Não informado',
        rotatable_bonds: 'Não informado'
      };
    }

    return {
      iupac_name: quimica.iupac_name || 'Não informado',
      molecular_formula: quimica.molecular_formula || 'Não informado',
      molecular_weight: quimica.molecular_weight ? quimica.molecular_weight.toString() : 'Não informado',
      smiles: quimica.smiles || 'Não informado',
      inchi_key: quimica.inchi_key || 'Não informado',
      topological_polar_surface_area: quimica.topological_polar_surface_area !== undefined ? quimica.topological_polar_surface_area.toString() : 'Não informado',
      hydrogen_bond_acceptors: quimica.hydrogen_bond_acceptors !== undefined ? quimica.hydrogen_bond_acceptors.toString() : 'Não informado',
      hydrogen_bond_donors: quimica.hydrogen_bond_donors !== undefined ? quimica.hydrogen_bond_donors.toString() : 'Não informado',
      rotatable_bonds: quimica.rotatable_bonds !== undefined ? quimica.rotatable_bonds.toString() : 'Não informado'
    };
  };

  // Parse clinical trials data - FUNÇÃO MELHORADA
  const parseClinicalTrialsData = (ensaios: any): ClinicalTrialsData => {
    console.log('🧬 Parsing clinical trials data:', ensaios);

    if (!ensaios || typeof ensaios !== 'object') {
      return {
        ativos: 'Não informado',
        fase_avancada: false,
        paises: [],
        principais_indicacoes_estudadas: []
      };
    }

    return {
      ativos: ensaios.ativos !== undefined ? ensaios.ativos.toString() : 'Não informado',
      fase_avancada: Boolean(ensaios.fase_avancada),
      paises: Array.isArray(ensaios.paises) ? ensaios.paises : [],
      principais_indicacoes_estudadas: Array.isArray(ensaios.principais_indicacoes_estudadas) ? ensaios.principais_indicacoes_estudadas : []
    };
  };

  // Parse Orange Book data - FUNÇÃO MELHORADA
  const parseOrangeBookData = (orangeBook: any): OrangeBookData => {
    console.log('📚 Parsing Orange Book data:', orangeBook);

    if (!orangeBook || typeof orangeBook !== 'object') {
      return {
        tem_generico: false,
        nda_number: 'Não informado',
        genericos_aprovados: [],
        data_ultimo_generico: 'Não informado'
      };
    }

    return {
      tem_generico: Boolean(orangeBook.tem_generico),
      nda_number: orangeBook.nda_number || 'Não informado',
      genericos_aprovados: Array.isArray(orangeBook.genericos_aprovados) ? orangeBook.genericos_aprovados : [],
      data_ultimo_generico: orangeBook.data_ultimo_generico || 'Não informado'
    };
  };

  // Parse regulation by country - FUNÇÃO MELHORADA
  const parseRegulationByCountry = (regulacao: any[]): RegulationByCountry[] => {
    console.log('🏛️ Parsing regulation data:', regulacao);
    if (!Array.isArray(regulacao)) return [];
    
    return regulacao.map(reg => ({
      pais: reg.pais || 'Não informado',
      agencia: reg.agencia || 'Não informado',
      classificacao: reg.classificacao || 'Não informado',
      restricoes: Array.isArray(reg.restricoes) ? reg.restricoes : [],
      facilidade_registro_generico: reg.facilidade_registro_generico || 'Não informado'
    }));
  };

  // Parse scientific evidence - FUNÇÃO MELHORADA
  const parseScientificEvidence = (evidencia: any[]): ScientificEvidence[] => {
    console.log('📄 Parsing scientific evidence:', evidencia);
    if (!Array.isArray(evidencia)) return [];
    
    return evidencia.map(ev => ({
      titulo: ev.titulo || 'Não informado',
      autores: Array.isArray(ev.autores) ? ev.autores : [],
      ano: ev.ano?.toString() || 'Não informado',
      resumo: ev.resumo || 'Não informado',
      doi: ev.doi || 'Não informado'
    }));
  };

  // Parse the complete data structure
  const patentesData = parsePatentsData(parsedData.patentes || []);
  const primeiraPatente = patentesData[0]; // Para compatibilidade com campos legacy

  console.log('📋 Parsed patents data:', patentesData);
  console.log('🔍 First patent for legacy compatibility:', primeiraPatente);

  // Build the new structured result - RESULTADO COMPLETO
  const resultado: PatentResultType = {
    // Novos campos estruturados
    patentes: patentesData,
    quimica: parseChemicalData(parsedData.quimica),
    ensaios_clinicos: parseClinicalTrialsData(parsedData.ensaios_clinicos),
    orange_book: parseOrangeBookData(parsedData.orange_book),
    regulacao_por_pais: parseRegulationByCountry(parsedData.regulacao_por_pais || []),
    evidencia_cientifica_recente: parseScientificEvidence(parsedData.evidencia_cientifica_recente || []),
    estrategias_de_formulacao: Array.isArray(parsedData.estrategias_de_formulacao) ? parsedData.estrategias_de_formulacao : [],

    // Legacy compatibility - usar dados da primeira patente se disponível
    substancia: 'Produto consultado',
    patente_vigente: primeiraPatente?.patente_vigente || false,
    data_expiracao_patente_principal: primeiraPatente?.data_expiracao_patente_principal || 'Não informado',
    exploracao_comercial: primeiraPatente?.exploracao_comercial || false,
    riscos_regulatorios_ou_eticos: primeiraPatente?.riscos_regulatorios_ou_eticos || 'Não informado',
    data_vencimento_para_novo_produto: primeiraPatente?.data_vencimento_para_novo_produto || 'Não informado',
    alternativas_de_compostos_analogos: primeiraPatente?.alternativas_de_compostos_analogos || 
      parsedData.alternativas_de_compostos_analogos || 
      parsedData.alternativas_compostos || 
      parsedData.alternativas_de_compostos || 
      [],
    fonte_estimativa: primeiraPatente?.fonte_estimativa || [],
    patentes_por_pais: primeiraPatente?.patentes_por_pais || [],
    exploracao_comercial_por_pais: primeiraPatente?.exploracao_comercial_por_pais || [],
    
    // Campos legacy derivados
    paises_registrados: primeiraPatente?.patentes_por_pais?.map((p: any) => p.pais) || [],
    riscos_regulatorios_eticos: primeiraPatente?.riscos_regulatorios_ou_eticos ? [primeiraPatente.riscos_regulatorios_ou_eticos] : [],
    data_vencimento_patente_novo_produto: primeiraPatente?.data_vencimento_para_novo_produto || null,
    alternativas_compostos: primeiraPatente?.alternativas_de_compostos_analogos || 
      parsedData.alternativas_de_compostos_analogos || 
      parsedData.alternativas_compostos || 
      parsedData.alternativas_de_compostos || 
      []
  };
  
  console.log('✅ Final resultado completo:', resultado);
  console.log('🌍 Exploração comercial por país:', resultado.exploracao_comercial_por_pais);
  console.log('⚠️ Riscos regulatórios:', resultado.riscos_regulatorios_ou_eticos);
  console.log('🆕 Data vencimento novo produto:', resultado.data_vencimento_para_novo_produto);
  
  return resultado;
};