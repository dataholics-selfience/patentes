import { PatentResultType, PatentByCountry, CommercialExplorationByCountry } from '../types';

// Função robusta para parse de resposta de patentes
export const parsePatentResponse = (rawResponse: any): PatentResultType => {
  let jsonString = '';
  let parsedData: any = null;
  
  try {
    console.log('🔍 Iniciando parse da resposta do webhook:', typeof rawResponse);
    
    // Handle nested array structure
    if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      if (rawResponse[0].output) {
        if (typeof rawResponse[0].output === 'string') {
          const cleanOutput = rawResponse[0].output
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          
          try {
            parsedData = JSON.parse(cleanOutput);
          } catch {
            jsonString = cleanOutput;
          }
        } else {
          parsedData = rawResponse[0].output;
        }
      } else {
        parsedData = rawResponse[0];
      }
    } else if (typeof rawResponse === 'string') {
      jsonString = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      parsedData = rawResponse;
    }
    
    // If we still have a string, parse it
    if (jsonString && !parsedData) {
      const trimmedString = jsonString.trim();
      if (!trimmedString.startsWith('{') && !trimmedString.startsWith('[')) {
        throw new Error('O servidor retornou uma resposta em texto ao invés de dados estruturados.');
      }
      
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (altError) {
            throw new Error('Resposta inválida do servidor.');
          }
        } else {
          throw new Error('Nenhum dado estruturado válido encontrado na resposta.');
        }
      }
    }
    
    console.log('✅ Dados parseados com sucesso:', parsedData);
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Webhook retornou dados em formato inválido');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(`Erro ao processar resposta do webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  if (!parsedData || typeof parsedData !== 'object') {
    throw new Error('Estrutura de dados de patente inválida recebida do servidor');
  }

  // Parse patents data
  const parsePatentsData = (patentsArray: any[]): any[] => {
    if (!Array.isArray(patentsArray)) return [];
    
    return patentsArray.map(patent => {
      const parsePatentsByCountry = (patentsByCountry: any[]): PatentByCountry[] => {
        if (!Array.isArray(patentsByCountry)) return [];
        
        return patentsByCountry.map(country => ({
          pais: country.pais || 'Não informado',
          numero: country.numero || country.numero_patente || 'Não informado',
          status: country.status || 'Não informado',
          data_expiracao_primaria: country.data_expiracao || country.data_expiracao_primaria || 'Não informado',
          data_expiracao: country.data_expiracao || country.data_expiracao_primaria || 'Não informado',
          data_expiracao_secundaria: country.data_expiracao_secundaria || 'Não informado',
          tipos: Array.isArray(country.tipos) ? country.tipos : (country.tipos ? [country.tipos] : []),
          tipo: Array.isArray(country.tipo) ? country.tipo : (country.tipo ? [country.tipo] : []),
          fonte: country.fonte || 'Não informado',
          link: country.link || ''
        }));
      };

      const parseCommercialExplorationByCountry = (explorationByCountry: any[]): CommercialExplorationByCountry[] => {
        if (!Array.isArray(explorationByCountry)) return [];
        
        return explorationByCountry.map(exploration => ({
          pais: exploration.pais || 'Não informado',
          data_disponivel: exploration.data_disponivel || 'Não informado',
          tipos_liberados: Array.isArray(exploration.tipos_liberados) ? exploration.tipos_liberados : []
        }));
      };

      return {
        numero_patente: patent.numero_patente || 'Não informado',
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
          : [],
        fonte_estimativa: Array.isArray(patent.fonte_estimativa) ? patent.fonte_estimativa : []
      };
    });
  };

  // Build the result
  const patentesData = parsePatentsData(parsedData.patentes || []);
  const primeiraPatente = patentesData[0];

  const resultado: PatentResultType = {
    substancia: parsedData.produto || parsedData.nome_comercial || 'Produto consultado',
    nome_comercial: parsedData.nome_comercial || '',
    patente_vigente: primeiraPatente?.patente_vigente || false,
    data_expiracao_patente_principal: primeiraPatente?.data_expiracao_patente_principal || 'Não informado',
    exploracao_comercial: primeiraPatente?.exploracao_comercial || false,
    riscos_regulatorios_ou_eticos: primeiraPatente?.riscos_regulatorios_ou_eticos || 'Não informado',
    data_vencimento_para_novo_produto: primeiraPatente?.data_vencimento_para_novo_produto || 'Não informado',
    alternativas_de_compostos_analogos: primeiraPatente?.alternativas_de_compostos_analogos || [],
    fonte_estimativa: primeiraPatente?.fonte_estimativa || [],
    patentes_por_pais: primeiraPatente?.patentes_por_pais || [],
    exploracao_comercial_por_pais: primeiraPatente?.exploracao_comercial_por_pais || [],
    paises_registrados: primeiraPatente?.patentes_por_pais?.map((p: any) => p.pais) || [],
    riscos_regulatorios_eticos: primeiraPatente?.riscos_regulatorios_ou_eticos ? [primeiraPatente.riscos_regulatorios_ou_eticos] : [],
    data_vencimento_patente_novo_produto: primeiraPatente?.data_vencimento_para_novo_produto || null,
    alternativas_compostos: primeiraPatente?.alternativas_de_compostos_analogos || []
  };
  
  console.log('🎯 Resultado final do parse:', resultado);
  return resultado;
};