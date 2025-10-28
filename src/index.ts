#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getCurrentUser as getGitHubUser,
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
} from './github.js';

import {
  getCurrentUser as getGitLabUser,
  getUserProjects as getGitLabProjects,
  getProject,
  getProjectIssues,
  createIssue as createGitLabIssue,
  getMergeRequests,
  createMergeRequest
} from './gitlab.js';


// Definir las herramientas disponibles
const tools: Tool[] = [
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
    description: 'Obtiene los proyectos del usuario autenticado',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'gitlab_get_project',
    description: 'Obtiene información de un proyecto específico',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'gitlab_get_issues',
    description: 'Obtiene los issues de un proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto',
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
    description: 'Crea un nuevo issue en un proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto',
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
    description: 'Obtiene los merge requests de un proyecto',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto',
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
    description: 'Crea un nuevo merge request',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID del proyecto',
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

// Manejar listado de herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Manejar llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
        const user = await getGitHubUser();
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
        const repo = await getRepo(args['owner'] as string, args['repo'] as string);
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
        const state = args['state'] as 'open' | 'closed' | 'all' || 'open';
        const issues = await getRepoIssues(args['owner'] as string, args['repo'] as string, state);
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
          args['owner'] as string,
          args['repo'] as string,
          args['title'] as string,
          args['body'] as string,
          args['labels'] as string[]
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
        const prState = args['state'] as 'open' | 'closed' | 'all' || 'open';
        const pullRequests = await getPullRequests(args['owner'] as string, args['repo'] as string, prState);
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
          args['owner'] as string,
          args['repo'] as string,
          args['title'] as string,
          args['head'] as string,
          args['base'] as string,
          args['body'] as string
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
        const branch = args['branch'] as string || 'main';
        const commits = await getCommits(args['owner'] as string, args['repo'] as string, branch);
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
        const fileBranch = args['branch'] as string || 'main';
        const fileContent = await getFileContent(args['owner'] as string, args['repo'] as string, args['path'] as string, fileBranch);
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
        const sort = args['sort'] as 'stars' | 'forks' | 'updated' || 'stars';
        const searchResults = await searchRepos(args['query'] as string, sort);
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
        const releases = await getReleases(args['owner'] as string, args['repo'] as string);
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
        const stats = await getRepoStats(args['owner'] as string, args['repo'] as string);
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
        const userInfo = await getUser(args['username'] as string);
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
        const userRepos = await getUserReposByUsername(args['username'] as string);
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
        const gitlabProject = await getProject(args['projectId'] as string);
        return {
          content: [
            {
              type: 'text',
              text: `Proyecto de GitLab:\n${JSON.stringify(gitlabProject, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_issues':
        if (!args || typeof args !== 'object' || !('projectId' in args)) {
          throw new Error('Parámetro "projectId" requerido para gitlab_get_issues');
        }
        const gitlabState = args['state'] as 'opened' | 'closed' | 'all' || 'opened';
        const gitlabIssues = await getProjectIssues(args['projectId'] as string, gitlabState);
        return {
          content: [
            {
              type: 'text',
              text: `Issues de GitLab:\n${JSON.stringify(gitlabIssues, null, 2)}`,
            },
          ],
        };

      case 'gitlab_create_issue':
        if (!args || typeof args !== 'object' || !('projectId' in args) || !('title' in args)) {
          throw new Error('Parámetros "projectId" y "title" requeridos para gitlab_create_issue');
        }
        const newGitlabIssue = await createGitLabIssue(
          args['projectId'] as string,
          args['title'] as string,
          args['description'] as string,
          args['labels'] as string[]
        );
        return {
          content: [
            {
              type: 'text',
              text: `Issue de GitLab creado:\n${JSON.stringify(newGitlabIssue, null, 2)}`,
            },
          ],
        };

      case 'gitlab_get_merge_requests':
        if (!args || typeof args !== 'object' || !('projectId' in args)) {
          throw new Error('Parámetro "projectId" requerido para gitlab_get_merge_requests');
        }
        const gitlabMrState = args['state'] as 'opened' | 'closed' | 'merged' || 'opened';
        const gitlabMRs = await getMergeRequests(args['projectId'] as string, gitlabMrState);
        return {
          content: [
            {
              type: 'text',
              text: `Merge Requests de GitLab:\n${JSON.stringify(gitlabMRs, null, 2)}`,
            },
          ],
        };

      case 'gitlab_create_merge_request':
        if (!args || typeof args !== 'object' || !('projectId' in args) || !('title' in args) || !('sourceBranch' in args) || !('targetBranch' in args)) {
          throw new Error('Parámetros "projectId", "title", "sourceBranch" y "targetBranch" requeridos para gitlab_create_merge_request');
        }
        const newGitlabMR = await createMergeRequest(
          args['projectId'] as string,
          args['title'] as string,
          args['sourceBranch'] as string,
          args['targetBranch'] as string,
          args['description'] as string
        );
        return {
          content: [
            {
              type: 'text',
              text: `Merge Request de GitLab creado:\n${JSON.stringify(newGitlabMR, null, 2)}`,
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

// Iniciar el servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Dev Tools Server iniciado y escuchando en stdio');
}

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.error('\n🔄 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n🔄 Cerrando servidor...');
  process.exit(0);
});

main().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
