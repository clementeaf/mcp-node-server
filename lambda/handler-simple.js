/**
 * Handler simplificado para AWS Lambda
 * @param {Object} event - Evento de Lambda
 * @param {Object} context - Contexto de Lambda
 * @returns {Object} Respuesta de la función
 */
exports.handler = async (event, context) => {
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
    const body = JSON.parse(event.body);
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: body.id || 1,
        result: result
      }),
    };
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
