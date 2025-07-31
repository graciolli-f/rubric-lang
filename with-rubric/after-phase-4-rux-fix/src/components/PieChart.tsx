import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface PieChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  title?: string;
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#ff6b6b'
];

export function PieChart({ data, title = "Expense Breakdown by Category" }: PieChartProps): React.JSX.Element {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No expenses data to display
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              label={({ percentage }) => `${percentage.toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 