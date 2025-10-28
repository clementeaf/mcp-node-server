# Implementación de Herramientas MCP para Trading Bot

## Resumen

Este documento proporciona ejemplos específicos de código para implementar las herramientas MCP necesarias para el bot de trading, basándose en la estrategia definida en `TRADING_BOT_STRATEGY.md`.

## 1. Estructura de Archivos Propuesta

```
src/
├── index.ts                 # Servidor MCP principal (existente)
├── github.ts               # Herramientas GitHub (existente)
├── gitlab.ts               # Herramientas GitLab (existente)
├── trading/                # Nuevo módulo de trading
│   ├── market-data.ts      # Adquisición de datos de mercado
│   ├── technical-analysis.ts # Análisis técnico
│   ├── trading-strategies.ts # Estrategias de trading
│   ├── risk-management.ts  # Gestión de riesgos
│   ├── order-execution.ts  # Ejecución de órdenes
│   └── types.ts           # Tipos TypeScript
└── utils/
    ├── database.ts         # Conexión a base de datos
    └── logger.ts          # Sistema de logging
```

## 2. Tipos TypeScript

```typescript
// src/trading/types.ts

export interface MarketData {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timeframe: string;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  sma: number[];
  ema: number[];
}

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: number;
  strategy: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  timestamp: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  timestamp: number;
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  startDate: string;
  endDate: string;
}
```

## 3. Herramientas MCP de Adquisición de Datos

```typescript
// src/trading/market-data.ts

import axios from 'axios';
import { MarketData } from './types.js';

export class MarketDataProvider {
  private binanceApiUrl = 'https://api.binance.com/api/v3';
  private coinbaseApiUrl = 'https://api.exchange.coinbase.com';

  /**
   * Obtiene datos de mercado en tiempo real desde Binance
   * @param symbol - Símbolo del activo (ej: BTCUSDT)
   * @param timeframe - Marco temporal (1m, 5m, 1h, 1d)
   * @param limit - Número de velas a obtener
   * @returns Array de datos de mercado
   */
  async getBinanceKlines(
    symbol: string, 
    timeframe: string = '1h', 
    limit: number = 100
  ): Promise<MarketData[]> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/klines`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: timeframe,
          limit
        }
      });

      return response.data.map((kline: any[]) => ({
        symbol: symbol.toUpperCase(),
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        timeframe
      }));
    } catch (error) {
      throw new Error(`Error obteniendo datos de Binance: ${error}`);
    }
  }

  /**
   * Obtiene precio actual de un símbolo
   * @param symbol - Símbolo del activo
   * @returns Precio actual
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return parseFloat(response.data.price);
    } catch (error) {
      throw new Error(`Error obteniendo precio actual: ${error}`);
    }
  }

  /**
   * Obtiene datos de orden book
   * @param symbol - Símbolo del activo
   * @param limit - Número de niveles (5, 10, 20, 50, 100, 500, 1000, 5000)
   * @returns Orden book
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/depth`, {
        params: {
          symbol: symbol.toUpperCase(),
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo orden book: ${error}`);
    }
  }

  /**
   * Obtiene estadísticas de 24h
   * @param symbol - Símbolo del activo
   * @returns Estadísticas de 24h
   */
  async get24hrStats(symbol: string): Promise<any> {
    try {
      const response = await axios.get(`${this.binanceApiUrl}/ticker/24hr`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas 24h: ${error}`);
    }
  }
}

// Funciones para usar en MCP
export async function getMarketData(
  symbol: string, 
  timeframe: string = '1h', 
  limit: number = 100
): Promise<MarketData[]> {
  const provider = new MarketDataProvider();
  return await provider.getBinanceKlines(symbol, timeframe, limit);
}

export async function getCurrentPrice(symbol: string): Promise<number> {
  const provider = new MarketDataProvider();
  return await provider.getCurrentPrice(symbol);
}

export async function getOrderBook(symbol: string, limit: number = 100): Promise<any> {
  const provider = new MarketDataProvider();
  return await provider.getOrderBook(symbol, limit);
}

export async function get24hrStats(symbol: string): Promise<any> {
  const provider = new MarketDataProvider();
  return await provider.get24hrStats(symbol);
}
```

## 4. Herramientas MCP de Análisis Técnico

```typescript
// src/trading/technical-analysis.ts

import { MarketData, TechnicalIndicators } from './types.js';

export class TechnicalAnalysis {
  /**
   * Calcula RSI (Relative Strength Index)
   * @param prices - Array de precios de cierre
   * @param period - Período para cálculo (default: 14)
   * @returns Valor RSI
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error(`Se necesitan al menos ${period + 1} precios para calcular RSI`);
    }

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = this.calculateSMA(gains.slice(0, period), period);
    const avgLoss = this.calculateSMA(losses.slice(0, period), period);

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calcula MACD (Moving Average Convergence Divergence)
   * @param prices - Array de precios de cierre
   * @param fastPeriod - Período rápido (default: 12)
   * @param slowPeriod - Período lento (default: 26)
   * @param signalPeriod - Período de señal (default: 9)
   * @returns Objeto con MACD, señal e histograma
   */
  calculateMACD(
    prices: number[], 
    fastPeriod: number = 12, 
    slowPeriod: number = 26, 
    signalPeriod: number = 9
  ): { macd: number; signal: number; histogram: number } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macdLine = fastEMA - slowEMA;
    
    // Calcular señal (EMA del MACD)
    const signalLine = this.calculateEMA([macdLine], signalPeriod);
    const histogram = macdLine - signalLine;

    return {
      macd: macdLine,
      signal: signalLine,
      histogram
    };
  }

  /**
   * Calcula Bollinger Bands
   * @param prices - Array de precios de cierre
   * @param period - Período (default: 20)
   * @param stdDev - Desviación estándar (default: 2)
   * @returns Objeto con bandas superior, media e inferior
   */
  calculateBollingerBands(
    prices: number[], 
    period: number = 20, 
    stdDev: number = 2
  ): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const variance = this.calculateVariance(prices.slice(-period), sma);
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  /**
   * Calcula Simple Moving Average (SMA)
   * @param prices - Array de precios
   * @param period - Período
   * @returns SMA
   */
  calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) {
      throw new Error(`Se necesitan al menos ${period} precios para calcular SMA`);
    }
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  /**
   * Calcula Exponential Moving Average (EMA)
   * @param prices - Array de precios
   * @param period - Período
   * @returns EMA
   */
  calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      throw new Error(`Se necesitan al menos ${period} precios para calcular EMA`);
    }

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * Calcula todos los indicadores técnicos
   * @param marketData - Datos de mercado
   * @returns Objeto con todos los indicadores
   */
  calculateAllIndicators(marketData: MarketData[]): TechnicalIndicators {
    const prices = marketData.map(candle => candle.close);
    
    return {
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices),
      sma: [
        this.calculateSMA(prices, 20),
        this.calculateSMA(prices, 50),
        this.calculateSMA(prices, 200)
      ],
      ema: [
        this.calculateEMA(prices, 12),
        this.calculateEMA(prices, 26),
        this.calculateEMA(prices, 50)
      ]
    };
  }

  private calculateVariance(prices: number[], mean: number): number {
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    return squaredDiffs.reduce((acc, diff) => acc + diff, 0) / prices.length;
  }
}

// Funciones para usar en MCP
export async function calculateRSI(prices: number[], period: number = 14): Promise<number> {
  const ta = new TechnicalAnalysis();
  return ta.calculateRSI(prices, period);
}

export async function calculateMACD(
  prices: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): Promise<{ macd: number; signal: number; histogram: number }> {
  const ta = new TechnicalAnalysis();
  return ta.calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);
}

export async function calculateBollingerBands(
  prices: number[], 
  period: number = 20, 
  stdDev: number = 2
): Promise<{ upper: number; middle: number; lower: number }> {
  const ta = new TechnicalAnalysis();
  return ta.calculateBollingerBands(prices, period, stdDev);
}
```

## 5. Herramientas MCP de Estrategias de Trading

```typescript
// src/trading/trading-strategies.ts

import { MarketData, TechnicalIndicators, TradingSignal } from './types.js';
import { TechnicalAnalysis } from './technical-analysis.js';

export class TradingStrategies {
  private ta: TechnicalAnalysis;

  constructor() {
    this.ta = new TechnicalAnalysis();
  }

  /**
   * Estrategia de Mean Reversion basada en RSI
   * @param marketData - Datos de mercado
   * @param rsiOversold - Nivel RSI de sobreventa (default: 30)
   * @param rsiOverbought - Nivel RSI de sobrecompra (default: 70)
   * @returns Señal de trading
   */
  meanReversionStrategy(
    marketData: MarketData[], 
    rsiOversold: number = 30, 
    rsiOverbought: number = 70
  ): TradingSignal {
    const prices = marketData.map(candle => candle.close);
    const rsi = this.ta.calculateRSI(prices);
    const currentPrice = prices[prices.length - 1];
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (rsi < rsiOversold) {
      action = 'BUY';
      confidence = Math.min(0.9, (rsiOversold - rsi) / rsiOversold);
    } else if (rsi > rsiOverbought) {
      action = 'SELL';
      confidence = Math.min(0.9, (rsi - rsiOverbought) / (100 - rsiOverbought));
    }

    return {
      symbol: marketData[0].symbol,
      action,
      confidence,
      price: currentPrice,
      stopLoss: action === 'BUY' ? currentPrice * 0.95 : currentPrice * 1.05,
      takeProfit: action === 'BUY' ? currentPrice * 1.1 : currentPrice * 0.9,
      timestamp: Date.now(),
      strategy: 'mean_reversion'
    };
  }

  /**
   * Estrategia de Momentum basada en MACD
   * @param marketData - Datos de mercado
   * @returns Señal de trading
   */
  momentumStrategy(marketData: MarketData[]): TradingSignal {
    const prices = marketData.map(candle => candle.close);
    const macd = this.ta.calculateMACD(prices);
    const currentPrice = prices[prices.length - 1];
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (macd.macd > macd.signal && macd.histogram > 0) {
      action = 'BUY';
      confidence = Math.min(0.9, Math.abs(macd.histogram) * 10);
    } else if (macd.macd < macd.signal && macd.histogram < 0) {
      action = 'SELL';
      confidence = Math.min(0.9, Math.abs(macd.histogram) * 10);
    }

    return {
      symbol: marketData[0].symbol,
      action,
      confidence,
      price: currentPrice,
      stopLoss: action === 'BUY' ? currentPrice * 0.97 : currentPrice * 1.03,
      takeProfit: action === 'BUY' ? currentPrice * 1.05 : currentPrice * 0.95,
      timestamp: Date.now(),
      strategy: 'momentum'
    };
  }

  /**
   * Estrategia de Bollinger Bands
   * @param marketData - Datos de mercado
   * @returns Señal de trading
   */
  bollingerBandsStrategy(marketData: MarketData[]): TradingSignal {
    const prices = marketData.map(candle => candle.close);
    const bollinger = this.ta.calculateBollingerBands(prices);
    const currentPrice = prices[prices.length - 1];
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (currentPrice <= bollinger.lower) {
      action = 'BUY';
      confidence = Math.min(0.9, (bollinger.lower - currentPrice) / bollinger.lower);
    } else if (currentPrice >= bollinger.upper) {
      action = 'SELL';
      confidence = Math.min(0.9, (currentPrice - bollinger.upper) / bollinger.upper);
    }

    return {
      symbol: marketData[0].symbol,
      action,
      confidence,
      price: currentPrice,
      stopLoss: action === 'BUY' ? bollinger.lower * 0.98 : bollinger.upper * 1.02,
      takeProfit: action === 'BUY' ? bollinger.middle : bollinger.middle,
      timestamp: Date.now(),
      strategy: 'bollinger_bands'
    };
  }

  /**
   * Estrategia combinada que usa múltiples indicadores
   * @param marketData - Datos de mercado
   * @returns Señal de trading
   */
  combinedStrategy(marketData: MarketData[]): TradingSignal {
    const meanReversion = this.meanReversionStrategy(marketData);
    const momentum = this.momentumStrategy(marketData);
    const bollinger = this.bollingerBandsStrategy(marketData);

    // Ponderar las señales
    const signals = [meanReversion, momentum, bollinger];
    const buySignals = signals.filter(s => s.action === 'BUY');
    const sellSignals = signals.filter(s => s.action === 'SELL');

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;

    if (buySignals.length >= 2) {
      action = 'BUY';
      confidence = buySignals.reduce((acc, s) => acc + s.confidence, 0) / buySignals.length;
    } else if (sellSignals.length >= 2) {
      action = 'SELL';
      confidence = sellSignals.reduce((acc, s) => acc + s.confidence, 0) / sellSignals.length;
    }

    return {
      symbol: marketData[0].symbol,
      action,
      confidence,
      price: meanReversion.price,
      stopLoss: action === 'BUY' ? meanReversion.price * 0.95 : meanReversion.price * 1.05,
      takeProfit: action === 'BUY' ? meanReversion.price * 1.1 : meanReversion.price * 0.9,
      timestamp: Date.now(),
      strategy: 'combined'
    };
  }
}

// Funciones para usar en MCP
export async function generateTradingSignal(
  symbol: string,
  strategy: string,
  marketData: MarketData[]
): Promise<TradingSignal> {
  const strategies = new TradingStrategies();
  
  switch (strategy) {
    case 'mean_reversion':
      return strategies.meanReversionStrategy(marketData);
    case 'momentum':
      return strategies.momentumStrategy(marketData);
    case 'bollinger_bands':
      return strategies.bollingerBandsStrategy(marketData);
    case 'combined':
      return strategies.combinedStrategy(marketData);
    default:
      throw new Error(`Estrategia no soportada: ${strategy}`);
  }
}
```

## 6. Herramientas MCP de Gestión de Riesgos

```typescript
// src/trading/risk-management.ts

import { Position, TradingSignal, Order } from './types.js';

export class RiskManager {
  private maxPositionSize: number;
  private maxDailyLoss: number;
  private maxDrawdown: number;
  private currentPositions: Map<string, Position> = new Map();
  private dailyPnL: number = 0;

  constructor(
    maxPositionSize: number = 0.1, // 10% del capital por posición
    maxDailyLoss: number = 0.05,   // 5% pérdida máxima diaria
    maxDrawdown: number = 0.15     // 15% drawdown máximo
  ) {
    this.maxPositionSize = maxPositionSize;
    this.maxDailyLoss = maxDailyLoss;
    this.maxDrawdown = maxDrawdown;
  }

  /**
   * Valida si una señal de trading puede ser ejecutada
   * @param signal - Señal de trading
   * @param accountBalance - Balance de la cuenta
   * @returns true si la señal es válida
   */
  validateTrade(signal: TradingSignal, accountBalance: number): boolean {
    // Verificar si ya existe una posición para este símbolo
    if (this.currentPositions.has(signal.symbol)) {
      return false;
    }

    // Verificar límite de pérdida diaria
    if (this.dailyPnL < -this.maxDailyLoss * accountBalance) {
      return false;
    }

    // Verificar drawdown máximo
    const totalPnL = Array.from(this.currentPositions.values())
      .reduce((acc, pos) => acc + pos.pnl, 0);
    
    if (totalPnL < -this.maxDrawdown * accountBalance) {
      return false;
    }

    // Verificar confianza mínima
    if (signal.confidence < 0.6) {
      return false;
    }

    return true;
  }

  /**
   * Calcula el tamaño de posición basado en el riesgo
   * @param signal - Señal de trading
   * @param accountBalance - Balance de la cuenta
   * @param riskPerTrade - Riesgo por trade (default: 2%)
   * @returns Tamaño de posición
   */
  calculatePositionSize(
    signal: TradingSignal, 
    accountBalance: number, 
    riskPerTrade: number = 0.02
  ): number {
    const riskAmount = accountBalance * riskPerTrade;
    const stopLossDistance = Math.abs(signal.price - signal.stopLoss);
    const positionSize = riskAmount / stopLossDistance;
    
    // Limitar al máximo de posición permitida
    const maxPositionValue = accountBalance * this.maxPositionSize;
    const maxPositionSize = maxPositionValue / signal.price;
    
    return Math.min(positionSize, maxPositionSize);
  }

  /**
   * Actualiza stop loss basado en volatilidad
   * @param position - Posición a actualizar
   * @param currentPrice - Precio actual
   * @param volatility - Volatilidad del activo
   */
  updateStopLoss(position: Position, currentPrice: number, volatility: number): void {
    const atrMultiplier = 2; // Multiplicador ATR para stop loss
    const stopDistance = volatility * atrMultiplier;
    
    if (position.side === 'LONG') {
      position.stopLoss = Math.max(
        position.stopLoss,
        currentPrice - stopDistance
      );
    } else {
      position.stopLoss = Math.min(
        position.stopLoss,
        currentPrice + stopDistance
      );
    }
  }

  /**
   * Verifica correlaciones entre posiciones
   * @param newSymbol - Nuevo símbolo a agregar
   * @param existingPositions - Posiciones existentes
   * @returns Alertas de riesgo
   */
  checkCorrelations(newSymbol: string, existingPositions: Position[]): string[] {
    const alerts: string[] = [];
    
    // Verificar correlación alta con posiciones existentes
    const correlatedSymbols = this.getCorrelatedSymbols(newSymbol);
    const existingSymbols = existingPositions.map(p => p.symbol);
    
    const highCorrelation = correlatedSymbols.some(symbol => 
      existingSymbols.includes(symbol)
    );
    
    if (highCorrelation) {
      alerts.push(`Alta correlación detectada para ${newSymbol}`);
    }
    
    // Verificar concentración en un sector
    const sectorConcentration = this.checkSectorConcentration([
      ...existingSymbols, 
      newSymbol
    ]);
    
    if (sectorConcentration > 0.5) {
      alerts.push(`Concentración alta en sector: ${sectorConcentration * 100}%`);
    }
    
    return alerts;
  }

  /**
   * Obtiene símbolos correlacionados (simulado)
   * @param symbol - Símbolo base
   * @returns Array de símbolos correlacionados
   */
  private getCorrelatedSymbols(symbol: string): string[] {
    // En implementación real, esto vendría de análisis de correlación
    const correlations: { [key: string]: string[] } = {
      'BTCUSDT': ['ETHUSDT', 'BNBUSDT'],
      'ETHUSDT': ['BTCUSDT', 'ADAUSDT'],
      'AAPL': ['MSFT', 'GOOGL'],
      'MSFT': ['AAPL', 'GOOGL']
    };
    
    return correlations[symbol] || [];
  }

  /**
   * Verifica concentración en sector
   * @param symbols - Array de símbolos
   * @returns Porcentaje de concentración
   */
  private checkSectorConcentration(symbols: string[]): number {
    // En implementación real, esto vendría de clasificación de sectores
    const sectors: { [key: string]: string } = {
      'BTCUSDT': 'crypto',
      'ETHUSDT': 'crypto',
      'BNBUSDT': 'crypto',
      'AAPL': 'tech',
      'MSFT': 'tech',
      'GOOGL': 'tech'
    };
    
    const sectorCounts: { [key: string]: number } = {};
    symbols.forEach(symbol => {
      const sector = sectors[symbol] || 'other';
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    
    const maxSectorCount = Math.max(...Object.values(sectorCounts));
    return maxSectorCount / symbols.length;
  }
}

// Funciones para usar en MCP
export async function validateTrade(
  signal: TradingSignal,
  accountBalance: number
): Promise<boolean> {
  const riskManager = new RiskManager();
  return riskManager.validateTrade(signal, accountBalance);
}

export async function calculatePositionSize(
  signal: TradingSignal,
  accountBalance: number,
  riskPerTrade: number = 0.02
): Promise<number> {
  const riskManager = new RiskManager();
  return riskManager.calculatePositionSize(signal, accountBalance, riskPerTrade);
}
```

## 7. Herramientas MCP de Ejecución de Órdenes

```typescript
// src/trading/order-execution.ts

import { Order, Position, TradingSignal } from './types.js';

export class OrderExecutor {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(apiKey: string, secretKey: string, baseUrl: string = 'https://api.binance.com') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Ejecuta una orden de compra
   * @param signal - Señal de trading
   * @param quantity - Cantidad a comprar
   * @returns Orden ejecutada
   */
  async executeBuyOrder(signal: TradingSignal, quantity: number): Promise<Order> {
    const order: Order = {
      id: this.generateOrderId(),
      symbol: signal.symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity,
      status: 'PENDING',
      timestamp: Date.now()
    };

    try {
      // En implementación real, aquí se haría la llamada a la API del exchange
      const response = await this.placeOrder(order);
      
      order.status = response.status === 'FILLED' ? 'FILLED' : 'REJECTED';
      return order;
    } catch (error) {
      order.status = 'REJECTED';
      throw new Error(`Error ejecutando orden de compra: ${error}`);
    }
  }

  /**
   * Ejecuta una orden de venta
   * @param signal - Señal de trading
   * @param quantity - Cantidad a vender
   * @returns Orden ejecutada
   */
  async executeSellOrder(signal: TradingSignal, quantity: number): Promise<Order> {
    const order: Order = {
      id: this.generateOrderId(),
      symbol: signal.symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity,
      status: 'PENDING',
      timestamp: Date.now()
    };

    try {
      const response = await this.placeOrder(order);
      
      order.status = response.status === 'FILLED' ? 'FILLED' : 'REJECTED';
      return order;
    } catch (error) {
      order.status = 'REJECTED';
      throw new Error(`Error ejecutando orden de venta: ${error}`);
    }
  }

  /**
   * Coloca una orden stop loss
   * @param position - Posición a proteger
   * @param stopPrice - Precio de stop loss
   * @returns Orden de stop loss
   */
  async placeStopLoss(position: Position, stopPrice: number): Promise<Order> {
    const order: Order = {
      id: this.generateOrderId(),
      symbol: position.symbol,
      side: position.side === 'LONG' ? 'SELL' : 'BUY',
      type: 'STOP',
      quantity: position.size,
      stopPrice,
      status: 'PENDING',
      timestamp: Date.now()
    };

    try {
      const response = await this.placeOrder(order);
      order.status = response.status === 'FILLED' ? 'FILLED' : 'REJECTED';
      return order;
    } catch (error) {
      order.status = 'REJECTED';
      throw new Error(`Error colocando stop loss: ${error}`);
    }
  }

  /**
   * Coloca una orden take profit
   * @param position - Posición a cerrar
   * @param limitPrice - Precio límite
   * @returns Orden de take profit
   */
  async placeTakeProfit(position: Position, limitPrice: number): Promise<Order> {
    const order: Order = {
      id: this.generateOrderId(),
      symbol: position.symbol,
      side: position.side === 'LONG' ? 'SELL' : 'BUY',
      type: 'LIMIT',
      quantity: position.size,
      price: limitPrice,
      status: 'PENDING',
      timestamp: Date.now()
    };

    try {
      const response = await this.placeOrder(order);
      order.status = response.status === 'FILLED' ? 'FILLED' : 'REJECTED';
      return order;
    } catch (error) {
      order.status = 'REJECTED';
      throw new Error(`Error colocando take profit: ${error}`);
    }
  }

  /**
   * Cancela una orden
   * @param orderId - ID de la orden a cancelar
   * @returns true si se canceló exitosamente
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // En implementación real, aquí se haría la llamada a la API
      await this.cancelOrderAPI(orderId);
      return true;
    } catch (error) {
      throw new Error(`Error cancelando orden: ${error}`);
    }
  }

  /**
   * Obtiene el estado de una orden
   * @param orderId - ID de la orden
   * @returns Estado de la orden
   */
  async getOrderStatus(orderId: string): Promise<string> {
    try {
      // En implementación real, aquí se haría la llamada a la API
      const response = await this.getOrderAPI(orderId);
      return response.status;
    } catch (error) {
      throw new Error(`Error obteniendo estado de orden: ${error}`);
    }
  }

  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async placeOrder(order: Order): Promise<any> {
    // Simulación de llamada a API
    // En implementación real, usar axios con autenticación
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'FILLED', orderId: order.id });
      }, 100);
    });
  }

  private async cancelOrderAPI(orderId: string): Promise<any> {
    // Simulación de cancelación
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 50);
    });
  }

  private async getOrderAPI(orderId: string): Promise<any> {
    // Simulación de consulta de orden
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'FILLED' });
      }, 50);
    });
  }
}

// Funciones para usar en MCP
export async function executeBuyOrder(
  signal: TradingSignal,
  quantity: number,
  apiKey: string,
  secretKey: string
): Promise<Order> {
  const executor = new OrderExecutor(apiKey, secretKey);
  return await executor.executeBuyOrder(signal, quantity);
}

export async function executeSellOrder(
  signal: TradingSignal,
  quantity: number,
  apiKey: string,
  secretKey: string
): Promise<Order> {
  const executor = new OrderExecutor(apiKey, secretKey);
  return await executor.executeSellOrder(signal, quantity);
}
```

## 8. Integración con el Servidor MCP Principal

```typescript
// Adiciones a src/index.ts

import {
  getMarketData,
  getCurrentPrice,
  getOrderBook,
  get24hrStats
} from './trading/market-data.js';

import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands
} from './trading/technical-analysis.js';

import {
  generateTradingSignal
} from './trading/trading-strategies.js';

import {
  validateTrade,
  calculatePositionSize
} from './trading/risk-management.js';

import {
  executeBuyOrder,
  executeSellOrder
} from './trading/order-execution.js';

// Agregar estas herramientas al array de tools existente
const tradingTools: Tool[] = [
  {
    name: 'get_market_data',
    description: 'Obtiene datos de mercado en tiempo real',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Símbolo del activo (ej: BTCUSDT)' },
        timeframe: { type: 'string', description: 'Marco temporal (1m, 5m, 1h, 1d)' },
        limit: { type: 'number', description: 'Número de velas a obtener' }
      },
      required: ['symbol']
    }
  },
  {
    name: 'get_current_price',
    description: 'Obtiene el precio actual de un activo',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Símbolo del activo' }
      },
      required: ['symbol']
    }
  },
  {
    name: 'calculate_rsi',
    description: 'Calcula el RSI (Relative Strength Index)',
    inputSchema: {
      type: 'object',
      properties: {
        prices: { 
          type: 'array', 
          items: { type: 'number' },
          description: 'Array de precios de cierre'
        },
        period: { type: 'number', description: 'Período para cálculo RSI' }
      },
      required: ['prices']
    }
  },
  {
    name: 'calculate_macd',
    description: 'Calcula el MACD (Moving Average Convergence Divergence)',
    inputSchema: {
      type: 'object',
      properties: {
        prices: { 
          type: 'array', 
          items: { type: 'number' },
          description: 'Array de precios de cierre'
        },
        fastPeriod: { type: 'number', description: 'Período rápido' },
        slowPeriod: { type: 'number', description: 'Período lento' },
        signalPeriod: { type: 'number', description: 'Período de señal' }
      },
      required: ['prices']
    }
  },
  {
    name: 'generate_trading_signal',
    description: 'Genera una señal de trading usando estrategias predefinidas',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Símbolo del activo' },
        strategy: { 
          type: 'string', 
          enum: ['mean_reversion', 'momentum', 'bollinger_bands', 'combined'],
          description: 'Estrategia de trading a usar'
        },
        timeframe: { type: 'string', description: 'Marco temporal' },
        limit: { type: 'number', description: 'Número de velas para análisis' }
      },
      required: ['symbol', 'strategy']
    }
  },
  {
    name: 'validate_trade',
    description: 'Valida si una señal de trading puede ser ejecutada',
    inputSchema: {
      type: 'object',
      properties: {
        signal: { type: 'object', description: 'Señal de trading a validar' },
        accountBalance: { type: 'number', description: 'Balance de la cuenta' }
      },
      required: ['signal', 'accountBalance']
    }
  },
  {
    name: 'calculate_position_size',
    description: 'Calcula el tamaño de posición basado en el riesgo',
    inputSchema: {
      type: 'object',
      properties: {
        signal: { type: 'object', description: 'Señal de trading' },
        accountBalance: { type: 'number', description: 'Balance de la cuenta' },
        riskPerTrade: { type: 'number', description: 'Riesgo por trade (0-1)' }
      },
      required: ['signal', 'accountBalance']
    }
  }
];

// Agregar los casos de manejo en el switch del servidor MCP
// (Esto se agregaría al switch existente en el handler de CallToolRequestSchema)

case 'get_market_data':
  if (!args || typeof args !== 'object' || !('symbol' in args)) {
    throw new Error('Parámetro "symbol" requerido para get_market_data');
  }
  const marketData = await getMarketData(
    args['symbol'] as string,
    args['timeframe'] as string || '1h',
    args['limit'] as number || 100
  );
  return {
    content: [{
      type: 'text',
      text: `Datos de mercado para ${args['symbol']}:\n${JSON.stringify(marketData, null, 2)}`
    }]
  };

case 'get_current_price':
  if (!args || typeof args !== 'object' || !('symbol' in args)) {
    throw new Error('Parámetro "symbol" requerido para get_current_price');
  }
  const currentPrice = await getCurrentPrice(args['symbol'] as string);
  return {
    content: [{
      type: 'text',
      text: `Precio actual de ${args['symbol']}: $${currentPrice}`
    }]
  };

case 'calculate_rsi':
  if (!args || typeof args !== 'object' || !('prices' in args)) {
    throw new Error('Parámetro "prices" requerido para calculate_rsi');
  }
  const rsi = await calculateRSI(
    args['prices'] as number[],
    args['period'] as number || 14
  );
  return {
    content: [{
      type: 'text',
      text: `RSI calculado: ${rsi.toFixed(2)}`
    }]
  };

case 'calculate_macd':
  if (!args || typeof args !== 'object' || !('prices' in args)) {
    throw new Error('Parámetro "prices" requerido para calculate_macd');
  }
  const macd = await calculateMACD(
    args['prices'] as number[],
    args['fastPeriod'] as number || 12,
    args['slowPeriod'] as number || 26,
    args['signalPeriod'] as number || 9
  );
  return {
    content: [{
      type: 'text',
      text: `MACD calculado:\n${JSON.stringify(macd, null, 2)}`
    }]
  };

case 'generate_trading_signal':
  if (!args || typeof args !== 'object' || !('symbol' in args) || !('strategy' in args)) {
    throw new Error('Parámetros "symbol" y "strategy" requeridos para generate_trading_signal');
  }
  
  // Obtener datos de mercado primero
  const signalMarketData = await getMarketData(
    args['symbol'] as string,
    args['timeframe'] as string || '1h',
    args['limit'] as number || 100
  );
  
  const signal = await generateTradingSignal(
    args['symbol'] as string,
    args['strategy'] as string,
    signalMarketData
  );
  
  return {
    content: [{
      type: 'text',
      text: `Señal de trading generada:\n${JSON.stringify(signal, null, 2)}`
    }]
  };

case 'validate_trade':
  if (!args || typeof args !== 'object' || !('signal' in args) || !('accountBalance' in args)) {
    throw new Error('Parámetros "signal" y "accountBalance" requeridos para validate_trade');
  }
  const isValid = await validateTrade(
    args['signal'] as TradingSignal,
    args['accountBalance'] as number
  );
  return {
    content: [{
      type: 'text',
      text: `Validación de trade: ${isValid ? 'VÁLIDO' : 'NO VÁLIDO'}`
    }]
  };

case 'calculate_position_size':
  if (!args || typeof args !== 'object' || !('signal' in args) || !('accountBalance' in args)) {
    throw new Error('Parámetros "signal" y "accountBalance" requeridos para calculate_position_size');
  }
  const positionSize = await calculatePositionSize(
    args['signal'] as TradingSignal,
    args['accountBalance'] as number,
    args['riskPerTrade'] as number || 0.02
  );
  return {
    content: [{
      type: 'text',
      text: `Tamaño de posición calculado: ${positionSize.toFixed(6)}`
    }]
  };
```

## 9. Dependencias Adicionales

```json
// Agregar a package.json
{
  "dependencies": {
    "axios": "^1.6.0",
    "ws": "^8.14.0",
    "crypto": "^1.0.1",
    "moment": "^2.29.4"
  },
  "devDependencies": {
    "@types/ws": "^8.5.0"
  }
}
```

## 10. Configuración de Variables de Entorno

```bash
# .env
BINANCE_API_KEY=tu_api_key_aqui
BINANCE_SECRET_KEY=tu_secret_key_aqui
COINBASE_API_KEY=tu_coinbase_key_aqui
COINBASE_SECRET_KEY=tu_coinbase_secret_aqui
ALPHA_VANTAGE_API_KEY=tu_alpha_vantage_key_aqui
DATABASE_URL=postgresql://user:password@localhost:5432/trading_bot
REDIS_URL=redis://localhost:6379
```

## 11. Próximos Pasos de Implementación

1. **Instalar dependencias adicionales**
2. **Crear la estructura de carpetas** para el módulo de trading
3. **Implementar los archivos TypeScript** con los ejemplos proporcionados
4. **Configurar variables de entorno** para las APIs
5. **Integrar las nuevas herramientas** en el servidor MCP principal
6. **Probar las herramientas** con datos reales
7. **Implementar logging y monitoreo** para el sistema de trading
8. **Crear tests unitarios** para cada módulo
9. **Configurar base de datos** para almacenamiento de datos
10. **Implementar sistema de alertas** para eventos importantes

---

**Documento preparado por**: AI Assistant  
**Fecha**: Diciembre 2024  
**Versión**: 1.0  
**Estado**: Implementación técnica detallada
