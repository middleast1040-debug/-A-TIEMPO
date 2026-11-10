import React, { useMemo } from 'react';
import { Route } from '../types/transit';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CongestionChartProps {
  route: Route;
  currentTimeMs: number;
}

interface CongestionDataPoint {
  timeLabel: string;
  hourNumber: number;
  congestion: number; // 0 to 100
  delayMinutes: number;
  status: 'Fluido' | 'Moderado' | 'Pico';
  isCurrent: boolean;
}

export const CongestionChart: React.FC<CongestionChartProps> = ({
  route,
  currentTimeMs,
}) => {
  const currentHour = new Date(currentTimeMs).getHours();

  const chartData = useMemo<CongestionDataPoint[]>(() => {
    const points: CongestionDataPoint[] = [];

    const getBaseCongestion = (h: number): { val: number; delay: number } => {
      if (h >= 6 && h <= 8) {
        const factor = h === 7 ? 88 : h === 6 ? 68 : 78;
        return { val: factor, delay: Math.round(factor / 6) };
      }
      if (h >= 9 && h <= 11) {
        return { val: 42, delay: 4 };
      }
      if (h >= 12 && h <= 14) {
        return { val: 56, delay: 6 };
      }
      if (h >= 15 && h <= 16) {
        return { val: 62, delay: 7 };
      }
      if (h >= 17 && h <= 19) {
        const factor = h === 18 ? 92 : h === 17 ? 84 : 76;
        return { val: factor, delay: Math.round(factor / 5) };
      }
      if (h >= 20 && h <= 21) {
        return { val: 48, delay: 4 };
      }
      return { val: 24, delay: 2 };
    };

    const typeModifier = route.type === 'transmilenio' ? 0.85 : route.type === 'sitp' ? 1.15 : 0.95;

    for (let i = 0; i < 7; i++) {
      const h = (currentHour + i) % 24;
      const base = getBaseCongestion(h);
      const adjustedVal = Math.min(98, Math.max(15, Math.round(base.val * typeModifier)));
      const adjustedDelay = Math.max(1, Math.round(base.delay * typeModifier));

      let status: 'Fluido' | 'Moderado' | 'Pico' = 'Fluido';
      if (adjustedVal >= 75) status = 'Pico';
      else if (adjustedVal >= 45) status = 'Moderado';

      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const timeLabel = i === 0 ? 'Ahora' : `${displayHour} ${ampm}`;

      points.push({
        timeLabel,
        hourNumber: h,
        congestion: adjustedVal,
        delayMinutes: adjustedDelay,
        status,
        isCurrent: i === 0,
      });
    }

    return points;
  }, [currentHour, route.type]);

  const currentPoint = chartData[0];
  const peakPoint = chartData.reduce((prev, curr) => (curr.congestion > prev.congestion ? curr : prev), chartData[0]);

  return (
    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-4 text-left space-y-3">
      {/* Header of the Chart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#0070F3]" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Tendencia de congestión próxima
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0070F3] inline-block"></span>
            Fluido (&lt;45%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            Pico (&gt;75%)
          </span>
        </div>
      </div>

      {/* Current Hour Quick Stat Callout */}
      <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          {currentPoint.congestion >= 75 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0070F3] shrink-0" />
          )}
          <span className="text-slate-700 dark:text-slate-300">
            Ahora en {route.code}:{' '}
            <strong className={currentPoint.congestion >= 75 ? 'text-amber-500' : 'text-[#0060EA] dark:text-[#38BDF8]'}>
              {currentPoint.status} ({currentPoint.congestion}%)
            </strong>
          </span>
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Demora vía: ~+{currentPoint.delayMinutes} min
        </span>
      </div>

      {/* Recharts Line / Area Chart */}
      <div className="h-[150px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="congestionGradientElectric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0070F3" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0070F3" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CongestionDataPoint;
                  return (
                    <div className="bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3">
                        <span>{data.timeLabel}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            data.congestion >= 75
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] text-[#0060EA] dark:text-[#38BDF8] border border-[#BFDBFE] dark:border-[#0080FF]/30'
                          }`}
                        >
                          {data.status}
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        Nivel de ocupación: <strong className="text-slate-900 dark:text-white font-mono">{data.congestion}%</strong>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Impacto en viaje: ~+{data.delayMinutes} min sobre horario normal
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="congestion"
              stroke="#0070F3"
              strokeWidth={2.5}
              fill="url(#congestionGradientElectric)"
              activeDot={{ r: 5, fill: '#38BDF8', stroke: '#070D18', strokeWidth: 2 }}
            />

            <ReferenceDot
              x="Ahora"
              y={currentPoint.congestion}
              r={5}
              fill="#0070F3"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Helpful Commuter Insight Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-[#1C2A3E]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Mayor congestión esperada: <strong className="text-slate-800 dark:text-white">{peakPoint.timeLabel} ({peakPoint.congestion}%)</strong>
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Histórico del corredor
        </span>
      </div>
    </div>
  );
};
