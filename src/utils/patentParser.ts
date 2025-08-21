// Check if response is dashboard data
export const isDashboardData = (rawResponse: any): boolean => {
  try {
    let parsedData: any = null;
    
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
            return false;
          }
        } else {
          parsedData = rawResponse[0].output;
        }
      }
    } else if (typeof rawResponse === 'string') {
      const cleanString = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      try {
        parsedData = JSON.parse(cleanString);
      } catch {
        return false;
      }
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      parsedData = rawResponse;
    }
    
    return !!(parsedData?.produto_proposto || parsedData?.score_oportunidade?.valor || parsedData?.consulta?.cliente);
  } catch {
    return false;
  }
};

// Parse dashboard data
export const parseDashboardData = (rawResponse: any): any => {
  try {
    let parsedData: any = null;
    
    if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      if (rawResponse[0].output) {
        if (typeof rawResponse[0].output === 'string') {
          const cleanOutput = rawResponse[0].output
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          parsedData = JSON.parse(cleanOutput);
        } else {
          parsedData = rawResponse[0].output;
        }
      }
    } else if (typeof rawResponse === 'string') {
      const cleanString = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedData = JSON.parse(cleanString);
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      parsedData = rawResponse;
    }
    
    return parsedData;
  } catch (error) {
    throw new Error('Erro ao processar dados do dashboard');
  }
};