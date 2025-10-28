/**
 * Calculadora con operaciones matemáticas básicas y avanzadas
 * @param expression - Expresión matemática a evaluar
 * @returns Resultado de la operación
 */
export function calculate(expression: string): number {
  // Limpiar la expresión
  const cleanExpression = expression.replace(/\s+/g, '');
  
  // Validar caracteres permitidos
  if (!/^[0-9+\-*/.()\s]+$/.test(cleanExpression)) {
    throw new Error('Expresión inválida. Solo se permiten números y operadores básicos (+, -, *, /, paréntesis)');
  }
  
  try {
    // Evaluar la expresión de forma segura
    const result = evaluateExpression(cleanExpression);
    return result;
  } catch (error) {
    throw new Error(`Error al calcular: ${error instanceof Error ? error.message : 'Expresión inválida'}`);
  }
}

/**
 * Evalúa una expresión matemática de forma segura
 * @param expression - Expresión a evaluar
 * @returns Resultado numérico
 */
function evaluateExpression(expression: string): number {
  // Reemplazar operadores para evaluación
  let expr = expression
    .replace(/\*/g, '*')
    .replace(/\//g, '/');
  
  // Validar paréntesis balanceados
  let parenCount = 0;
  for (const char of expr) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) throw new Error('Paréntesis no balanceados');
  }
  if (parenCount !== 0) throw new Error('Paréntesis no balanceados');
  
  // Evaluar usando Function constructor (más seguro que eval)
  const sanitizedExpr = expr.replace(/[^0-9+\-*/.()\s]/g, '');
  
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + sanitizedExpr)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Resultado no es un número válido');
    }
    
    return result;
  } catch (error) {
    throw new Error('Expresión matemática inválida');
  }
}

/**
 * Calcula el porcentaje de un número
 * @param value - Valor base
 * @param percentage - Porcentaje a calcular
 * @returns Resultado del porcentaje
 */
export function calculatePercentage(value: number, percentage: number): number {
  return (value * percentage) / 100;
}

/**
 * Calcula la raíz cuadrada de un número
 * @param value - Valor para calcular la raíz
 * @returns Raíz cuadrada
 */
export function calculateSquareRoot(value: number): number {
  if (value < 0) {
    throw new Error('No se puede calcular la raíz cuadrada de un número negativo');
  }
  return Math.sqrt(value);
}

/**
 * Calcula la potencia de un número
 * @param base - Base
 * @param exponent - Exponente
 * @returns Resultado de la potencia
 */
export function calculatePower(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

/**
 * Calcula el área de un círculo
 * @param radius - Radio del círculo
 * @returns Área del círculo
 */
export function calculateCircleArea(radius: number): number {
  if (radius < 0) {
    throw new Error('El radio no puede ser negativo');
  }
  return Math.PI * radius * radius;
}

/**
 * Calcula el área de un rectángulo
 * @param width - Ancho
 * @param height - Alto
 * @returns Área del rectángulo
 */
export function calculateRectangleArea(width: number, height: number): number {
  if (width < 0 || height < 0) {
    throw new Error('Las dimensiones no pueden ser negativas');
  }
  return width * height;
}

/**
 * Calcula el área de un triángulo
 * @param base - Base del triángulo
 * @param height - Altura del triángulo
 * @returns Área del triángulo
 */
export function calculateTriangleArea(base: number, height: number): number {
  if (base < 0 || height < 0) {
    throw new Error('Las dimensiones no pueden ser negativas');
  }
  return (base * height) / 2;
}

/**
 * Convierte grados a radianes
 * @param degrees - Grados
 * @returns Radianes
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convierte radianes a grados
 * @param radians - Radianes
 * @returns Grados
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calcula funciones trigonométricas
 * @param angle - Ángulo en grados
 * @param function - Función trigonométrica (sin, cos, tan)
 * @returns Resultado de la función trigonométrica
 */
export function calculateTrigonometric(angle: number, trigFunction: 'sin' | 'cos' | 'tan'): number {
  const radians = degreesToRadians(angle);
  
  switch (trigFunction) {
    case 'sin':
      return Math.sin(radians);
    case 'cos':
      return Math.cos(radians);
    case 'tan':
      return Math.tan(radians);
    default:
      throw new Error('Función trigonométrica no válida');
  }
}
