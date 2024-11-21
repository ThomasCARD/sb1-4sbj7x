import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title: string;
}

const colors = [
  'rgba(69, 183, 209, 0.8)',  // Primary blue
  'rgba(52, 211, 153, 0.8)',  // Green
  'rgba(251, 146, 60, 0.8)',  // Orange
  'rgba(167, 139, 250, 0.8)', // Purple
  'rgba(251, 191, 36, 0.8)',  // Yellow
];

export function PieChart({ data, title }: PieChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#E5E7EB', // text-gray-200
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#F3F4F6', // text-gray-100
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 p-6 border border-gray-700">
      <Pie data={chartData} options={options} />
    </div>
  );
}