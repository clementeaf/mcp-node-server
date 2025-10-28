const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { 
  getCurrentUser,
  getUserRepos,
  getRepo,
  getRepoIssues,
  createIssue,
  getPullRequests,
  createPullRequest,
  getCommits,
  getFileContent,
  searchRepos,
  getReleases,
  getRepoStats,
  getUser,
  getUserReposByUsername
} = require('../dist/github.js');

const {
  getCurrentUser: getGitLabUser,
  getUserProjects: getGitLabProjects,
  getProject,
  getProjectIssues,
  createIssue: createGitLabIssue,
  getMergeRequests,
  createMergeRequest
} = require('../dist/gitlab.js');

// Crear el servidor MCP
const server = new Server(
  {
    name: 'mcp-dev-tools-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Definir las herramientas disponibles
const tools = [
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
    name: 'github_create_pull_request',
    description: 'Crea un nuevo pull request',
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
          description: 'Título del pull request',
        },
        head: {
          type: 'string',
          description: 'Rama de origen',
        },
        base: {
          type: 'string',
          description: 'Rama de destino',
        },
        body: {
          type: 'string',
          description: 'Descripción del pull request',
        },
      },
      required: ['owner', 'repo', 'title', 'head', 'base'],
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
  {
    name: 'github_search_repos',
    description: 'Busca repositorios en GitHub',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta de búsqueda',
        },
        sort: {
          type: 'string',
          description: 'Criterio de ordenamiento',
          enum: ['stars', 'forks', 'updated'],
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'github_get_releases',
    description: 'Obtiene los releases de un repositorio',
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
    name: 'github_get_repo_stats',
    description: 'Obtiene estadísticas de un repositorio',
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
    name: 'github_get_user_by_username',
    description: 'Obtiene información de un usuario específico por nombre de usuario',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Nombre de usuario de GitHub',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'github_get_user_repos',
    description: 'Obtiene los repositorios de un usuario específico',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Nombre de usuario de GitHub',
        },
      },
      required: ['username'],
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
  {
    name: 'gitlab_create_issue',
    description: 'Crea un nuevo issue en un proyecto de GitLab',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto de GitLab',
        },
        title: {
          type: 'string',
          description: 'Título del issue',
        },
        description: {
          type: 'string',
          description: 'Descripción del issue',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Etiquetas para el issue',
        },
      },
      required: ['projectId', 'title'],
    },
  },
  {
    name: 'gitlab_get_merge_requests',
    description: 'Obtiene los merge requests de un proyecto de GitLab',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto de GitLab',
        },
        state: {
          type: 'string',
          description: 'Estado de los MRs (opened, closed, merged, all)',
          enum: ['opened', 'closed', 'merged', 'all'],
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'gitlab_create_merge_request',
    description: 'Crea un nuevo merge request en GitLab',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto de GitLab',
        },
        title: {
          type: 'string',
          description: 'Título del merge request',
        },
        sourceBranch: {
          type: 'string',
          description: 'Rama de origen',
        },
        targetBranch: {
          type: 'string',
          description: 'Rama de destino',
        },
        description: {
          type: 'string',
          description: 'Descripción del merge request',
        },
      },
      required: ['projectId', 'title', 'sourceBranch', 'targetBranch'],
    },
  },
];

// Manejar listado de herramientas
server.setRequestHandler('tools/list', async () => {
  return {
    tools,
  };
});

// Manejar llamadas a herramientas
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'echo':
        if (!args || typeof args !== 'object' || !('message' in args)) {
          throw new Error('Parámetro "message" requerido para la herramienta echo');
        }
        return {
          content: [
            {
              type: 'text',
              text: `Echo: ${args['message']}`,
            },
          ],
        };

      case 'get_time':
        return {
          content: [
            {
              type: 'text',
              text: `Hora actual: ${new Date().toISOString()}`,
            },
          ],
        };

      // Herramientas de GitHub
      case 'github_get_user':
        const user = await getCurrentUser();
        return {
          content: [
            {
              type: 'text',
              text: `Usuario de GitHub:\n${JSON.stringify(user, null, 2)}`,
            },
          ],
        };

      case 'github_get_repos':
        const repos = await getUserRepos();
        return {
          content: [
            {
              type: 'text',
              text: `Repositorios del usuario:\n${JSON.stringify(repos, null, 2)}`,
            },
          ],
        };

      case 'github_get_repo':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_repo');
        }
        const repo = await getRepo(args['owner'], args['repo']);
        return {
          content: [
            {
              type: 'text',
              text: `Información del repositorio:\n${JSON.stringify(repo, null, 2)}`,
            },
          ],
        };

      case 'github_get_issues':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_issues');
        }
        const state = args['state'] || 'open';
        const issues = await getRepoIssues(args['owner'], args['repo'], state);
        return {
          content: [
            {
              type: 'text',
              text: `Issues del repositorio:\n${JSON.stringify(issues, null, 2)}`,
            },
          ],
        };

      case 'github_create_issue':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args) || !('title' in args)) {
          throw new Error('Parámetros "owner", "repo" y "title" requeridos para github_create_issue');
        }
        const newIssue = await createIssue(
          args['owner'],
          args['repo'],
          args['title'],
          args['body'],
          args['labels']
        );
        return {
          content: [
            {
              type: 'text',
              text: `Issue creado:\n${JSON.stringify(newIssue, null, 2)}`,
            },
          ],
        };

      case 'github_get_pull_requests':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_pull_requests');
        }
        const prState = args['state'] || 'open';
        const pullRequests = await getPullRequests(args['owner'], args['repo'], prState);
        return {
          content: [
            {
              type: 'text',
              text: `Pull Requests del repositorio:\n${JSON.stringify(pullRequests, null, 2)}`,
            },
          ],
        };

      case 'github_create_pull_request':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args) || !('title' in args) || !('head' in args) || !('base' in args)) {
          throw new Error('Parámetros "owner", "repo", "title", "head" y "base" requeridos para github_create_pull_request');
        }
        const newPR = await createPullRequest(
          args['owner'],
          args['repo'],
          args['title'],
          args['head'],
          args['base'],
          args['body']
        );
        return {
          content: [
            {
              type: 'text',
              text: `Pull Request creado:\n${JSON.stringify(newPR, null, 2)}`,
            },
          ],
        };

      case 'github_get_commits':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_commits');
        }
        const branch = args['branch'] || 'main';
        const commits = await getCommits(args['owner'], args['repo'], branch);
        return {
          content: [
            {
              type: 'text',
              text: `Commits del repositorio:\n${JSON.stringify(commits, null, 2)}`,
            },
          ],
        };

      case 'github_get_file_content':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args) || !('path' in args)) {
          throw new Error('Parámetros "owner", "repo" y "path" requeridos para github_get_file_content');
        }
        const fileBranch = args['branch'] || 'main';
        const fileContent = await getFileContent(args['owner'], args['repo'], args['path'], fileBranch);
        return {
          content: [
            {
              type: 'text',
              text: `Contenido del archivo:\n${JSON.stringify(fileContent, null, 2)}`,
            },
          ],
        };

      case 'github_search_repos':
        if (!args || typeof args !== 'object' || !('query' in args)) {
          throw new Error('Parámetro "query" requerido para github_search_repos');
        }
        const sort = args['sort'] || 'stars';
        const searchResults = await searchRepos(args['query'], sort);
        return {
          content: [
            {
              type: 'text',
              text: `Resultados de búsqueda:\n${JSON.stringify(searchResults, null, 2)}`,
            },
          ],
        };

      case 'github_get_releases':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_releases');
        }
        const releases = await getReleases(args['owner'], args['repo']);
        return {
          content: [
            {
              type: 'text',
              text: `Releases del repositorio:\n${JSON.stringify(releases, null, 2)}`,
            },
          ],
        };

      case 'github_get_repo_stats':
        if (!args || typeof args !== 'object' || !('owner' in args) || !('repo' in args)) {
          throw new Error('Parámetros "owner" y "repo" requeridos para github_get_repo_stats');
        }
        const stats = await getRepoStats(args['owner'], args['repo']);
        return {
          content: [
            {
              type: 'text',
              text: `Estadísticas del repositorio:\n${JSON.stringify(stats, null, 2)}`,
            },
          ],
        };

      case 'github_get_user_by_username':
        if (!args || typeof args !== 'object' || !('username' in args)) {
          throw new Error('Parámetro "username" requerido para github_get_user_by_username');
        }
        const userInfo = await getUser(args['username']);
        return {
          content: [
            {
              type: 'text',
              text: `Información del usuario:\n${JSON.stringify(userInfo, null, 2)}`,
            },
          ],
        };

      case 'github_get_user_repos':
        if (!args || typeof args !== 'object' || !('username' in args)) {
          throw new Error('Parámetro "username" requerido para github_get_user_repos');
        }
        const userRepos = await getUserReposByUsername(args['username']);
        return {
          content: [
            {
              type: 'text',
              text: `Repositorios del usuario:\n${JSON.stringify(userRepos, null, 2)}`,
            },
          ],
        };

      // Herramientas de GitLab
      case 'gitlab_get_user':
        const gitlabUser = await getGitLabUser();
        return {
          content: [
            {
              type: 'text',
              text: `Usuario de GitLab:\n${JSON.stringify(gitlabUser, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_projects':
        const gitlabProjects = await getGitLabProjects();
        return {
          content: [
            {
              type: 'text',
              text: `Proyectos de GitLab:\n${JSON.stringify(gitlabProjects, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_project':
        if (!args || typeof args !== 'object' || !('projectId' in args)) {
          throw new Error('Parámetro "projectId" requerido para gitlab_get_project');
        }
        const gitlabProject = await getProject(args['projectId']);
        return {
          content: [
            {
              type: 'text',
              text: `Información del proyecto:\n${JSON.stringify(gitlabProject, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_issues':
        if (!args || typeof args !== 'object' || !('projectId' in args)) {
          throw new Error('Parámetro "projectId" requerido para gitlab_get_issues');
        }
        const gitlabState = args['state'] || 'opened';
        const gitlabIssues = await getProjectIssues(args['projectId'], gitlabState);
        return {
          content: [
            {
              type: 'text',
              text: `Issues del proyecto:\n${JSON.stringify(gitlabIssues, null, 2)}`,
            },
          ],
        };

      case 'gitlab_create_issue':
        if (!args || typeof args !== 'object' || !('projectId' in args) || !('title' in args)) {
          throw new Error('Parámetros "projectId" y "title" requeridos para gitlab_create_issue');
        }
        const newGitLabIssue = await createGitLabIssue(
          args['projectId'],
          args['title'],
          args['description'],
          args['labels']
        );
        return {
          content: [
            {
              type: 'text',
              text: `Issue de GitLab creado:\n${JSON.stringify(newGitLabIssue, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_merge_requests':
        if (!args || typeof args !== 'object' || !('projectId' in args)) {
          throw new Error('Parámetro "projectId" requerido para gitlab_get_merge_requests');
        }
        const mrState = args['state'] || 'opened';
        const mergeRequests = await getMergeRequests(args['projectId'], mrState);
        return {
          content: [
            {
              type: 'text',
              text: `Merge Requests del proyecto:\n${JSON.stringify(mergeRequests, null, 2)}`,
            },
          ],
        };

      case 'gitlab_create_merge_request':
        if (!args || typeof args !== 'object' || !('projectId' in args) || !('title' in args) || !('sourceBranch' in args) || !('targetBranch' in args)) {
          throw new Error('Parámetros "projectId", "title", "sourceBranch" y "targetBranch" requeridos para gitlab_create_merge_request');
        }
        const newMR = await createMergeRequest(
          args['projectId'],
          args['title'],
          args['sourceBranch'],
          args['targetBranch'],
          args['description']
        );
        return {
          content: [
            {
              type: 'text',
              text: `Merge Request creado:\n${JSON.stringify(newMR, null, 2)}`,
            },
          ],
        };

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error ejecutando ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Handler principal de Lambda
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
      result = await server.requestHandler('tools/list', {});
    } else if (method === 'tools/call') {
      result = await server.requestHandler('tools/call', params);
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
