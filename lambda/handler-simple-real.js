/**
 * Handler simplificado con herramientas reales de GitHub
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
          // Herramientas básicas
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
          // Herramientas de GitHub
          {
            name: 'github_get_user',
            description: 'Obtiene información del usuario autenticado de GitHub',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'github_get_repos',
            description: 'Obtiene los repositorios del usuario autenticado',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'github_get_repo',
            description: 'Obtiene información de un repositorio específico',
            inputSchema: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'Propietario del repositorio',
                },
                repo: {
                  type: 'string',
                  description: 'Nombre del repositorio',
                },
              },
              required: ['owner', 'repo'],
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
        // Usar fetch para llamar a GitHub API directamente
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const user = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Usuario de GitHub:\n${JSON.stringify(user, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repos') {
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repos = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Repositorios del usuario:\n${JSON.stringify(repos, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repo') {
        const response = await fetch(`https://api.github.com/repos/${args.owner}/${args.repo}`, {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repo = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Información del repositorio:\n${JSON.stringify(repo, null, 2)}`,
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
