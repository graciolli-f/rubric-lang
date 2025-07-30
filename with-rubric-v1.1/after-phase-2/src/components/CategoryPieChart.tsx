/**
 * Pure presentation component for displaying category spending breakdown
 * Props-only, no stores or external state
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import clsx from 'clsx';
import type { CategorySpending } from '../types/expense.types';
import { CHART_COLORS } from '../utils/analytics';

interface CategoryPieChartProps {
  data: CategorySpending[];
  className?: string;
  title?: string;
}

export function CategoryPieChart({ data, className, title = "Expenses by Category" }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={clsx("flex items-center justify-center h-64 text-gray-500", className)}>
        No category data available
      </div>
    );
  }

  return (
    <div className={clsx("w-full", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percentage }) => `${category}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`, 
              'Amount'
            ]}
            labelFormatter={(label: string) => `Category: ${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div 
            key={item.category} 
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-gray-700">{item.category}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">${item.amount.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}