/**
 * Pure presentation component for displaying daily spending trends
 * Props-only, no stores or external state
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import type { DailySpending } from '../types/expense.types';

interface DailyTrendsChartProps {
  data: DailySpending[];
  className?: string;
  title?: string;
}

export function DailyTrendsChart({ data, className, title = "Daily Spending Trends (Last 30 Days)" }: DailyTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center h-64 text-gray-500", className)}>
        No trend data available
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={clsx("w-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatDate}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            labelFormatter={(label: string) => formatTooltipDate(label)}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#0088FE" 
            strokeWidth={2}
            dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary statistics below chart */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-500">Max Daily</div>
          <div className="font-medium">
            ${Math.max(...data.map(d => d.amount)).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Average</div>
          <div className="font-medium">
            ${(data.reduce((sum, d) => sum + d.amount, 0) / data.length).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Total Period</div>
          <div className="font-medium">
            ${data.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}