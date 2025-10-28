#!/bin/bash

echo "🚀 Configurando MCP GitHub Server para Cursor..."
echo ""

# Verificar que el proyecto esté compilado
if [ ! -f "dist/index.js" ]; then
    echo "📦 Compilando proyecto..."
    npm run build
    echo "✅ Proyecto compilado"
else
    echo "✅ Proyecto ya está compilado"
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo ""
    echo "🔑 Configurando variables de entorno..."
    echo "GITHUB_TOKEN=ghp_tu_token_aqui" > .env
    echo "✅ Archivo .env creado"
    echo "⚠️  IMPORTANTE: Edita .env y reemplaza 'ghp_tu_token_aqui' con tu token real de GitHub"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "📋 Pasos para completar la configuración:"
echo ""
echo "1. 🔑 Obtén tu token de GitHub:"
echo "   https://github.com/settings/tokens"
echo "   Permisos necesarios: repo, public_repo, user, read:org"
echo ""
echo "2. ✏️  Edita el archivo .env:"
echo "   nano .env"
echo "   Reemplaza 'ghp_tu_token_aqui' con tu token real"
echo ""
echo "3. 🎯 Configura Cursor:"
echo "   - Abre Cursor"
echo "   - Ve a Settings (Cmd/Ctrl + ,)"
echo "   - Busca 'MCP' o 'Model Context Protocol'"
echo "   - Copia el contenido de cursor-config.json"
echo ""
echo "4. 🧪 Prueba la configuración:"
echo "   npm run dev"
echo ""
echo "📁 Archivos de configuración creados:"
echo "   - .env (variables de entorno)"
echo "   - cursor-config.json (configuración para Cursor)"
echo "   - CURSOR_SETUP.md (guía detallada)"
echo ""
echo "🎉 ¡Configuración completada! Sigue los pasos arriba para finalizar."
