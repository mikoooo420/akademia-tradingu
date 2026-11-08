'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { IChartApi, ISeriesApi, MouseEventParams, SeriesType, Time, UTCTimestamp } from 'lightweight-charts';
import { ChartCandlestick, ChartLine, LoaderCircle } from 'lucide-react';
import { fetchCandles } from '@/lib/api/client';
import { TIMEFRAME_LABELS, TIMEFRAMES, type Candle, type CandlesResponse, type Timeframe } from '@/lib/api/types';
import { formatPercent, formatPrice, formatVolume, trendClass } from '@/lib/format';
import { cn } from '@/lib/utils';

type ChartType = 'candles' | 'line';
type LightweightCharts = typeof import('lightweight-charts');

const COLORS = {
  up: '#22c55e',
  down: '#ef4444',
  upVolume: 'rgba(34, 197, 94, 0.35)',
  downVolume: 'rgba(239, 68, 68, 0.35)',
  line: '#3b82f6',
  grid: 'rgba(35, 42, 59, 0.6)',
  text: '#9aa3b8',
  border: '#232a3b',
};

/** lightweight-charts wyświetla czas w UTC – przesuwamy znaczniki do strefy czasowej użytkownika. */
function toLocalTime(seconds: number): UTCTimestamp {
  const offsetMinutes = new Date(seconds * 1000).getTimezoneOffset();
  return (seconds - offsetMinutes * 60) as UTCTimestamp;
}

interface PriceChartProps {
  symbol: string;
  livePrice?: number;
}

export function PriceChart({ symbol, livePrice }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const libRef = useRef<LightweightCharts | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const lastCandleRef = useRef<Candle | null>(null);

  const [ready, setReady] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [data, setData] = useState<CandlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<Candle | null>(null);

  // 1. Utworzenie wykresu (biblioteka ładowana dynamicznie tylko w przeglądarce)
  useEffect(() => {
    let disposed = false;
    let chart: IChartApi | null = null;

    (async () => {
      const lib = await import('lightweight-charts');
      if (disposed || !containerRef.current) return;
      libRef.current = lib;
      chart = lib.createChart(containerRef.current, {
        autoSize: true,
        layout: {
          background: { type: lib.ColorType.Solid, color: 'transparent' },
          textColor: COLORS.text,
          fontFamily: 'var(--font-sans), system-ui, sans-serif',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: COLORS.grid },
          horzLines: { color: COLORS.grid },
        },
        crosshair: { mode: lib.CrosshairMode.Normal },
        rightPriceScale: { borderColor: COLORS.border, scaleMargins: { top: 0.08, bottom: 0.24 } },
        timeScale: { borderColor: COLORS.border, rightOffset: 4, secondsVisible: false },
        localization: {
          locale: 'pl-PL',
          priceFormatter: (price: number) => formatPrice(price),
        },
      });
      chartRef.current = chart;
      setReady(true);
    })();

    return () => {
      disposed = true;
      chart?.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      setReady(false);
    };
  }, []);

  // 2. Pobranie świec po zmianie instrumentu lub interwału
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCandles(symbol, timeframe).then((response) => {
      if (cancelled) return;
      setData(response);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  // 3. Narysowanie serii danych
  useEffect(() => {
    const chart = chartRef.current;
    if (!ready || !chart || !data) return;

    if (mainSeriesRef.current) chart.removeSeries(mainSeriesRef.current);
    if (volumeSeriesRef.current) chart.removeSeries(volumeSeriesRef.current);

    const candles = data.candles;
    lastCandleRef.current = candles.length ? { ...candles[candles.length - 1] } : null;
    const intraday = timeframe === '1D' || timeframe === '1W' || timeframe === '1M';
    chart.applyOptions({ timeScale: { timeVisible: intraday } });

    const volume = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume', lastValueVisible: false, priceLineVisible: false });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volume.setData(
      candles.map((c) => ({ time: toLocalTime(c.time), value: c.volume, color: c.close >= c.open ? COLORS.upVolume : COLORS.downVolume })),
    );

    let main: ISeriesApi<SeriesType>;
    if (chartType === 'candles') {
      const series = chart.addCandlestickSeries({
        upColor: COLORS.up,
        downColor: COLORS.down,
        borderVisible: false,
        wickUpColor: COLORS.up,
        wickDownColor: COLORS.down,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      series.setData(candles.map((c) => ({ time: toLocalTime(c.time), open: c.open, high: c.high, low: c.low, close: c.close })));
      main = series;
    } else {
      const series = chart.addAreaSeries({
        lineColor: COLORS.line,
        topColor: 'rgba(59, 130, 246, 0.35)',
        bottomColor: 'rgba(59, 130, 246, 0.0)',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      series.setData(candles.map((c) => ({ time: toLocalTime(c.time), value: c.close })));
      main = series;
    }

    mainSeriesRef.current = main;
    volumeSeriesRef.current = volume;
    chart.timeScale().fitContent();

    const byTime = new Map(candles.map((c) => [toLocalTime(c.time) as number, c]));
    const onCrosshair = (param: MouseEventParams<Time>) => {
      if (param.time === undefined || !param.point) {
        setHovered(null);
        return;
      }
      setHovered(byTime.get(param.time as number) ?? null);
    };
    chart.subscribeCrosshairMove(onCrosshair);
    return () => chart.unsubscribeCrosshairMove(onCrosshair);
  }, [ready, data, chartType, timeframe]);

  // 4. Aktualizacja ostatniej świecy bieżącą ceną (efekt "na żywo")
  useEffect(() => {
    const series = mainSeriesRef.current;
    const last = lastCandleRef.current;
    if (!series || !last || livePrice === undefined || !Number.isFinite(livePrice)) return;
    const updated: Candle = { ...last, close: livePrice, high: Math.max(last.high, livePrice), low: Math.min(last.low, livePrice) };
    lastCandleRef.current = updated;
    const time = toLocalTime(updated.time);
    try {
      if (chartType === 'candles') {
        (series as ISeriesApi<'Candlestick'>).update({ time, open: updated.open, high: updated.high, low: updated.low, close: updated.close });
      } else {
        (series as ISeriesApi<'Area'>).update({ time, value: updated.close });
      }
    } catch {
      // Ignorujemy aktualizacje starsze niż ostatni punkt na wykresie.
    }
  }, [livePrice, chartType, data]);

  const periodChange = useMemo(() => {
    const candles = data?.candles;
    if (!candles || candles.length < 2) return null;
    const first = candles[0].open;
    const last = livePrice ?? candles[candles.length - 1].close;
    return first ? ((last - first) / first) * 100 : null;
  }, [data, livePrice]);

  const legend = hovered ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 sm:px-5">
        <div className="flex items-center gap-1 rounded-lg border border-line bg-bg-soft p-0.5" role="tablist" aria-label="Interwał wykresu">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              role="tab"
              aria-selected={timeframe === tf}
              title={TIMEFRAME_LABELS[tf]}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                timeframe === tf ? 'bg-bg-elevated text-ink shadow' : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {periodChange !== null && (
            <span className="text-xs text-ink-faint">
              Zmiana w okresie: <span className={cn('num font-medium', trendClass(periodChange))}>{formatPercent(periodChange)}</span>
            </span>
          )}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-bg-soft p-0.5">
            <button
              type="button"
              onClick={() => setChartType('candles')}
              aria-pressed={chartType === 'candles'}
              title="Wykres świecowy"
              className={cn('rounded-md p-1.5 transition-colors', chartType === 'candles' ? 'bg-bg-elevated text-ink' : 'text-ink-faint hover:text-ink-muted')}
            >
              <ChartCandlestick className="h-4 w-4" />
              <span className="sr-only">Wykres świecowy</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              aria-pressed={chartType === 'line'}
              title="Wykres liniowy"
              className={cn('rounded-md p-1.5 transition-colors', chartType === 'line' ? 'bg-bg-elevated text-ink' : 'text-ink-faint hover:text-ink-muted')}
            >
              <ChartLine className="h-4 w-4" />
              <span className="sr-only">Wykres liniowy</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-6 items-center gap-3 overflow-hidden px-4 pt-2 text-[11px] text-ink-faint sm:px-5">
        {legend ? (
          <>
            <span>
              O <span className="num text-ink-muted">{formatPrice(legend.open)}</span>
            </span>
            <span>
              Maks. <span className="num text-ink-muted">{formatPrice(legend.high)}</span>
            </span>
            <span>
              Min. <span className="num text-ink-muted">{formatPrice(legend.low)}</span>
            </span>
            <span>
              Z <span className={cn('num', legend.close >= legend.open ? 'text-up' : 'text-down')}>{formatPrice(legend.close)}</span>
            </span>
            <span className="hidden sm:inline">
              Wol. <span className="num text-ink-muted">{formatVolume(legend.volume)}</span>
            </span>
          </>
        ) : (
          <span>
            {TIMEFRAME_LABELS[timeframe]}
            {data?.source === 'mock' && ' · dane symulowane'}
            {data?.source === 'yahoo' && ' · źródło: Yahoo Finance'}
          </span>
        )}
      </div>

      <div className="relative min-h-[320px] flex-1 sm:min-h-[420px]">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-card/60 backdrop-blur-[1px]">
            <LoaderCircle className="h-6 w-6 animate-spin text-brand-glow" aria-label="Wczytywanie wykresu" />
          </div>
        )}
      </div>
    </div>
  );
}
