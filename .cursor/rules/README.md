# Reglas de Desarrollo - APLICACIÓN AUTOMÁTICA

Este directorio contiene las reglas y estándares de desarrollo para el proyecto MCP Node Server.

**IMPORTANTE**: Estas reglas se aplican AUTOMÁTICAMENTE en cada solicitud de código, sin necesidad de mencionarlas explícitamente.

## Archivos de Reglas

### 1. `development-standards.md`
Principios fundamentales de desarrollo:
- Principios SOLID, DRY y YAGNI
- Tipado estricto
- Archivos limpios
- Desarrollo de funciones

### 2. `typescript-rules.md`
Reglas específicas de TypeScript:
- Prohibición de `any` e `implicit any`
- Configuración estricta
- Tipado de funciones
- Interfaces y tipos

### 3. `code-quality.md`
Estándares de calidad de código:
- Documentación con JSDoc
- Prohibición de emojis
- Desarrollo de funciones completas
- Prohibición de TODOs

### 4. `auto-apply.md`
Configuración para aplicación automática:
- Instrucciones específicas para Cursor
- Comportamiento esperado del asistente
- Verificación automática

## Aplicación Automática

Las reglas se aplican automáticamente cuando:
- Se solicita código nuevo
- Se modifica código existente
- Se refactoriza código
- Se resuelven problemas de código

## Herramientas de Verificación

- **TypeScript**: `tsc --noEmit` para verificación de tipos
- **ESLint**: Reglas estrictas de TypeScript
- **Pre-commit hooks**: Verificación automática
- **Asistente IA**: Aplicación automática de reglas

## Contacto

Para dudas o sugerencias sobre las reglas, contactar al equipo de desarrollo.
