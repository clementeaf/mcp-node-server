#!/usr/bin/env node

/**
 * MCP Proxy - Conecta Cursor MCP con nuestro servidor Lambda
 * Convierte MCP stdio ↔ HTTP Lambda
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// URL de nuestro servidor Lambda
const LAMBDA_URL = 'https://zt2x5jma17.execute-api.us-east-1.amazonaws.com/dev/mcp';

/**
 * Envía petición HTTP a nuestro servidor Lambda
 * @param {Object} request - Petición MCP
 * @returns {Object} Respuesta de Lambda
 */
async function callLambda(request) {
  try {
    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-Proxy/1.0.0'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Lambda:', error);
    throw error;
  }
}

// Crear servidor MCP
const server = new Server(
  {
    name: 'mcp-fullstack-tools-proxy',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Manejar listado de herramientas
server.setRequestHandler({ method: 'tools/list' }, async () => {
  try {
    const response = await callLambda({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });
    
    return response.result;
  } catch (error) {
    throw new Error(`Failed to list tools: ${error.message}`);
  }
});

// Manejar llamadas a herramientas
server.setRequestHandler({ method: 'tools/call' }, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    const response = await callLambda({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    });
    
    return response.result;
  } catch (error) {
    throw new Error(`Failed to call tool ${request.params.name}: ${error.message}`);
  }
});

// Iniciar servidor MCP
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Fullstack Tools Proxy started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.error('MCP Proxy shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('MCP Proxy shutting down...');
  process.exit(0);
});

// Iniciar el servidor
startServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
