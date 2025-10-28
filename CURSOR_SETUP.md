# 🎯 Configuración para Cursor - MCP GitHub Server

## 📋 **Paso 1: Crear Token de GitHub**

1. Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Haz clic en **"Generate new token"** > **"Generate new token (classic)"**
3. Configura el token:
   - **Note**: "MCP GitHub Server"
   - **Expiration**: Selecciona la duración que prefieras
   - **Scopes**: Selecciona los siguientes permisos:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `public_repo` (Access public repositories)
     - ✅ `user` (Read user profile data)
     - ✅ `read:org` (Read org and team membership)
4. Haz clic en **"Generate token"**
5. **¡IMPORTANTE!** Copia el token (solo se muestra una vez)

## 📋 **Paso 2: Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto:

```bash
echo "GITHUB_TOKEN=ghp_tu_token_aqui" > .env
```

Reemplaza `ghp_tu_token_aqui` con tu token real.

## 📋 **Paso 3: Configurar Cursor**

### **Opción A: Configuración Global de Cursor**

1. Abre Cursor
2. Ve a **Settings** (Cmd/Ctrl + ,)
3. Busca **"MCP"** o **"Model Context Protocol"**
4. Agrega la siguiente configuración:

```json
{
  "mcpServers": {
    "mcp-github-server": {
      "command": "node",
      "args": ["/Users/clementefalcone/Desktop/personal/mcp-node-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_tu_token_aqui"
      }
    }
  }
}
```

### **Opción B: Archivo de Configuración**

1. Crea un archivo `cursor-mcp-config.json` en tu directorio home:
```bash
# macOS/Linux
~/.cursor-mcp-config.json

# Windows
%USERPROFILE%\.cursor-mcp-config.json
```

2. Agrega el contenido JSON de arriba

## 📋 **Paso 4: Compilar el Proyecto**

```bash
cd /Users/clementefalcone/Desktop/personal/mcp-node-server
npm run build
```

## 📋 **Paso 5: Probar la Configuración**

```bash
# Probar con token real
GITHUB_TOKEN=ghp_tu_token_aqui node test-github.js
```

## 🎯 **Casos de Uso en Cursor**

Una vez configurado, podrás usar comandos como:

- "¿Cuáles son mis repositorios de GitHub?"
- "Busca repositorios de TypeScript con más estrellas"
- "Muéstrame los issues abiertos del repositorio microsoft/vscode"
- "Crea un nuevo issue en mi repositorio"
- "¿Cuáles son los últimos commits del repositorio?"
- "Muéstrame el contenido del archivo README.md"
- "¿Cuáles son los releases de este repositorio?"

## 🔧 **Troubleshooting**

### **Error: "Bad credentials"**
- Verifica que el token esté correcto
- Asegúrate de que el token tenga los permisos necesarios

### **Error: "Command not found"**
- Verifica que la ruta al archivo `dist/index.js` sea correcta
- Asegúrate de que el proyecto esté compilado (`npm run build`)

### **Error: "Permission denied"**
- Verifica que el archivo `dist/index.js` tenga permisos de ejecución
- En macOS/Linux: `chmod +x dist/index.js`

## 📚 **Herramientas Disponibles**

### **Básicas**
- `echo` - Echo de mensajes
- `get_time` - Fecha y hora actual

### **GitHub**
- `github_get_user` - Usuario autenticado
- `github_get_repos` - Repositorios del usuario
- `github_get_repo` - Información de repositorio
- `github_get_issues` - Issues de repositorio
- `github_create_issue` - Crear issue
- `github_get_pull_requests` - Pull requests
- `github_create_pull_request` - Crear PR
- `github_get_commits` - Commits de repositorio
- `github_get_file_content` - Contenido de archivo
- `github_search_repos` - Buscar repositorios
- `github_get_releases` - Releases de repositorio
- `github_get_repo_stats` - Estadísticas de repositorio
- `github_get_user_by_username` - Info de usuario
- `github_get_user_repos` - Repos de usuario

## 🎉 **¡Listo!**

Una vez completados estos pasos, tu MCP GitHub Server estará disponible en Cursor y podrás interactuar con GitHub directamente desde el editor.
