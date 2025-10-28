/**
 * Prueba un endpoint de API
 * @param {string} url - URL del endpoint
 * @param {string} method - Método HTTP
 * @param {Object} headers - Headers HTTP
 * @param {string} body - Cuerpo de la petición
 * @param {number} timeout - Timeout en segundos
 * @returns {Object} Resultado de la prueba
 */
async function testApiEndpoint(url, method, headers = {}, body = null, timeout = 10) {
  const startTime = Date.now();
  
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-API-Tester/1.0.0',
        ...headers
      },
      signal: AbortSignal.timeout(timeout * 1000)
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = body;
    }
    
    const response = await fetch(url, options);
    const endTime = Date.now();
    
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      size: JSON.stringify(responseBody).length
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      error: error.message,
      responseTime: endTime - startTime,
      type: error.name
    };
  }
}

/**
 * Obtiene información de paquetes NPM
 * @param {string} packageName - Nombre del paquete
 * @param {string} version - Versión específica
 * @param {string} infoType - Tipo de información
 * @returns {Object} Información del paquete
 */
async function getNpmPackageInfo(packageName, version = 'latest', infoType = 'basic') {
  try {
    const versionToUse = version === 'latest' ? '' : `/${version}`;
    const response = await fetch(`https://registry.npmjs.org/${packageName}${versionToUse}`);
    
    if (!response.ok) {
      throw new Error(`Package not found: ${packageName}`);
    }
    
    const data = await response.json();
    
    switch (infoType) {
      case 'basic':
        return {
          name: data.name,
          version: data.version,
          description: data.description,
          homepage: data.homepage,
          repository: data.repository,
          license: data.license,
          author: data.author,
          keywords: data.keywords,
          downloads: data.downloads
        };
      
      case 'dependencies':
        return {
          dependencies: data.dependencies || {},
          devDependencies: data.devDependencies || {},
          peerDependencies: data.peerDependencies || {},
          optionalDependencies: data.optionalDependencies || {}
        };
      
      case 'versions':
        return {
          versions: Object.keys(data.versions || {}),
          latest: data['dist-tags']?.latest,
          beta: data['dist-tags']?.beta,
          alpha: data['dist-tags']?.alpha
        };
      
      case 'security':
        // Simulación de análisis de seguridad básico
        const deps = data.dependencies || {};
        const securityIssues = [];
        
        // Verificar dependencias conocidas problemáticas
        const knownIssues = ['request', 'lodash', 'moment'];
        for (const dep of knownIssues) {
          if (deps[dep]) {
            securityIssues.push({
              package: dep,
              version: deps[dep],
              issue: 'Known security vulnerability',
              severity: 'medium'
            });
          }
        }
        
        return {
          securityIssues,
          totalDependencies: Object.keys(deps).length,
          hasSecurityIssues: securityIssues.length > 0
        };
      
      default:
        return data;
    }
  } catch (error) {
    return {
      error: error.message,
      success: false
    };
  }
}

/**
 * Prueba expresiones regulares
 * @param {string} pattern - Patrón regex
 * @param {string} testString - Texto de prueba
 * @param {string} flags - Flags de la regex
 * @returns {Object} Resultado de la prueba
 */
function testRegex(pattern, testString, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = testString.match(regex);
    const allMatches = [...testString.matchAll(regex)];
    
    return {
      success: true,
      pattern: pattern,
      flags: flags,
      testString: testString,
      matches: matches,
      allMatches: allMatches.map(m => ({
        match: m[0],
        groups: m.slice(1),
        index: m.index,
        input: m.input
      })),
      isMatch: regex.test(testString),
      lastIndex: regex.lastIndex
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      pattern: pattern,
      flags: flags
    };
  }
}

/**
 * Procesa JSON con diferentes acciones
 * @param {string} jsonString - Cadena JSON
 * @param {string} action - Acción a realizar
 * @returns {string} Resultado procesado
 */
function processJson(jsonString, action) {
  try {
    switch (action) {
      case 'validate':
        const parsed = JSON.parse(jsonString);
        return JSON.stringify({
          valid: true,
          keys: Object.keys(parsed),
          type: typeof parsed,
          size: JSON.stringify(parsed).length
        }, null, 2);
      
      case 'format':
      case 'beautify':
        return JSON.stringify(JSON.parse(jsonString), null, 2);
      
      case 'minify':
        return JSON.stringify(JSON.parse(jsonString));
      
      case 'extract_keys':
        const obj = JSON.parse(jsonString);
        const extractKeys = (obj, prefix = '') => {
          let keys = [];
          for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            keys.push(fullKey);
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              keys = keys.concat(extractKeys(obj[key], fullKey));
            }
          }
          return keys;
        };
        return JSON.stringify(extractKeys(obj), null, 2);
      
      default:
        throw new Error('Acción no válida');
    }
  } catch (error) {
    return JSON.stringify({
      error: error.message,
      valid: false
    }, null, 2);
  }
}

/**
 * Genera paletas de colores
 * @param {string} baseColor - Color base
 * @param {string} paletteType - Tipo de paleta
 * @param {number} count - Número de colores
 * @returns {Object} Paleta generada
 */
function generateColorPalette(baseColor, paletteType = 'monochromatic', count = 5) {
  // Convertir color base a HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  };
  
  const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  // Normalizar color base
  let normalizedColor = baseColor;
  if (!baseColor.startsWith('#')) {
    if (baseColor.startsWith('rgb')) {
      // Convertir RGB a hex
      const matches = baseColor.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        normalizedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    } else {
      // Mapeo de nombres de colores básicos
      const colorMap = {
        'red': '#FF0000', 'green': '#00FF00', 'blue': '#0000FF',
        'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500',
        'pink': '#FFC0CB', 'cyan': '#00FFFF', 'magenta': '#FF00FF'
      };
      normalizedColor = colorMap[baseColor.toLowerCase()] || '#FF0000';
    }
  }
  
  const [h, s, l] = hexToHsl(normalizedColor);
  const colors = [];
  
  switch (paletteType) {
    case 'monochromatic':
      for (let i = 0; i < count; i++) {
        const lightness = Math.max(10, Math.min(90, l + (i - Math.floor(count/2)) * 15));
        colors.push({
          hex: hslToHex(h, s, lightness),
          hsl: [h, s, lightness],
          name: `Color ${i + 1}`
        });
      }
      break;
    
    case 'complementary':
      colors.push({
        hex: hslToHex(h, s, l),
        hsl: [h, s, l],
        name: 'Base'
      });
      colors.push({
        hex: hslToHex((h + 180) % 360, s, l),
        hsl: [(h + 180) % 360, s, l],
        name: 'Complementary'
      });
      // Agregar variaciones
      for (let i = 2; i < count; i++) {
        const lightness = Math.max(20, Math.min(80, l + (i - 2) * 10));
        colors.push({
          hex: hslToHex(h, s, lightness),
          hsl: [h, s, lightness],
          name: `Variant ${i - 1}`
        });
      }
      break;
    
    case 'triadic':
      colors.push({
        hex: hslToHex(h, s, l),
        hsl: [h, s, l],
        name: 'Base'
      });
      colors.push({
        hex: hslToHex((h + 120) % 360, s, l),
        hsl: [(h + 120) % 360, s, l],
        name: 'Triadic 1'
      });
      colors.push({
        hex: hslToHex((h + 240) % 360, s, l),
        hsl: [(h + 240) % 360, s, l],
        name: 'Triadic 2'
      });
      break;
    
    case 'analogous':
      for (let i = 0; i < count; i++) {
        const hue = (h + (i - Math.floor(count/2)) * 30) % 360;
        colors.push({
          hex: hslToHex(hue, s, l),
          hsl: [hue, s, l],
          name: `Analogous ${i + 1}`
        });
      }
      break;
    
    case 'random':
      for (let i = 0; i < count; i++) {
        const randomHue = Math.random() * 360;
        const randomSaturation = Math.random() * 100;
        const randomLightness = Math.random() * 100;
        colors.push({
          hex: hslToHex(randomHue, randomSaturation, randomLightness),
          hsl: [randomHue, randomSaturation, randomLightness],
          name: `Random ${i + 1}`
        });
      }
      break;
  }
  
  return {
    baseColor: normalizedColor,
    paletteType: paletteType,
    count: colors.length,
    colors: colors,
    css: colors.map(c => `color: ${c.hex};`).join('\n')
  };
}

/**
 * Calcula una expresión matemática básica de forma segura
 * @param {string} expression - Expresión matemática
 * @returns {number} Resultado del cálculo
 */
function calculateBasic(expression) {
  // Limpiar la expresión
  const cleanExpression = expression.replace(/\s+/g, '');
  
  // Validar caracteres permitidos
  if (!/^[0-9+\-*/.()\s]+$/.test(cleanExpression)) {
    throw new Error('Expresión inválida. Solo se permiten números y operadores básicos (+, -, *, /, paréntesis)');
  }
  
  // Validar paréntesis balanceados
  let parenCount = 0;
  for (const char of cleanExpression) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) throw new Error('Paréntesis no balanceados');
  }
  if (parenCount !== 0) throw new Error('Paréntesis no balanceados');
  
  try {
    // Evaluar usando Function constructor (más seguro que eval)
    const sanitizedExpr = cleanExpression.replace(/[^0-9+\-*/.()\s]/g, '');
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
 * Handler simplificado con herramientas reales de GitHub y calculadora
 * @param {Object} event - Evento de Lambda
 * @param {Object} context - Contexto de Lambda
 * @returns {Object} Respuesta de la función
 */
export const handler = async (event, context) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Decodificar el body si está en Base64
    const bodyString = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    
    const body = JSON.parse(bodyString);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { method, params } = body;

    let result;
    if (method === 'tools/list') {
      result = {
        tools: [
          // Herramientas básicas
          {
            name: 'echo',
            description: 'Echo de vuelta el mensaje que se le pase',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'El mensaje a hacer echo',
                },
              },
              required: ['message'],
            },
          },
          {
            name: 'get_time',
            description: 'Obtiene la fecha y hora actual',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          // Herramientas de GitHub
          {
            name: 'github_get_user',
            description: 'Obtiene información del usuario autenticado de GitHub',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'github_get_repos',
            description: 'Obtiene los repositorios del usuario autenticado',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'github_get_repo',
            description: 'Obtiene información de un repositorio específico',
            inputSchema: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'Propietario del repositorio',
                },
                repo: {
                  type: 'string',
                  description: 'Nombre del repositorio',
                },
              },
              required: ['owner', 'repo'],
            },
          },
          // Herramientas de Calculadora
          {
            name: 'calculator_basic',
            description: 'Calculadora básica para operaciones matemáticas simples',
            inputSchema: {
              type: 'object',
              properties: {
                expression: {
                  type: 'string',
                  description: 'Expresión matemática (ej: "2 + 3 * 4", "(10 + 5) / 3")',
                },
              },
              required: ['expression'],
            },
          },
          {
            name: 'calculator_percentage',
            description: 'Calcula el porcentaje de un número',
            inputSchema: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                  description: 'Valor base',
                },
                percentage: {
                  type: 'number',
                  description: 'Porcentaje a calcular',
                },
              },
              required: ['value', 'percentage'],
            },
          },
          {
            name: 'calculator_sqrt',
            description: 'Calcula la raíz cuadrada de un número',
            inputSchema: {
              type: 'object',
              properties: {
                value: {
                  type: 'number',
                  description: 'Valor para calcular la raíz cuadrada',
                },
              },
              required: ['value'],
            },
          },
          {
            name: 'calculator_power',
            description: 'Calcula la potencia de un número',
            inputSchema: {
              type: 'object',
              properties: {
                base: {
                  type: 'number',
                  description: 'Base',
                },
                exponent: {
                  type: 'number',
                  description: 'Exponente',
                },
              },
              required: ['base', 'exponent'],
            },
          },
          {
            name: 'calculator_area_circle',
            description: 'Calcula el área de un círculo',
            inputSchema: {
              type: 'object',
              properties: {
                radius: {
                  type: 'number',
                  description: 'Radio del círculo',
                },
              },
              required: ['radius'],
            },
          },
          {
            name: 'calculator_area_rectangle',
            description: 'Calcula el área de un rectángulo',
            inputSchema: {
              type: 'object',
              properties: {
                width: {
                  type: 'number',
                  description: 'Ancho del rectángulo',
                },
                height: {
                  type: 'number',
                  description: 'Alto del rectángulo',
                },
              },
              required: ['width', 'height'],
            },
          },
          {
            name: 'calculator_area_triangle',
            description: 'Calcula el área de un triángulo',
            inputSchema: {
              type: 'object',
              properties: {
                base: {
                  type: 'number',
                  description: 'Base del triángulo',
                },
                height: {
                  type: 'number',
                  description: 'Altura del triángulo',
                },
              },
              required: ['base', 'height'],
            },
          },
          {
            name: 'calculator_trigonometric',
            description: 'Calcula funciones trigonométricas (sin, cos, tan)',
            inputSchema: {
              type: 'object',
              properties: {
                angle: {
                  type: 'number',
                  description: 'Ángulo en grados',
                },
                function: {
                  type: 'string',
                  enum: ['sin', 'cos', 'tan'],
                  description: 'Función trigonométrica',
                },
              },
              required: ['angle', 'function'],
            },
          },
          // Herramientas de Desarrollo Fullstack
          {
            name: 'api_endpoint_test',
            description: 'Prueba endpoints de API y valida respuestas',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL del endpoint a probar',
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                  description: 'Método HTTP',
                },
                headers: {
                  type: 'object',
                  description: 'Headers HTTP (opcional)',
                },
                body: {
                  type: 'string',
                  description: 'Cuerpo de la petición (opcional)',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout en segundos (opcional, default: 10)',
                },
              },
              required: ['url', 'method'],
            },
          },
          {
            name: 'npm_package_info',
            description: 'Obtiene información detallada de paquetes NPM',
            inputSchema: {
              type: 'object',
              properties: {
                package_name: {
                  type: 'string',
                  description: 'Nombre del paquete NPM',
                },
                version: {
                  type: 'string',
                  description: 'Versión específica (opcional, default: latest)',
                },
                info_type: {
                  type: 'string',
                  enum: ['basic', 'dependencies', 'security', 'versions'],
                  description: 'Tipo de información a obtener',
                },
              },
              required: ['package_name'],
            },
          },
          {
            name: 'regex_tester',
            description: 'Prueba y valida expresiones regulares',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  description: 'Expresión regular a probar',
                },
                test_string: {
                  type: 'string',
                  description: 'Texto de prueba',
                },
                flags: {
                  type: 'string',
                  description: 'Flags de la regex (g, i, m, s, u)',
                },
              },
              required: ['pattern', 'test_string'],
            },
          },
          {
            name: 'json_tools',
            description: 'Valida, formatea y manipula JSON',
            inputSchema: {
              type: 'object',
              properties: {
                json_string: {
                  type: 'string',
                  description: 'Cadena JSON a procesar',
                },
                action: {
                  type: 'string',
                  enum: ['validate', 'format', 'minify', 'beautify', 'extract_keys'],
                  description: 'Acción a realizar con el JSON',
                },
              },
              required: ['json_string', 'action'],
            },
          },
          {
            name: 'color_palette_generator',
            description: 'Genera paletas de colores y códigos CSS',
            inputSchema: {
              type: 'object',
              properties: {
                base_color: {
                  type: 'string',
                  description: 'Color base (hex, rgb, o nombre)',
                },
                palette_type: {
                  type: 'string',
                  enum: ['monochromatic', 'complementary', 'triadic', 'analogous', 'random'],
                  description: 'Tipo de paleta a generar',
                },
                count: {
                  type: 'number',
                  description: 'Número de colores en la paleta (opcional, default: 5)',
                },
              },
              required: ['base_color'],
            },
          },
        ],
      };
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      if (name === 'echo') {
        result = {
          content: [
            {
              type: 'text',
              text: `Echo: ${args.message}`,
            },
          ],
        };
      } else if (name === 'get_time') {
        result = {
          content: [
            {
              type: 'text',
              text: `Hora actual: ${new Date().toISOString()}`,
            },
          ],
        };
      } else if (name === 'github_get_user') {
        // Usar fetch para llamar a GitHub API directamente
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const user = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Usuario de GitHub:\n${JSON.stringify(user, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repos') {
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repos = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Repositorios del usuario:\n${JSON.stringify(repos, null, 2)}`,
            },
          ],
        };
      } else if (name === 'github_get_repo') {
        const response = await fetch(`https://api.github.com/repos/${args.owner}/${args.repo}`, {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'MCP-GitHub-Server/1.0.0',
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repo = await response.json();
        result = {
          content: [
            {
              type: 'text',
              text: `Información del repositorio:\n${JSON.stringify(repo, null, 2)}`,
            },
          ],
        };
      } else if (name === 'calculator_basic') {
        const resultValue = calculateBasic(args.expression);
        result = {
          content: [
            {
              type: 'text',
              text: `Resultado: ${args.expression} = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_percentage') {
        const resultValue = (args.value * args.percentage) / 100;
        result = {
          content: [
            {
              type: 'text',
              text: `${args.percentage}% de ${args.value} = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_sqrt') {
        if (args.value < 0) {
          throw new Error('No se puede calcular la raíz cuadrada de un número negativo');
        }
        const resultValue = Math.sqrt(args.value);
        result = {
          content: [
            {
              type: 'text',
              text: `√${args.value} = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_power') {
        const resultValue = Math.pow(args.base, args.exponent);
        result = {
          content: [
            {
              type: 'text',
              text: `${args.base}^${args.exponent} = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_area_circle') {
        if (args.radius < 0) {
          throw new Error('El radio no puede ser negativo');
        }
        const resultValue = Math.PI * args.radius * args.radius;
        result = {
          content: [
            {
              type: 'text',
              text: `Área del círculo (radio ${args.radius}) = ${resultValue.toFixed(4)}`,
            },
          ],
        };
      } else if (name === 'calculator_area_rectangle') {
        if (args.width < 0 || args.height < 0) {
          throw new Error('Las dimensiones no pueden ser negativas');
        }
        const resultValue = args.width * args.height;
        result = {
          content: [
            {
              type: 'text',
              text: `Área del rectángulo (${args.width} × ${args.height}) = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_area_triangle') {
        if (args.base < 0 || args.height < 0) {
          throw new Error('Las dimensiones no pueden ser negativas');
        }
        const resultValue = (args.base * args.height) / 2;
        result = {
          content: [
            {
              type: 'text',
              text: `Área del triángulo (base ${args.base}, altura ${args.height}) = ${resultValue}`,
            },
          ],
        };
      } else if (name === 'calculator_trigonometric') {
        const radians = (args.angle * Math.PI) / 180;
        let resultValue;
        switch (args.function) {
          case 'sin':
            resultValue = Math.sin(radians);
            break;
          case 'cos':
            resultValue = Math.cos(radians);
            break;
          case 'tan':
            resultValue = Math.tan(radians);
            break;
          default:
            throw new Error('Función trigonométrica no válida');
        }
        result = {
          content: [
            {
              type: 'text',
              text: `${args.function}(${args.angle}°) = ${resultValue.toFixed(6)}`,
            },
          ],
        };
      } else if (name === 'api_endpoint_test') {
        const testResult = await testApiEndpoint(args.url, args.method, args.headers, args.body, args.timeout);
        result = {
          content: [
            {
              type: 'text',
              text: `🚀 API Test Result:\n${JSON.stringify(testResult, null, 2)}`,
            },
          ],
        };
      } else if (name === 'npm_package_info') {
        const packageInfo = await getNpmPackageInfo(args.package_name, args.version, args.info_type);
        result = {
          content: [
            {
              type: 'text',
              text: `📦 NPM Package Info:\n${JSON.stringify(packageInfo, null, 2)}`,
            },
          ],
        };
      } else if (name === 'regex_tester') {
        const regexResult = testRegex(args.pattern, args.test_string, args.flags);
        result = {
          content: [
            {
              type: 'text',
              text: `🔍 Regex Test Result:\n${JSON.stringify(regexResult, null, 2)}`,
            },
          ],
        };
      } else if (name === 'json_tools') {
        const jsonResult = processJson(args.json_string, args.action);
        result = {
          content: [
            {
              type: 'text',
              text: `📄 JSON ${args.action} Result:\n${jsonResult}`,
            },
          ],
        };
      } else if (name === 'color_palette_generator') {
        const palette = generateColorPalette(args.base_color, args.palette_type, args.count);
        result = {
          content: [
            {
              type: 'text',
              text: `🎨 Color Palette:\n${JSON.stringify(palette, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Herramienta desconocida: ${name}`);
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unknown method' }),
      };
    }

    const response = {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: body.id || 1,
        result: result
      }),
    };
    
    console.log('Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: event.body?.id || 1,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      }),
    };
  }
};
