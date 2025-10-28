#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🐙 Probando MCP Server con GitHub REAL...\n');

// Usar el token real
const env = {
  ...process.env,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE',
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

// Esperar un momento para que el servidor se inicie
setTimeout(() => {
  console.log('\n1️⃣ Probando información del usuario de GitHub...');
  sendMCPRequest('tools/call', {
    name: 'github_get_user',
    arguments: {}
  });

  // Esperar y probar repositorios
  setTimeout(() => {
    console.log('\n2️⃣ Probando repositorios del usuario...');
    sendMCPRequest('tools/call', {
      name: 'github_get_repos',
      arguments: {}
    });

    // Esperar y probar búsqueda
    setTimeout(() => {
      console.log('\n3️⃣ Probando búsqueda de repositorios...');
      sendMCPRequest('tools/call', {
        name: 'github_search_repos',
        arguments: {
          query: 'typescript mcp',
          sort: 'stars'
        }
      });

      // Esperar y probar un repositorio específico
      setTimeout(() => {
        console.log('\n4️⃣ Probando información de un repositorio específico...');
        sendMCPRequest('tools/call', {
          name: 'github_get_repo',
          arguments: {
            owner: 'clementeaf',
            repo: 'template-fullstack'
          }
        });

        // Cerrar después de las pruebas
        setTimeout(() => {
          console.log('\n✅ Pruebas completadas. Cerrando servidor...');
          server.kill();
        }, 2000);

      }, 2000);

    }, 2000);

  }, 2000);

}, 1000);
