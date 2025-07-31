/**
 * Pure presentation component for displaying expense category breakdown as pie chart
 * Props-only, no stores or external state
 */

import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import clsx from 'clsx';
import type { CategoryData } from '../types/expense.types';
import { formatCurrency } from '../utils/currency';

interface ExpensePieChartProps {
  data: CategoryData[];
  className?: string;
  height?: number;
}

const ExpensePieChart = memo<ExpensePieChartProps>(({ 
  data, 
  className,
  height = 400 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center p-8", className)}>
        <p className="text-gray-500">No expense data to display</p>
      </div>
    );
  }

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={clsx("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percentage }) => `${percentage.toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

ExpensePieChart.displayName = 'ExpensePieChart';

export default ExpensePieChart;