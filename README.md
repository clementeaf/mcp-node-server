# MCP Dev Tools Server

Un servidor MCP (Model Context Protocol) con integración de GitHub y GitLab implementado en Node.js con TypeScript, desplegado en AWS Lambda.

## Características

- ✅ Configuración completa de TypeScript
- ✅ SDK oficial de MCP
- ✅ **Integración con GitHub** (API REST)
- ✅ Herramientas de GitHub (repos, issues, PRs, commits)
- ✅ Herramientas básicas (echo, get_time)
- ✅ Scripts de desarrollo y producción
- ✅ Hot reload con nodemon
- ✅ Manejo de errores

## 🚀 Despliegue en AWS Lambda

### Instalación
```bash
npm install
```

### Configuración
1. **Configurar AWS CLI**:
```bash
aws configure
```

2. **Configurar variables de entorno**:
```bash
export GITHUB_TOKEN="tu_token_de_github"
export GITLAB_TOKEN="tu_token_de_gitlab"  # Opcional
export GITLAB_HOST="https://gitlab.com"
```

3. **Desplegar**:
```bash
# Opción 1: Script automático
./deploy.sh

# Opción 2: Manual
npm run lambda:build
npm run lambda:deploy
```

### Desarrollo Local
```bash
# Modo desarrollo con hot reload
npm run dev

# Probar Lambda localmente
npm run lambda:offline

# Compilar TypeScript
npm run build
```

## Herramientas Disponibles

### Herramientas Básicas

#### echo
Hace echo del mensaje que se le pase.

**Parámetros:**
- `message` (string): El mensaje a hacer echo

#### get_time
Obtiene la fecha y hora actual.

**Parámetros:** Ninguno

### Herramientas Básicas

#### echo
Hace echo del mensaje que se le pase.

**Parámetros:**
- `message` (string): El mensaje a hacer echo

**Ejemplo:**
```json
{
  "name": "echo",
  "arguments": {
    "message": "¡Hola desde Cursor!"
  }
}
```

#### get_time
Obtiene la fecha y hora actual.

**Parámetros:** Ninguno

### Herramientas de GitHub

#### github_get_user
Obtiene información del usuario autenticado de GitHub.

**Parámetros:** Ninguno

#### github_get_repos
Obtiene los repositorios del usuario autenticado.

**Parámetros:** Ninguno

#### github_get_repo
Obtiene información de un repositorio específico.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio

#### github_get_issues
Obtiene los issues de un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `state` (string, opcional): Estado de los issues (open, closed, all)

#### github_create_issue
Crea un nuevo issue en un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `title` (string): Título del issue
- `body` (string, opcional): Descripción del issue
- `labels` (array, opcional): Etiquetas para el issue

#### github_get_pull_requests
Obtiene los pull requests de un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `state` (string, opcional): Estado de los PRs (open, closed, all)

#### github_create_pull_request
Crea un nuevo pull request.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `title` (string): Título del pull request
- `head` (string): Rama de origen
- `base` (string): Rama de destino
- `body` (string, opcional): Descripción del pull request

#### github_get_commits
Obtiene los commits de un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `branch` (string, opcional): Rama del repositorio (default: main)

#### github_get_file_content
Obtiene el contenido de un archivo en un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio
- `path` (string): Ruta del archivo
- `branch` (string, opcional): Rama del repositorio (default: main)

#### github_search_repos
Busca repositorios en GitHub.

**Parámetros:**
- `query` (string): Consulta de búsqueda
- `sort` (string, opcional): Criterio de ordenamiento (stars, forks, updated)

#### github_get_releases
Obtiene los releases de un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio

#### github_get_repo_stats
Obtiene estadísticas de un repositorio.

**Parámetros:**
- `owner` (string): Propietario del repositorio
- `repo` (string): Nombre del repositorio

#### github_get_user_by_username
Obtiene información de un usuario específico por nombre de usuario.

**Parámetros:**
- `username` (string): Nombre de usuario de GitHub

#### github_get_user_repos
Obtiene los repositorios de un usuario específico.

**Parámetros:**
- `username` (string): Nombre de usuario de GitHub

## Estructura del Proyecto

```
src/
  index.ts          # Servidor MCP principal
  github.ts         # Integración con GitHub
dist/               # Código compilado (generado automáticamente)
tsconfig.json       # Configuración de TypeScript
package.json        # Dependencias y scripts
github-config.example # Guía de configuración de GitHub
```

## Uso

Este servidor MCP puede ser utilizado por clientes que implementen el protocolo MCP para acceder a las herramientas definidas.

### Ejemplo de Configuración para Cliente MCP

Para usar este servidor con un cliente MCP, agrega la siguiente configuración:

```json
{
  "mcpServers": {
    "mcp-github-server": {
      "command": "node",
      "args": ["/ruta/completa/a/tu/proyecto/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_tu_token_aqui"
      }
    }
  }
}
```

### Comandos Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Compilar el proyecto
npm run build

# Ejecutar versión compilada
npm start

# Limpiar archivos compilados
npm run clean
```

### Estructura del Proyecto

```
mcp-github-server/
├── src/
│   ├── index.ts          # Servidor MCP principal
│   └── github.ts         # Integración con GitHub
├── dist/                 # Código compilado (generado)
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
├── nodemon.json          # Configuración desarrollo
├── github-config.example # Guía de configuración
└── README.md            # Este archivo
```

### Próximos Pasos

1. **Agregar más herramientas de GitHub**: Extiende el array `tools` en `src/index.ts`
2. **Implementar recursos**: Agrega manejadores para `ListResourcesRequestSchema` y `ReadResourceRequestSchema`
3. **Agregar prompts**: Implementa `ListPromptsRequestSchema` y `GetPromptRequestSchema`
4. **Configurar logging**: Agrega un sistema de logs más robusto
5. **Testing**: Implementa tests unitarios con Jest o similar
6. **Integrar más servicios**: GitLab, Bitbucket, Jira, Slack, etc.
