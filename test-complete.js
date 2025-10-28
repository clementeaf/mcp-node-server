#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🐙 Probando MCP GitHub Server - Prueba Completa...\n');

// Configurar variables de entorno para la prueba
const env = {
  ...process.env,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'ghp_test_token',
};

// Ejecutar el servidor MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: env
});

// Capturar respuestas del servidor
server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('\n📥 Respuesta del servidor:');
    console.log(JSON.stringify(response, null, 2));
    console.log('\n' + '='.repeat(50));
  } catch (e) {
    console.log('📥 Respuesta del servidor:', data.toString());
  }
});

server.stderr.on('data', (data) => {
  console.log('⚠️  Log del servidor:', data.toString().trim());
});

server.on('close', (code) => {
  console.log(`\n🔚 Servidor cerrado con código: ${code}`);
});

// Función para enviar comandos MCP
function sendMCPRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: Math.floor(Math.random() * 1000),
    method: method,
    params: params
  };
  
  const message = JSON.stringify(request) + '\n';
  console.log(`\n📤 Enviando: ${method}`);
  server.stdin.write(message);
}

// Función para probar herramientas básicas
function testBasicTools() {
  console.log('\n🔧 === PROBANDO HERRAMIENTAS BÁSICAS ===');
  
  setTimeout(() => {
    console.log('\n1️⃣ Probando echo...');
    sendMCPRequest('tools/call', {
      name: 'echo',
      arguments: {
        message: '¡Hola desde MCP GitHub Server!'
      }
    });
  }, 1000);

  setTimeout(() => {
    console.log('\n2️⃣ Probando get_time...');
    sendMCPRequest('tools/call', {
      name: 'get_time',
      arguments: {}
    });
  }, 2000);
}

// Función para probar herramientas de GitHub
function testGitHubTools() {
  console.log('\n🐙 === PROBANDO HERRAMIENTAS DE GITHUB ===');
  
  setTimeout(() => {
    console.log('\n3️⃣ Probando búsqueda de repositorios...');
    sendMCPRequest('tools/call', {
      name: 'github_search_repos',
      arguments: {
        query: 'mcp typescript',
        sort: 'stars'
      }
    });
  }, 3000);

  setTimeout(() => {
    console.log('\n4️⃣ Probando información de un repositorio específico...');
    sendMCPRequest('tools/call', {
      name: 'github_get_repo',
      arguments: {
        owner: 'microsoft',
        repo: 'vscode'
      }
    });
  }, 4000);

  setTimeout(() => {
    console.log('\n5️⃣ Probando issues de un repositorio...');
    sendMCPRequest('tools/call', {
      name: 'github_get_issues',
      arguments: {
        owner: 'microsoft',
        repo: 'vscode',
        state: 'open'
      }
    });
  }, 5000);

  setTimeout(() => {
    console.log('\n6️⃣ Probando commits de un repositorio...');
    sendMCPRequest('tools/call', {
      name: 'github_get_commits',
      arguments: {
        owner: 'microsoft',
        repo: 'vscode',
        branch: 'main'
      }
    });
  }, 6000);

  setTimeout(() => {
    console.log('\n7️⃣ Probando contenido de un archivo...');
    sendMCPRequest('tools/call', {
      name: 'github_get_file_content',
      arguments: {
        owner: 'microsoft',
        repo: 'vscode',
        path: 'README.md',
        branch: 'main'
      }
    });
  }, 7000);

  setTimeout(() => {
    console.log('\n8️⃣ Probando releases de un repositorio...');
    sendMCPRequest('tools/call', {
      name: 'github_get_releases',
      arguments: {
        owner: 'microsoft',
        repo: 'vscode'
      }
    });
  }, 8000);

  setTimeout(() => {
    console.log('\n9️⃣ Probando información de un usuario...');
    sendMCPRequest('tools/call', {
      name: 'github_get_user_by_username',
      arguments: {
        username: 'microsoft'
      }
    });
  }, 9000);

  setTimeout(() => {
    console.log('\n🔟 Probando repositorios de un usuario...');
    sendMCPRequest('tools/call', {
      name: 'github_get_user_repos',
      arguments: {
        username: 'microsoft'
      }
    });
  }, 10000);
}

// Función para probar herramientas de escritura (crear issues/PRs)
function testWriteOperations() {
  console.log('\n✍️ === PROBANDO OPERACIONES DE ESCRITURA ===');
  
  setTimeout(() => {
    console.log('\n1️⃣ Probando creación de issue...');
    sendMCPRequest('tools/call', {
      name: 'github_create_issue',
      arguments: {
        owner: 'tu_usuario',
        repo: 'tu_repositorio',
        title: 'Test Issue desde MCP Server',
        body: 'Este es un issue de prueba creado desde el MCP Server',
        labels: ['test', 'mcp']
      }
    });
  }, 11000);

  setTimeout(() => {
    console.log('\n2️⃣ Probando creación de pull request...');
    sendMCPRequest('tools/call', {
      name: 'github_create_pull_request',
      arguments: {
        owner: 'tu_usuario',
        repo: 'tu_repositorio',
        title: 'Test PR desde MCP Server',
        head: 'feature-branch',
        base: 'main',
        body: 'Este es un PR de prueba creado desde el MCP Server'
      }
    });
  }, 12000);
}

// Iniciar las pruebas
setTimeout(() => {
  console.log('\n🚀 Iniciando pruebas del MCP GitHub Server...');
  sendMCPRequest('tools/list');
}, 500);

// Ejecutar pruebas básicas
testBasicTools();

// Ejecutar pruebas de GitHub
testGitHubTools();

// Ejecutar pruebas de escritura
testWriteOperations();

// Cerrar después de todas las pruebas
setTimeout(() => {
  console.log('\n✅ Todas las pruebas completadas. Cerrando servidor...');
  console.log('\n💡 Nota: Algunas operaciones pueden fallar sin un token válido de GitHub');
  console.log('   Para usar GitHub, configura tu GITHUB_TOKEN en el archivo .env');
  server.kill();
}, 15000);
