import {useRef} from 'react';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import {Chart} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {CandlestickController, CandlestickElement} from 'chartjs-chart-financial';
import {OhlcData} from '@/types/OhlcData';
import {getChartTheme} from '@/lib/chart-theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

interface StockChartProps {
  data: OhlcData[];
  symbol: string;
}

export default function StockChart({data, symbol}: StockChartProps) {
  const chartRef = useRef<ChartJS>(null);
    const theme = getChartTheme();

    const chartData = data.map((item) => ({
    x: new Date(item.date + 'T00:00:00').getTime(),
    o: item.open,
    h: item.high,
    l: item.low,
        c: item.close,
  }));

    const lineData = data.map((item) => ({
    x: new Date(item.date + 'T00:00:00').getTime(),
        y: item.close,
  }));

  const config = {
    type: 'candlestick' as const,
    data: {
      datasets: [
        {
          label: `${symbol} OHLC`,
          type: 'candlestick' as const,
          data: chartData,
            borderColors: {
                up: theme.success,
                down: theme.danger,
                unchanged: theme.textMuted,
            },
            backgroundColors: {
                up: theme.success,
                down: theme.danger,
                unchanged: theme.textMuted,
            },
        } as any,
        {
            label: `${symbol} Close`,
          type: 'line' as const,
          data: lineData,
            borderColor: theme.line,
            backgroundColor: theme.line + '20',
            borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
            labels: {color: theme.text},
        },
          title: {display: false},
        tooltip: {
            backgroundColor: 'rgba(27, 27, 31, 0.95)',
            borderColor: theme.grid,
            borderWidth: 1,
            titleColor: theme.text,
            bodyColor: theme.text,
          callbacks: {
              label(context: any) {
              const point = context.raw;
              if (point.o !== undefined) {
                return [
                    `Open:  $${point.o.toFixed(2)}`,
                    `High:  $${point.h.toFixed(2)}`,
                    `Low:   $${point.l.toFixed(2)}`,
                  `Close: $${point.c.toFixed(2)}`,
                ];
              }
              return `Close: $${point.y.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            minUnit: 'day' as const,
              displayFormats: {day: 'MMM d', week: 'MMM d', month: 'MMM yy'},
          },
            title: {display: false},
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
              maxRotation: 0,
              color: theme.textMuted,
              font: {family: 'JetBrains Mono, monospace'},
          },
            grid: {color: theme.grid, drawTicks: false},
            border: {display: false},
        },
        y: {
            title: {display: false},
          ticks: {
              color: theme.textMuted,
              font: {family: 'JetBrains Mono, monospace'},
          },
            grid: {color: theme.grid, drawTicks: false},
            border: {display: false},
          beginAtZero: false,
        },
      },
      datasets: {
        candlestick: {
          barThickness: 'flex' as const,
          maxBarThickness: 8,
        },
      },
    },
  };

  return (
      <div className="relative h-[28rem] w-full">
      <Chart ref={chartRef} {...config} />
    </div>
  );
}
