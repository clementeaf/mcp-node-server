#!/bin/bash

echo "🚀 Desplegando MCP Server en AWS Lambda..."

# Verificar que las variables de entorno estén configuradas
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN no está configurado"
    echo "   Ejecuta: export GITHUB_TOKEN=tu_token_aqui"
    exit 1
fi

if [ -z "$GITLAB_TOKEN" ]; then
    echo "⚠️  Advertencia: GITLAB_TOKEN no está configurado (opcional)"
fi

# Compilar el proyecto
echo "📦 Compilando proyecto..."
npm run build

# Verificar que la compilación fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

# Desplegar en Lambda
echo "☁️  Desplegando en AWS Lambda..."
npm run lambda:deploy

if [ $? -eq 0 ]; then
    echo "✅ ¡Despliegue exitoso!"
    echo "🔗 Tu servidor MCP está disponible en AWS Lambda"
    echo "📋 Usa 'serverless info' para ver la URL del endpoint"
else
    echo "❌ Error en el despliegue"
    exit 1
fi
