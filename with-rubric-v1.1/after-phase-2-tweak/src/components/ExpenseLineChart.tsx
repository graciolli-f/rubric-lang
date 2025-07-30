/**
 * Pure presentation component for displaying daily spending trends as line chart
 * Props-only, no stores or external state
 */

import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import type { DailySpendingData } from '../types/expense.types';
import { formatCurrency } from '../utils/currency';

interface ExpenseLineChartProps {
  data: DailySpendingData[];
  className?: string;
  height?: number;
  timeframe?: number;
}

const ExpenseLineChart = memo<ExpenseLineChartProps>(({ 
  data, 
  className,
  height = 400,
  timeframe = 30
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center p-8", className)}>
        <p className="text-gray-500">No spending data to display</p>
      </div>
    );
  }

  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const amount = payload[0].value;
      const dataPoint = data.find(d => d.date === label);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">
            {dataPoint?.formattedDate || label}
          </p>
          <p className="text-sm text-gray-600">
            Spent: {formatCurrency(amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    const dataPoint = data.find(d => d.date === tickItem);
    if (dataPoint) {
      // Show only month/day for shorter labels
      const date = new Date(dataPoint.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return tickItem;
  };

  // Calculate max amount for Y-axis domain
  const maxAmount = Math.max(...data.map(d => d.amount));
  const yAxisMax = Math.ceil(maxAmount * 1.1); // Add 10% padding

  return (
    <div className={clsx("w-full", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Daily Spending Trends ({timeframe} days)
        </h3>
        <p className="text-sm text-gray-600">
          Track your spending patterns over time
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, yAxisMax || 100]}
            tickFormatter={(value) => `$${value}`}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={renderTooltip} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

ExpenseLineChart.displayName = 'ExpenseLineChart';

export default ExpenseLineChart;