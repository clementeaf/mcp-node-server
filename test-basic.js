#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔧 Probando MCP Basic Server...\n');

// Ejecutar el servidor MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
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

  // Esperar y probar herramienta echo
  setTimeout(() => {
    console.log('\n2️⃣ Probando herramienta echo...');
    sendMCPRequest('tools/call', {
      name: 'echo',
      arguments: {
        message: '¡Hola desde el MCP Basic Server!'
      }
    });

    // Esperar y probar herramienta get_time
    setTimeout(() => {
      console.log('\n3️⃣ Probando herramienta get_time...');
      sendMCPRequest('tools/call', {
        name: 'get_time',
        arguments: {}
      });

      // Cerrar después de las pruebas
      setTimeout(() => {
        console.log('\n✅ Pruebas completadas. Cerrando servidor...');
        server.kill();
      }, 2000);

    }, 2000);

  }, 2000);

}, 1000);
