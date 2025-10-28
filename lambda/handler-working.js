/**
 * Handler funcional para AWS Lambda sin dependencias externas
 * @param {Object} event - Evento de Lambda
 * @param {Object} context - Contexto de Lambda
 * @returns {Object} Respuesta de la función
 */
export const handler = async (event, context) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Decodificar el body si está en Base64
    const bodyString = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    
    const body = JSON.parse(bodyString);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { method, params } = body;

    let result;
    if (method === 'tools/list') {
      result = {
        tools: [
          {
            name: 'echo',
            description: 'Echo de vuelta el mensaje que se le pase',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'El mensaje a hacer echo',
                },
              },
              required: ['message'],
            },
          },
          {
            name: 'get_time',
            description: 'Obtiene la fecha y hora actual',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'github_get_user',
            description: 'Obtiene información del usuario autenticado de GitHub',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      if (name === 'echo') {
        result = {
          content: [
            {
              type: 'text',
              text: `Echo: ${args.message}`,
            },
          ],
        };
      } else if (name === 'get_time') {
        result = {
          content: [
            {
              type: 'text',
              text: `Hora actual: ${new Date().toISOString()}`,
            },
          ],
        };
      } else if (name === 'github_get_user') {
        // Simular respuesta de GitHub
        result = {
          content: [
            {
              type: 'text',
              text: `Usuario de GitHub: Usuario simulado (token configurado: ${process.env.GITHUB_TOKEN ? 'SÍ' : 'NO'})`,
            },
          ],
        };
      } else {
        throw new Error(`Herramienta desconocida: ${name}`);
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unknown method' }),
      };
    }

    const response = {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: body.id || 1,
        result: result
      }),
    };
    
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: event.body?.id || 1,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      }),
    };
  }
};
