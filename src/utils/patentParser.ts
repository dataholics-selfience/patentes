import { PatentResultType, PatentData, ChemicalData, ClinicalTrialsData, OrangeBookData, RegulationByCountry, ScientificEvidence, PatentByCountry, CommercialExplorationByCountry } from '../types';

// Função robusta para parse de resposta de patentes - NOVO FORMATO ESTRUTURADO
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

  // Parse patents data
  const parsePatentsData = (patentsArray: any[]): PatentData[] => {
    if (!Array.isArray(patentsArray)) return [];
    
    return patentsArray.map(patent => ({
      patente_vigente: Boolean(patent.patente_vigente),
      data_expiracao_patente_principal: patent.data_expiracao_patente_principal || 'Não informado',
      data_expiracao_patente_secundaria: patent.data_expiracao_patente_secundaria || 'Não informado',
      patentes_por_pais: Array.isArray(patent.patentes_por_pais) ? patent.patentes_por_pais : [],
      exploracao_comercial_por_pais: Array.isArray(patent.exploracao_comercial_por_pais) ? patent.exploracao_comercial_por_pais : [],
      exploracao_comercial: Boolean(patent.exploracao_comercial),
      riscos_regulatorios_ou_eticos: patent.riscos_regulatorios_ou_eticos || 'Não informado',
      data_vencimento_para_novo_produto: patent.data_vencimento_para_novo_produto || 'Não informado',
      alternativas_de_compostos_analogos: Array.isArray(patent.alternativas_de_compostos_analogos) ? patent.alternativas_de_compostos_analogos : [],
      fonte_estimativa: Array.isArray(patent.fonte_estimativa) ? patent.fonte_estimativa : []
    }));
  };

  // Parse chemical data
  const parseChemicalData = (quimica: any): ChemicalData => {
    console.log('🧪 Parsing chemical data:', quimica);

    return {
      iupac_name: (quimica && quimica.iupac_name) ? quimica.iupac_name : 'Não informado',
      molecular_formula: (quimica && quimica.molecular_formula) ? quimica.molecular_formula : 'Não informado',
      molecular_weight: (quimica && quimica.molecular_weight) ? quimica.molecular_weight.toString() : 'Não informado',
      smiles: (quimica && quimica.smiles) ? quimica.smiles : 'Não informado',
      inchi_key: (quimica && quimica.inchi_key) ? quimica.inchi_key : 'Não informado',
      topological_polar_surface_area: (quimica && quimica.topological_polar_surface_area !== undefined) ? quimica.topological_polar_surface_area.toString() : 'Não informado',
      hydrogen_bond_acceptors: (quimica && quimica.hydrogen_bond_acceptors !== undefined) ? quimica.hydrogen_bond_acceptors.toString() : 'Não informado',
      hydrogen_bond_donors: (quimica && quimica.hydrogen_bond_donors !== undefined) ? quimica.hydrogen_bond_donors.toString() : 'Não informado',
      rotatable_bonds: (quimica && quimica.rotatable_bonds !== undefined) ? quimica.rotatable_bonds.toString() : 'Não informado'
    };
  };

  // Parse clinical trials data
  const parseClinicalTrialsData = (ensaios: any): ClinicalTrialsData => {
    console.log('🧬 Parsing clinical trials data:', ensaios);

    return {
      ativos: (ensaios && ensaios.ativos !== undefined) ? ensaios.ativos.toString() : 'Não informado',
      fase_avancada: (ensaios && ensaios.fase_avancada !== undefined) ? Boolean(ensaios.fase_avancada) : false,
      paises: (ensaios && Array.isArray(ensaios.paises)) ? ensaios.paises : [],
      principais_indicacoes_estudadas: (ensaios && Array.isArray(ensaios.principais_indicacoes_estudadas)) ? ensaios.principais_indicacoes_estudadas : []
    };
  };

  // Parse Orange Book data
  const parseOrangeBookData = (orangeBook: any): OrangeBookData => {
    console.log('📚 Parsing Orange Book data:', orangeBook);

    return {
      tem_generico: (orangeBook && orangeBook.tem_generico !== undefined) ? Boolean(orangeBook.tem_generico) : false,
      nda_number: (orangeBook && orangeBook.nda_number) ? orangeBook.nda_number : 'Não informado',
      genericos_aprovados: (orangeBook && Array.isArray(orangeBook.genericos_aprovados)) ? orangeBook.genericos_aprovados : [],
      data_ultimo_generico: (orangeBook && orangeBook.data_ultimo_generico) ? orangeBook.data_ultimo_generico : 'Não informado'
    };
  };

  // Parse regulation by country
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

  // Parse scientific evidence
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

  // Build the new structured result
  const resultado: PatentResultType = {
    patentes: parsePatentsData(parsedData.patentes || []),
    quimica: parseChemicalData(parsedData.quimica),
    ensaios_clinicos: parseClinicalTrialsData(parsedData.ensaios_clinicos),
    orange_book: parseOrangeBookData(parsedData.orange_book),
    regulacao_por_pais: parseRegulationByCountry(parsedData.regulacao_por_pais || []),
    evidencia_cientifica_recente: parseScientificEvidence(parsedData.evidencia_cientifica_recente || []),
    estrategias_de_formulacao: Array.isArray(parsedData.estrategias_de_formulacao) ? parsedData.estrategias_de_formulacao : [],

    // Legacy compatibility - use first patent data if available
    substancia: 'Produto consultado',
    patente_vigente: parsedData.patentes?.[0]?.patente_vigente || false,
    data_expiracao_patente_principal: parsedData.patentes?.[0]?.data_expiracao_patente_principal || 'Não informado',
    exploracao_comercial: parsedData.patentes?.[0]?.exploracao_comercial || false,
    riscos_regulatorios_ou_eticos: parsedData.patentes?.[0]?.riscos_regulatorios_ou_eticos || 'Não informado',
    data_vencimento_para_novo_produto: parsedData.patentes?.[0]?.data_vencimento_para_novo_produto || 'Não informado',
    alternativas_de_compostos_analogos: parsedData.patentes?.[0]?.alternativas_de_compostos_analogos || [],
    fonte_estimativa: parsedData.patentes?.[0]?.fonte_estimativa || [],
    patentes_por_pais: parsedData.patentes?.[0]?.patentes_por_pais || [],
    exploracao_comercial_por_pais: parsedData.patentes?.[0]?.exploracao_comercial_por_pais || [],
    paises_registrados: parsedData.patentes?.[0]?.patentes_por_pais?.map((p: any) => p.pais) || [],
    riscos_regulatorios_eticos: parsedData.patentes?.[0]?.riscos_regulatorios_ou_eticos ? [parsedData.patentes[0].riscos_regulatorios_ou_eticos] : [],
    data_vencimento_patente_novo_produto: parsedData.patentes?.[0]?.data_vencimento_para_novo_produto || null,
    alternativas_compostos: parsedData.patentes?.[0]?.alternativas_de_compostos_analogos || []
  };
  
  console.log('✅ Final resultado:', resultado);
  
  return resultado;
};