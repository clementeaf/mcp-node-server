#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🐙 Probando MCP Server con GitHub...\n');

// Configurar variables de entorno para la prueba
const env = {
  ...process.env,
  // Configuración de GitHub (necesitarás configurar tu token)
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'tu_github_token_aqui',
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
  console.log('\n1️⃣ Probando listado de herramientas...');
  sendMCPRequest('tools/list');

  // Esperar y probar información del usuario de GitHub
  setTimeout(() => {
    console.log('\n2️⃣ Probando información del usuario de GitHub...');
    sendMCPRequest('tools/call', {
      name: 'github_get_user',
      arguments: {}
    });

    // Esperar y probar listado de repositorios
    setTimeout(() => {
      console.log('\n3️⃣ Probando listado de repositorios...');
      sendMCPRequest('tools/call', {
        name: 'github_get_repos',
        arguments: {}
      });

      // Esperar y probar búsqueda de repositorios
      setTimeout(() => {
        console.log('\n4️⃣ Probando búsqueda de repositorios...');
        sendMCPRequest('tools/call', {
          name: 'github_search_repos',
          arguments: {
            query: 'typescript mcp',
            sort: 'stars'
          }
        });

        // Cerrar después de las pruebas
        setTimeout(() => {
          console.log('\n✅ Pruebas completadas. Cerrando servidor...');
          console.log('\n💡 Nota: Para usar GitHub, necesitas configurar tu GITHUB_TOKEN');
          console.log('   Ve a GitHub Settings > Developer settings > Personal access tokens');
          server.kill();
        }, 3000);

      }, 2000);

    }, 2000);

  }, 2000);

}, 1000);
