# Métricas y KPIs para Bot de Trading con MCP

## Resumen

Este documento define las métricas clave de rendimiento (KPIs) y métricas técnicas específicas para el bot de trading desarrollado con Model Context Protocol, proporcionando un framework completo para medir el éxito del proyecto.

## 1. Métricas Financieras

### 1.1 Rendimiento General

#### Return on Investment (ROI)
- **Fórmula**: `(Valor Final - Valor Inicial) / Valor Inicial × 100`
- **Objetivo**: > 20% anual
- **Frecuencia**: Diaria, semanal, mensual, anual
- **Implementación**:
```typescript
interface ROIMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  total: number;
}
```

#### Sharpe Ratio
- **Fórmula**: `(Retorno Promedio - Tasa Libre de Riesgo) / Desviación Estándar de Retornos`
- **Objetivo**: > 1.5
- **Interpretación**: Mide el retorno ajustado por riesgo
- **Implementación**:
```typescript
function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const excessReturn = avgReturn - riskFreeRate;
  const volatility = calculateStandardDeviation(returns);
  return excessReturn / volatility;
}
```

#### Maximum Drawdown (MDD)
- **Fórmula**: `Máxima pérdida desde un pico hasta un valle`
- **Objetivo**: < 15%
- **Interpretación**: Pérdida máxima experimentada
- **Implementación**:
```typescript
function calculateMaxDrawdown(equity: number[]): number {
  let maxDrawdown = 0;
  let peak = equity[0];
  
  for (let i = 1; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
    }
    const drawdown = (peak - equity[i]) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  return maxDrawdown;
}
```

### 1.2 Métricas de Trading

#### Win Rate
- **Fórmula**: `Trades Ganadores / Total de Trades × 100`
- **Objetivo**: > 55%
- **Frecuencia**: Diaria, semanal, mensual
- **Implementación**:
```typescript
interface WinRateMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
  winningTrades: number;
  totalTrades: number;
}
```

#### Profit Factor
- **Fórmula**: `Ganancias Totales / Pérdidas Totales`
- **Objetivo**: > 1.3
- **Interpretación**: Ratio de ganancias vs pérdidas
- **Implementación**:
```typescript
function calculateProfitFactor(trades: Trade[]): number {
  const profits = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const losses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  return losses === 0 ? Infinity : profits / losses;
}
```

#### Average Win vs Average Loss
- **Fórmula**: `Promedio de Ganancias / Promedio de Pérdidas`
- **Objetivo**: > 1.2
- **Implementación**:
```typescript
function calculateWinLossRatio(trades: Trade[]): number {
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  
  const avgWin = winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length;
  const avgLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length);
  
  return avgLoss === 0 ? Infinity : avgWin / avgLoss;
}
```

### 1.3 Métricas de Riesgo

#### Value at Risk (VaR)
- **Fórmula**: `Percentil 95% de los retornos diarios`
- **Objetivo**: < 2% diario
- **Interpretación**: Pérdida máxima esperada con 95% de confianza
- **Implementación**:
```typescript
function calculateVaR(returns: number[], confidence: number = 0.95): number {
  const sortedReturns = returns.sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  return Math.abs(sortedReturns[index]);
}
```

#### Expected Shortfall (ES)
- **Fórmula**: `Promedio de pérdidas que exceden VaR`
- **Objetivo**: < 3% diario
- **Implementación**:
```typescript
function calculateExpectedShortfall(returns: number[], confidence: number = 0.95): number {
  const varValue = calculateVaR(returns, confidence);
  const tailReturns = returns.filter(ret => ret < -varValue);
  return Math.abs(tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length);
}
```

## 2. Métricas Técnicas del Sistema

### 2.1 Rendimiento de la Aplicación

#### Latencia de Ejecución
- **Métrica**: Tiempo desde señal hasta ejecución
- **Objetivo**: < 100ms
- **Implementación**:
```typescript
interface ExecutionLatency {
  signalToOrder: number; // ms
  orderToFill: number;   // ms
  totalLatency: number;  // ms
}
```

#### Throughput
- **Métrica**: Requests por segundo
- **Objetivo**: > 1000 RPS
- **Implementación**:
```typescript
class ThroughputMonitor {
  private requests: number[] = [];
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  getCurrentRPS(): number {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    this.requests = this.requests.filter(time => time > oneSecondAgo);
    return this.requests.length;
  }
}
```

#### Uptime
- **Métrica**: Porcentaje de tiempo operativo
- **Objetivo**: > 99.9%
- **Implementación**:
```typescript
class UptimeMonitor {
  private startTime: number = Date.now();
  private downtime: number = 0;
  
  recordDowntime(duration: number): void {
    this.downtime += duration;
  }
  
  getUptime(): number {
    const totalTime = Date.now() - this.startTime;
    return ((totalTime - this.downtime) / totalTime) * 100;
  }
}
```

### 2.2 Calidad de Datos

#### Data Freshness
- **Métrica**: Tiempo desde última actualización
- **Objetivo**: < 1 segundo
- **Implementación**:
```typescript
interface DataFreshness {
  marketData: number;    // ms
  orderBook: number;     // ms
  positions: number;     // ms
  lastUpdate: Date;
}
```

#### Data Accuracy
- **Métrica**: Porcentaje de datos correctos
- **Objetivo**: > 99.5%
- **Implementación**:
```typescript
class DataAccuracyMonitor {
  private totalRecords: number = 0;
  private errorRecords: number = 0;
  
  recordData(isValid: boolean): void {
    this.totalRecords++;
    if (!isValid) this.errorRecords++;
  }
  
  getAccuracy(): number {
    return ((this.totalRecords - this.errorRecords) / this.totalRecords) * 100;
  }
}
```

## 3. Métricas de Estrategias

### 3.1 Rendimiento por Estrategia

#### Strategy Performance
```typescript
interface StrategyMetrics {
  strategyName: string;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  avgTradeDuration: number; // hours
}
```

#### Strategy Comparison
```typescript
function compareStrategies(strategies: StrategyMetrics[]): StrategyComparison {
  return {
    bestPerformer: strategies.reduce((best, current) => 
      current.totalReturn > best.totalReturn ? current : best
    ),
    mostConsistent: strategies.reduce((best, current) => 
      current.sharpeRatio > best.sharpeRatio ? current : best
    ),
    lowestRisk: strategies.reduce((best, current) => 
      current.maxDrawdown < best.maxDrawdown ? current : best
    )
  };
}
```

### 3.2 Métricas de Señales

#### Signal Quality
```typescript
interface SignalQuality {
  totalSignals: number;
  executedSignals: number;
  executionRate: number;
  profitableSignals: number;
  signalAccuracy: number;
  avgConfidence: number;
}
```

#### Signal Timing
```typescript
interface SignalTiming {
  avgTimeToExecution: number; // ms
  signalsPerHour: number;
  peakSignalHours: number[];
  signalDistribution: { [hour: number]: number };
}
```

## 4. Métricas de Gestión de Riesgos

### 4.1 Exposición al Riesgo

#### Position Sizing
```typescript
interface PositionSizingMetrics {
  avgPositionSize: number;
  maxPositionSize: number;
  positionSizeVolatility: number;
  concentrationRisk: number; // % en un solo activo
  sectorConcentration: { [sector: string]: number };
}
```

#### Risk Limits
```typescript
interface RiskLimitMetrics {
  dailyLossLimit: number;
  currentDailyLoss: number;
  dailyLossUtilization: number; // %
  maxDrawdownLimit: number;
  currentDrawdown: number;
  drawdownUtilization: number; // %
}
```

### 4.2 Correlaciones

#### Correlation Analysis
```typescript
interface CorrelationMetrics {
  avgCorrelation: number;
  maxCorrelation: number;
  correlationMatrix: { [pair: string]: number };
  diversificationRatio: number;
}
```

## 5. Métricas de Monitoreo en Tiempo Real

### 5.1 Dashboard Metrics

#### Real-time Performance
```typescript
interface RealTimeMetrics {
  currentPnL: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  activePositions: number;
  pendingOrders: number;
  systemStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastUpdate: Date;
}
```

#### Alert Metrics
```typescript
interface AlertMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  avgResponseTime: number; // ms
  alertResolutionRate: number; // %
}
```

### 5.2 System Health

#### Health Score
```typescript
function calculateHealthScore(metrics: SystemMetrics): number {
  const weights = {
    uptime: 0.3,
    latency: 0.2,
    dataAccuracy: 0.2,
    errorRate: 0.15,
    performance: 0.15
  };
  
  const uptimeScore = Math.min(metrics.uptime / 99.9, 1) * 100;
  const latencyScore = Math.max(0, 100 - (metrics.avgLatency / 100) * 100);
  const accuracyScore = metrics.dataAccuracy;
  const errorScore = Math.max(0, 100 - (metrics.errorRate * 1000));
  const performanceScore = Math.min(metrics.throughput / 1000, 1) * 100;
  
  return (
    uptimeScore * weights.uptime +
    latencyScore * weights.latency +
    accuracyScore * weights.dataAccuracy +
    errorScore * weights.errorRate +
    performanceScore * weights.performance
  );
}
```

## 6. Implementación de Métricas

### 6.1 Base de Datos para Métricas

```sql
-- Tabla para métricas de rendimiento
CREATE TABLE performance_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20,8) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'financial', 'technical', 'risk'
  strategy_name VARCHAR(100),
  symbol VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para métricas de trades
CREATE TABLE trade_metrics (
  id SERIAL PRIMARY KEY,
  trade_id VARCHAR(100) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  quantity DECIMAL(20,8) NOT NULL,
  pnl DECIMAL(20,8),
  duration_hours INTEGER,
  strategy VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para métricas del sistema
CREATE TABLE system_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  uptime_percent DECIMAL(5,2),
  avg_latency_ms INTEGER,
  throughput_rps INTEGER,
  error_rate DECIMAL(5,4),
  memory_usage_mb INTEGER,
  cpu_usage_percent DECIMAL(5,2)
);
```

### 6.2 Clase de Métricas

```typescript
// src/trading/metrics/metrics-collector.ts
export class MetricsCollector {
  private db: DatabaseManager;
  
  constructor(db: DatabaseManager) {
    this.db = db;
  }
  
  async recordTrade(trade: Trade): Promise<void> {
    await this.db.query(`
      INSERT INTO trade_metrics (trade_id, symbol, entry_price, exit_price, quantity, pnl, duration_hours, strategy)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      trade.id,
      trade.symbol,
      trade.entryPrice,
      trade.exitPrice,
      trade.quantity,
      trade.pnl,
      trade.durationHours,
      trade.strategy
    ]);
  }
  
  async recordPerformanceMetric(
    name: string, 
    value: number, 
    type: string, 
    strategy?: string, 
    symbol?: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO performance_metrics (metric_name, metric_value, metric_type, strategy_name, symbol)
      VALUES ($1, $2, $3, $4, $5)
    `, [name, value, type, strategy, symbol]);
  }
  
  async getPerformanceMetrics(
    startDate: Date, 
    endDate: Date, 
    strategy?: string
  ): Promise<PerformanceMetrics> {
    const trades = await this.getTradesInPeriod(startDate, endDate, strategy);
    
    return {
      totalTrades: trades.length,
      winningTrades: trades.filter(t => t.pnl > 0).length,
      winRate: this.calculateWinRate(trades),
      totalReturn: this.calculateTotalReturn(trades),
      sharpeRatio: this.calculateSharpeRatio(trades),
      maxDrawdown: this.calculateMaxDrawdown(trades),
      profitFactor: this.calculateProfitFactor(trades)
    };
  }
  
  private calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(t => t.pnl > 0).length;
    return (winningTrades / trades.length) * 100;
  }
  
  private calculateTotalReturn(trades: Trade[]): number {
    return trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  }
  
  private calculateSharpeRatio(trades: Trade[]): number {
    if (trades.length < 2) return 0;
    const returns = trades.map(t => t.pnl || 0);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = this.calculateStandardDeviation(returns);
    return volatility === 0 ? 0 : avgReturn / volatility;
  }
  
  private calculateMaxDrawdown(trades: Trade[]): number {
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;
    
    for (const trade of trades) {
      runningTotal += trade.pnl || 0;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }
  
  private calculateProfitFactor(trades: Trade[]): number {
    const profits = trades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
    const losses = Math.abs(trades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0));
    return losses === 0 ? Infinity : profits / losses;
  }
  
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}
```

## 7. Dashboard de Métricas

### 7.1 Componentes de Dashboard

```typescript
// src/components/MetricsDashboard.tsx
export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const realTimeMetrics = await fetchRealTimeMetrics();
      const performanceMetrics = await fetchPerformanceMetrics();
      setMetrics(realTimeMetrics);
      setPerformance(performanceMetrics);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <RealTimeMetricsCard metrics={metrics} />
      </Grid>
      <Grid item xs={12} md={6}>
        <PerformanceMetricsCard metrics={performance} />
      </Grid>
      <Grid item xs={12}>
        <TradingChart data={metrics?.tradingData} />
      </Grid>
    </Grid>
  );
};
```

### 7.2 Alertas Automáticas

```typescript
// src/trading/alerts/alert-manager.ts
export class AlertManager {
  private thresholds = {
    maxDrawdown: 0.15,
    dailyLoss: 0.05,
    errorRate: 0.01,
    latency: 1000,
    uptime: 99.0
  };
  
  async checkThresholds(metrics: SystemMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    if (metrics.maxDrawdown > this.thresholds.maxDrawdown) {
      alerts.push({
        type: 'CRITICAL',
        message: `Maximum drawdown exceeded: ${metrics.maxDrawdown * 100}%`,
        timestamp: new Date()
      });
    }
    
    if (metrics.dailyLoss > this.thresholds.dailyLoss) {
      alerts.push({
        type: 'WARNING',
        message: `Daily loss limit approached: ${metrics.dailyLoss * 100}%`,
        timestamp: new Date()
      });
    }
    
    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'WARNING',
        message: `High error rate detected: ${metrics.errorRate * 100}%`,
        timestamp: new Date()
      });
    }
    
    if (metrics.avgLatency > this.thresholds.latency) {
      alerts.push({
        type: 'INFO',
        message: `High latency detected: ${metrics.avgLatency}ms`,
        timestamp: new Date()
      });
    }
    
    if (metrics.uptime < this.thresholds.uptime) {
      alerts.push({
        type: 'CRITICAL',
        message: `Uptime below threshold: ${metrics.uptime}%`,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
}
```

## 8. Reportes Automáticos

### 8.1 Reporte Diario

```typescript
// src/trading/reports/daily-report.ts
export class DailyReportGenerator {
  async generateReport(date: Date): Promise<DailyReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const trades = await this.getTradesInPeriod(startOfDay, endOfDay);
    const metrics = await this.calculateDailyMetrics(trades);
    
    return {
      date,
      summary: {
        totalTrades: trades.length,
        winningTrades: trades.filter(t => t.pnl > 0).length,
        totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
        winRate: this.calculateWinRate(trades),
        sharpeRatio: this.calculateSharpeRatio(trades)
      },
      topPerformers: this.getTopPerformingStrategies(trades),
      riskMetrics: this.calculateRiskMetrics(trades),
      recommendations: this.generateRecommendations(metrics)
    };
  }
}
```

### 8.2 Reporte Semanal

```typescript
// src/trading/reports/weekly-report.ts
export class WeeklyReportGenerator {
  async generateReport(weekStart: Date): Promise<WeeklyReport> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const dailyReports = await this.getDailyReports(weekStart, weekEnd);
    const weeklyMetrics = this.aggregateWeeklyMetrics(dailyReports);
    
    return {
      weekStart,
      weekEnd,
      summary: weeklyMetrics,
      dailyBreakdown: dailyReports,
      trends: this.analyzeTrends(dailyReports),
      nextWeekRecommendations: this.generateNextWeekRecommendations(weeklyMetrics)
    };
  }
}
```

## 9. Conclusión

Este framework de métricas y KPIs proporciona una base sólida para medir el rendimiento del bot de trading con MCP. La implementación de estas métricas permitirá:

1. **Monitoreo continuo** del rendimiento financiero y técnico
2. **Identificación temprana** de problemas y oportunidades
3. **Optimización basada en datos** de las estrategias de trading
4. **Gestión proactiva de riesgos** con alertas automáticas
5. **Toma de decisiones informada** basada en métricas objetivas

La clave del éxito será la implementación gradual de estas métricas, comenzando con las más críticas y expandiendo el sistema según las necesidades del proyecto.

---

**Documento preparado por**: AI Assistant  
**Fecha**: Diciembre 2024  
**Versión**: 1.0  
**Estado**: Framework completo de métricas y KPIs
