#!/usr/bin/env node

import { Octokit } from '@octokit/rest';

console.log('🔑 Probando token de GitHub...\n');

const token = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE';

const octokit = new Octokit({
  auth: token,
  userAgent: 'MCP-GitHub-Server-Test/1.0.0',
});

async function testToken() {
  try {
    console.log('1️⃣ Probando autenticación...');
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('✅ Token válido!');
    console.log(`   Usuario: ${user.login}`);
    console.log(`   Nombre: ${user.name || 'No especificado'}`);
    console.log(`   Email: ${user.email || 'No público'}`);
    
    console.log('\n2️⃣ Probando repositorios públicos...');
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 5,
    });
    console.log(`✅ Encontrados ${repos.length} repositorios`);
    repos.forEach(repo => {
      console.log(`   - ${repo.full_name} (${repo.private ? 'privado' : 'público'})`);
    });
    
    console.log('\n3️⃣ Probando búsqueda de repositorios...');
    const { data: searchResults } = await octokit.search.repos({
      q: 'typescript mcp',
      sort: 'stars',
      per_page: 3,
    });
    console.log(`✅ Búsqueda exitosa! Encontrados ${searchResults.items.length} repositorios`);
    searchResults.items.forEach(repo => {
      console.log(`   - ${repo.full_name} (⭐ ${repo.stargazers_count})`);
    });
    
    console.log('\n🎉 ¡Token funcionando perfectamente!');
    
  } catch (error) {
    console.log('❌ Error con el token:');
    console.log(`   Status: ${error.status}`);
    console.log(`   Message: ${error.message}`);
    
    if (error.status === 401) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que el token sea correcto');
      console.log('   2. Asegúrate de que el token tenga los permisos necesarios:');
      console.log('      - repo (Full control of private repositories)');
      console.log('      - public_repo (Access public repositories)');
      console.log('      - user (Read user profile data)');
      console.log('   3. Verifica que el token no haya expirado');
    }
  }
}

testToken();
