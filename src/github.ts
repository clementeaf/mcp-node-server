import { Octokit } from '@octokit/rest';

// Configuración de GitHub
const githubConfig = {
  auth: process.env['GITHUB_TOKEN'] || '',
  userAgent: 'MCP-GitHub-Server/1.0.0',
};

let octokit: Octokit | null = null;

// Inicializar cliente de GitHub
export function initializeGitHubClient(): Octokit {
  if (octokit) {
    return octokit;
  }

  if (!githubConfig.auth) {
    throw new Error('GITHUB_TOKEN no está configurado. Por favor, configura tu token de GitHub.');
  }

  octokit = new Octokit(githubConfig);
  console.error('✅ Conectado a GitHub API');
  return octokit;
}

// Obtener información del usuario autenticado
export async function getCurrentUser(): Promise<any> {
  const client = initializeGitHubClient();
  const { data } = await client.users.getAuthenticated();
  return data;
}

// Obtener repositorios del usuario
export async function getUserRepos(): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 30,
  });
  return data;
}

// Obtener un repositorio específico
export async function getRepo(owner: string, repo: string): Promise<any> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.get({ owner, repo });
  return data;
}

// Obtener issues de un repositorio
export async function getRepoIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: 30,
  });
  return data;
}

// Crear un issue
export async function createIssue(owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<any> {
  const client = initializeGitHubClient();
  const issueData: any = {
    owner,
    repo,
    title,
  };
  
  if (body) {
    issueData.body = body;
  }
  
  if (labels) {
    issueData.labels = labels;
  }
  
  const { data } = await client.issues.create(issueData);
  return data;
}

// Obtener pull requests de un repositorio
export async function getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.pulls.list({
    owner,
    repo,
    state,
    per_page: 30,
  });
  return data;
}

// Crear un pull request
export async function createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<any> {
  const client = initializeGitHubClient();
  const prData: any = {
    owner,
    repo,
    title,
    head,
    base,
  };
  
  if (body) {
    prData.body = body;
  }
  
  const { data } = await client.pulls.create(prData);
  return data;
}

// Obtener commits de un repositorio
export async function getCommits(owner: string, repo: string, branch: string = 'main'): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.listCommits({
    owner,
    repo,
    sha: branch,
    per_page: 30,
  });
  return data;
}

// Obtener contenido de un archivo
export async function getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<any> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });
  return data;
}

// Buscar repositorios
export async function searchRepos(query: string, sort: 'stars' | 'forks' | 'updated' = 'stars'): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.search.repos({
    q: query,
    sort,
    per_page: 30,
  });
  return data.items || [];
}

// Obtener releases de un repositorio
export async function getReleases(owner: string, repo: string): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.listReleases({
    owner,
    repo,
    per_page: 30,
  });
  return data;
}

// Obtener estadísticas del repositorio
export async function getRepoStats(owner: string, repo: string): Promise<any> {
  const client = initializeGitHubClient();
  
  const [contributors, languages, traffic] = await Promise.allSettled([
    client.repos.listContributors({ owner, repo }),
    client.repos.listLanguages({ owner, repo }),
    client.repos.getCodeFrequencyStats({ owner, repo }),
  ]);

  return {
    contributors: contributors.status === 'fulfilled' ? contributors.value.data : null,
    languages: languages.status === 'fulfilled' ? languages.value.data : null,
    codeFrequency: traffic.status === 'fulfilled' ? traffic.value.data : null,
  };
}

// Obtener información de un usuario específico
export async function getUser(username: string): Promise<any> {
  const client = initializeGitHubClient();
  const { data } = await client.users.getByUsername({ username });
  return data;
}

// Obtener repositorios de un usuario específico
export async function getUserReposByUsername(username: string): Promise<any[]> {
  const client = initializeGitHubClient();
  const { data } = await client.repos.listForUser({
    username,
    sort: 'updated',
    per_page: 30,
  });
  return data;
}
