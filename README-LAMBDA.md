# MCP Server - AWS Lambda Deployment

Servidor MCP (Model Context Protocol) con integración de GitHub y GitLab desplegado en AWS Lambda.

## 🚀 Despliegue Rápido

### 1. Configurar AWS CLI
```bash
# Instalar AWS CLI
npm install -g aws-cli

# Configurar credenciales
aws configure
```

### 2. Configurar Variables de Entorno
```bash
export GITHUB_TOKEN="tu_token_de_github"
export GITLAB_TOKEN="tu_token_de_gitlab"  # Opcional
export GITLAB_HOST="https://gitlab.com"
```

### 3. Desplegar
```bash
# Opción 1: Script automático
./deploy.sh

# Opción 2: Manual
npm run lambda:build
npm run lambda:deploy
```

## 📋 Comandos Disponibles

```bash
# Desarrollo local
npm run lambda:offline

# Desplegar en diferentes entornos
npm run lambda:deploy:dev
npm run lambda:deploy:prod

# Ver información del despliegue
serverless info

# Eliminar el despliegue
npm run lambda:remove
```

## 🔧 Configuración

### Variables de Entorno Requeridas
- `GITHUB_TOKEN`: Token de GitHub (requerido)
- `GITLAB_TOKEN`: Token de GitLab (opcional)
- `GITLAB_HOST`: Host de GitLab (default: https://gitlab.com)

### Configuración de AWS
- **Región**: us-east-1 (configurable en serverless.yml)
- **Runtime**: Node.js 18.x
- **Timeout**: 30 segundos
- **Memory**: 512 MB

## 🌐 Endpoint

Una vez desplegado, tendrás un endpoint HTTPS como:
```
https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/mcp
```

## 🛠️ Herramientas Disponibles

### GitHub
- `github_get_user` - Información del usuario
- `github_get_repos` - Repositorios del usuario
- `github_get_repo` - Información de un repositorio
- `github_get_issues` - Issues de un repositorio
- `github_create_issue` - Crear issue
- `github_get_pull_requests` - Pull requests
- `github_create_pull_request` - Crear pull request
- `github_get_commits` - Commits de un repositorio
- `github_get_file_content` - Contenido de archivo
- `github_search_repos` - Buscar repositorios
- `github_get_releases` - Releases
- `github_get_repo_stats` - Estadísticas
- `github_get_user_by_username` - Usuario por username
- `github_get_user_repos` - Repos de usuario específico

### GitLab
- `gitlab_get_user` - Usuario de GitLab
- `gitlab_get_projects` - Proyectos de GitLab
- `gitlab_get_project` - Proyecto específico
- `gitlab_get_issues` - Issues de proyecto
- `gitlab_create_issue` - Crear issue
- `gitlab_get_merge_requests` - Merge requests
- `gitlab_create_merge_request` - Crear merge request

### Básicas
- `echo` - Echo de mensaje
- `get_time` - Hora actual

## 🔍 Monitoreo

```bash
# Ver logs en tiempo real
serverless logs -f mcp -t

# Ver métricas
serverless metrics
```

## 💰 Costos

AWS Lambda cobra por:
- **Invocaciones**: $0.20 por 1M de requests
- **Duración**: $0.0000166667 por GB-segundo
- **API Gateway**: $3.50 por 1M de requests

Para uso típico: **~$1-5/mes**

## 🆘 Solución de Problemas

### Error de permisos
```bash
aws iam create-role --role-name lambda-execution-role --assume-role-policy-document file://trust-policy.json
```

### Error de timeout
Aumentar timeout en `serverless.yml`:
```yaml
provider:
  timeout: 60  # segundos
```

### Error de memoria
Aumentar memoria en `serverless.yml`:
```yaml
provider:
  memorySize: 1024  # MB
```
