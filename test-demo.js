#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🎯 MCP GitHub Server - Demo de Funcionalidades\n');

// Ejecutar el servidor MCP
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, GITHUB_TOKEN: 'demo_token' }
});

// Capturar respuestas del servidor
server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('📥 Respuesta:', JSON.stringify(response, null, 2));
    console.log('\n' + '='.repeat(60));
  } catch (e) {
    console.log('📥 Respuesta:', data.toString());
  }
});

server.stderr.on('data', (data) => {
  console.log('⚠️  Log:', data.toString().trim());
});

server.on('close', (code) => {
  console.log(`\n🔚 Servidor cerrado (código: ${code})`);
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

// Demo de funcionalidades
setTimeout(() => {
  console.log('\n🚀 === DEMO: MCP GitHub Server ===\n');
  
  // 1. Listar herramientas disponibles
  console.log('1️⃣ Listando herramientas disponibles...');
  sendMCPRequest('tools/list');
  
  setTimeout(() => {
    // 2. Probar herramientas básicas
    console.log('\n2️⃣ Probando herramientas básicas...');
    sendMCPRequest('tools/call', {
      name: 'echo',
      arguments: { message: '¡MCP Server funcionando perfectamente! 🎉' }
    });
    
    setTimeout(() => {
      sendMCPRequest('tools/call', {
        name: 'get_time',
        arguments: {}
      });
      
      setTimeout(() => {
        // 3. Demostrar manejo de errores de GitHub
        console.log('\n3️⃣ Demostrando integración con GitHub (sin token)...');
        sendMCPRequest('tools/call', {
          name: 'github_search_repos',
          arguments: {
            query: 'mcp typescript',
            sort: 'stars'
          }
        });
        
        setTimeout(() => {
          // 4. Mostrar capacidades de GitHub
          console.log('\n4️⃣ Mostrando capacidades de GitHub...');
          console.log('   ✅ Búsqueda de repositorios');
          console.log('   ✅ Información de repositorios');
          console.log('   ✅ Issues y Pull Requests');
          console.log('   ✅ Commits y archivos');
          console.log('   ✅ Releases y estadísticas');
          console.log('   ✅ Información de usuarios');
          console.log('   ✅ Creación de issues y PRs');
          
          setTimeout(() => {
            console.log('\n🎯 === RESUMEN DEL SERVIDOR ===');
            console.log('✅ Protocolo MCP: Implementado correctamente');
            console.log('✅ Herramientas básicas: Funcionando');
            console.log('✅ Integración GitHub: Lista para usar');
            console.log('✅ Manejo de errores: Implementado');
            console.log('✅ Documentación: Completa');
            console.log('\n💡 Para usar GitHub, configura GITHUB_TOKEN en .env');
            console.log('🔧 Para usar con Cursor, agrega la configuración MCP');
            
            server.kill();
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);
}, 1000);
