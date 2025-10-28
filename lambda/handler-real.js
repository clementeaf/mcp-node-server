/**
 * Handler real para AWS Lambda con herramientas de GitHub y GitLab
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
          {
            name: 'github_get_issues',
            description: 'Obtiene los issues de un repositorio',
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
                state: {
                  type: 'string',
                  description: 'Estado de los issues (open, closed, all)',
                  enum: ['open', 'closed', 'all'],
                },
              },
              required: ['owner', 'repo'],
            },
          },
          {
            name: 'github_create_issue',
            description: 'Crea un nuevo issue en un repositorio',
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
                title: {
                  type: 'string',
                  description: 'Título del issue',
                },
                body: {
                  type: 'string',
                  description: 'Descripción del issue',
                },
                labels: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Etiquetas para el issue',
                },
              },
              required: ['owner', 'repo', 'title'],
            },
          },
          {
            name: 'github_get_pull_requests',
            description: 'Obtiene los pull requests de un repositorio',
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
                state: {
                  type: 'string',
                  description: 'Estado de los PRs (open, closed, all)',
                  enum: ['open', 'closed', 'all'],
                },
              },
              required: ['owner', 'repo'],
            },
          },
          {
            name: 'github_get_commits',
            description: 'Obtiene los commits de un repositorio',
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
                branch: {
                  type: 'string',
                  description: 'Rama del repositorio (default: main)',
                },
              },
              required: ['owner', 'repo'],
            },
          },
          {
            name: 'github_get_file_content',
            description: 'Obtiene el contenido de un archivo en un repositorio',
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
                path: {
                  type: 'string',
                  description: 'Ruta del archivo',
                },
                branch: {
                  type: 'string',
                  description: 'Rama del repositorio (default: main)',
                },
              },
              required: ['owner', 'repo', 'path'],
            },
          },
          // Herramientas de GitLab
          {
            name: 'gitlab_get_user',
            description: 'Obtiene información del usuario autenticado de GitLab',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'gitlab_get_projects',
            description: 'Obtiene los proyectos del usuario autenticado de GitLab',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'gitlab_get_project',
            description: 'Obtiene información de un proyecto específico de GitLab',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'ID del proyecto de GitLab',
                },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'gitlab_get_issues',
            description: 'Obtiene los issues de un proyecto de GitLab',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  description: 'ID del proyecto de GitLab',
                },
                state: {
                  type: 'string',
                  description: 'Estado de los issues (opened, closed, all)',
                  enum: ['opened', 'closed', 'all'],
                },
              },
              required: ['projectId'],
            },
          },
        ],
      };
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      // Importar funciones reales de GitHub
      const { 
        getCurrentUser: getGitHubUser,
        getUserRepos,
        getRepo,
        getRepoIssues,
        createIssue,
        getPullRequests,
        getCommits,
        getFileContent
      } = await import('../dist/github.js');
      
      // Importar funciones de GitLab (opcional)
      let gitlabFunctions = null;
      if (process.env.GITLAB_TOKEN && process.env.GITLAB_TOKEN !== 'dummy_token') {
        try {
          gitlabFunctions = await import('../dist/gitlab.js');
        } catch (error) {
          console.warn('GitLab no disponible:', error.message);
        }
      }
      
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
        const user = await getGitHubUser();
        result = {
          content: [
            {
              type: 'text',
              text: `Usuario de GitHub:\n${JSON.stringify(user, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repos') {
        const repos = await getUserRepos();
        result = {
          content: [
            {
              type: 'text',
              text: `Repositorios del usuario:\n${JSON.stringify(repos, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repo') {
        const repo = await getRepo(args.owner, args.repo);
        result = {
          content: [
            {
              type: 'text',
              text: `Información del repositorio:\n${JSON.stringify(repo, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_issues') {
        const state = args.state || 'open';
        const issues = await getRepoIssues(args.owner, args.repo, state);
        result = {
          content: [
            {
              type: 'text',
              text: `Issues del repositorio:\n${JSON.stringify(issues, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_create_issue') {
        const newIssue = await createIssue(
          args.owner,
          args.repo,
          args.title,
          args.body,
          args.labels
        );
        result = {
          content: [
            {
              type: 'text',
              text: `Issue creado:\n${JSON.stringify(newIssue, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_pull_requests') {
        const prState = args.state || 'open';
        const pullRequests = await getPullRequests(args.owner, args.repo, prState);
        result = {
          content: [
            {
              type: 'text',
              text: `Pull Requests del repositorio:\n${JSON.stringify(pullRequests, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_commits') {
        const branch = args.branch || 'main';
        const commits = await getCommits(args.owner, args.repo, branch);
        result = {
          content: [
            {
              type: 'text',
              text: `Commits del repositorio:\n${JSON.stringify(commits, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_file_content') {
        const fileBranch = args.branch || 'main';
        const fileContent = await getFileContent(args.owner, args.repo, args.path, fileBranch);
        result = {
          content: [
            {
              type: 'text',
              text: `Contenido del archivo:\n${JSON.stringify(fileContent, null, 2)}`,
            },
          ],
        };
      } else if (name === 'gitlab_get_user') {
        if (!gitlabFunctions) {
          throw new Error('GitLab no está configurado. Configura GITLAB_TOKEN para usar herramientas de GitLab.');
        }
        const gitlabUser = await gitlabFunctions.getCurrentUser();
        result = {
          content: [
            {
              type: 'text',
              text: `Usuario de GitLab:\n${JSON.stringify(gitlabUser, null, 2)}`,
            },
          ],
        };
      } else if (name === 'gitlab_get_projects') {
        if (!gitlabFunctions) {
          throw new Error('GitLab no está configurado. Configura GITLAB_TOKEN para usar herramientas de GitLab.');
        }
        const gitlabProjects = await gitlabFunctions.getUserProjects();
        result = {
          content: [
            {
              type: 'text',
              text: `Proyectos de GitLab:\n${JSON.stringify(gitlabProjects, null, 2)}`,
            },
          ],
        };
      } else if (name === 'gitlab_get_project') {
        if (!gitlabFunctions) {
          throw new Error('GitLab no está configurado. Configura GITLAB_TOKEN para usar herramientas de GitLab.');
        }
        const gitlabProject = await gitlabFunctions.getProject(args.projectId);
        result = {
          content: [
            {
              type: 'text',
              text: `Información del proyecto:\n${JSON.stringify(gitlabProject, null, 2)}`,
            },
          ],
        };
      } else if (name === 'gitlab_get_issues') {
        if (!gitlabFunctions) {
          throw new Error('GitLab no está configurado. Configura GITLAB_TOKEN para usar herramientas de GitLab.');
        }
        const gitlabState = args.state || 'opened';
        const gitlabIssues = await gitlabFunctions.getProjectIssues(args.projectId, gitlabState);
        result = {
          content: [
            {
              type: 'text',
              text: `Issues del proyecto:\n${JSON.stringify(gitlabIssues, null, 2)}`,
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
