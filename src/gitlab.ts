import { Gitlab } from '@gitbeaker/rest';

// Configuración de GitLab
const gitlabConfig = {
  host: process.env['GITLAB_HOST'] || 'https://gitlab.com',
  token: process.env['GITLAB_TOKEN'] || '',
};

let gitlab: Gitlab | null = null;

// Inicializar cliente de GitLab
export function initializeGitLabClient(): Gitlab {
  if (gitlab) {
    return gitlab;
  }

  if (!gitlabConfig.token) {
    throw new Error('GITLAB_TOKEN no está configurado. Por favor, configura tu token de GitLab.');
  }

  gitlab = new Gitlab({
    host: gitlabConfig.host,
    token: gitlabConfig.token,
  });

  console.error('✅ Conectado a GitLab API');
  return gitlab;
}

// Obtener información del usuario autenticado
export async function getCurrentUser(): Promise<any> {
  const client = initializeGitLabClient();
  const user = await client.Users.showCurrentUser();
  return user;
}

// Obtener proyectos del usuario
export async function getUserProjects(): Promise<any[]> {
  const client = initializeGitLabClient();
  const projects = await client.Projects.all({
    membership: true,
    perPage: 30,
  });
  return projects;
}

// Obtener un proyecto específico
export async function getProject(projectId: string | number): Promise<any> {
  const client = initializeGitLabClient();
  const project = await client.Projects.show(projectId);
  return project;
}

// Obtener issues de un proyecto
export async function getProjectIssues(projectId: string | number, state: 'opened' | 'closed' | 'all' = 'opened'): Promise<any[]> {
  const client = initializeGitLabClient();
  const issues = await client.Issues.all({
    projectId,
    state,
    perPage: 30,
  });
  return issues;
}

// Crear un issue
export async function createIssue(projectId: string | number, title: string, description?: string, labels?: string[]): Promise<any> {
  const client = initializeGitLabClient();
  const issueData: any = { title };
  if (description) issueData.description = description;
  if (labels) issueData.labels = labels.join(',');
  
  const issue = await client.Issues.create(projectId, title, issueData);
  return issue;
}

// Obtener merge requests de un proyecto
export async function getMergeRequests(projectId: string | number, state: 'opened' | 'closed' | 'merged' = 'opened'): Promise<any[]> {
  const client = initializeGitLabClient();
  const mergeRequests = await client.MergeRequests.all({
    projectId,
    state,
    perPage: 30,
  });
  return mergeRequests;
}

// Crear un merge request
export async function createMergeRequest(projectId: string | number, title: string, sourceBranch: string, targetBranch: string, description?: string): Promise<any> {
  const client = initializeGitLabClient();
  const mrData: any = {};
  if (description) mrData.description = description;
  
  const mergeRequest = await client.MergeRequests.create(projectId, sourceBranch, targetBranch, title, mrData);
  return mergeRequest;
}

// Obtener commits de un proyecto
export async function getCommits(projectId: string | number, branch: string = 'main'): Promise<any[]> {
  const client = initializeGitLabClient();
  const commits = await client.Commits.all(projectId, {
    refName: branch,
    perPage: 30,
  });
  return commits;
}

// Obtener contenido de un archivo
export async function getFileContent(projectId: string | number, filePath: string, branch: string = 'main'): Promise<any> {
  const client = initializeGitLabClient();
  const file = await client.RepositoryFiles.show(projectId, filePath, branch);
  return file;
}

// Buscar proyectos
export async function searchProjects(query: string): Promise<any[]> {
  const client = initializeGitLabClient();
  const projects = await client.Projects.all({
    search: query,
    perPage: 30,
  });
  return projects;
}

// Obtener releases de un proyecto
export async function getReleases(projectId: string | number): Promise<any[]> {
  const client = initializeGitLabClient();
  const releases = await client.ProjectReleases.all(projectId, {
    perPage: 30,
  });
  return releases;
}

// Obtener información de un usuario específico
export async function getUser(userId: string | number): Promise<any> {
  const client = initializeGitLabClient();
  const user = await client.Users.show(Number(userId));
  return user;
}

// Obtener proyectos de un usuario específico
export async function getUserProjectsByUsername(username: string): Promise<any[]> {
  const client = initializeGitLabClient();
  const projects = await client.Projects.all({
    search: username,
    perPage: 30,
  });
  return projects;
}
