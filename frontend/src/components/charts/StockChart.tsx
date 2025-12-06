import React, {useRef} from 'react';
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, TimeScale, Title, Tooltip,} from 'chart.js';
import {Chart} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {CandlestickController, CandlestickElement} from 'chartjs-chart-financial';
import {OhlcData} from '../../types/OhlcData';
import './StockChart.css';

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

const StockChart: React.FC<StockChartProps> = ({ data, symbol }) => {
  const chartRef = useRef<ChartJS>(null);

  const chartData = data.map(item => ({
    x: new Date(item.date + 'T00:00:00').getTime(),
    o: item.open,
    h: item.high,
    l: item.low,
    c: item.close
  }));

  const lineData = data.map(item => ({
    x: new Date(item.date + 'T00:00:00').getTime(),
    y: item.close
  }));

  const config = {
    type: 'candlestick' as const,
    data: {
      datasets: [
        {
          label: `${symbol} OHLC`,
          type: 'candlestick' as const,
          data: chartData,
        },
        {
          label: `${symbol} Close Price`,
          type: 'line' as const,
          data: lineData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderWidth: 2,
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
          labels: {
            color: '#f0f0f0',
          },
        },
        title: {
          display: true,
          text: `${symbol} - OHLC Chart`,
          font: {
            size: 16,
          },
          color: '#f0f0f0',
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const point = context.raw;
              if (point.o !== undefined) {
                return [
                  `Open: $${point.o.toFixed(2)}`,
                  `High: $${point.h.toFixed(2)}`,
                  `Low: $${point.l.toFixed(2)}`,
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
            displayFormats: {
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM d',
            },
          },
          title: {
            display: true,
            text: 'Date',
            color: '#f0f0f0',
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
            maxRotation: 45,
            minRotation: 0,
            color: '#b0b0b0',
          },
          grid: {
            color: '#444',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Price ($)',
            color: '#f0f0f0',
          },
          ticks: {
            color: '#b0b0b0',
          },
          grid: {
            color: '#444',
          },
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
    <div className="chart-container">
      <Chart ref={chartRef} {...config} />
    </div>
  );
};

export default StockChart;
