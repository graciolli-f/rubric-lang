import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryBreakdown } from '../types';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

// Colors for different categories
const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4', 
  Shopping: '#45B7D1',
  Bills: '#FFA07A',
  Entertainment: '#98D8C8',
  Other: '#F7DC6F'
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Expense Breakdown by Category
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No expenses this month</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  // Custom label function to show percentage
  const renderLabel = (entry: any) => `${entry.percentage}%`;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Amount: ${data.amount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Expense Breakdown by Category
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry) => (
                <Cell 
                  key={`cell-${entry.category}`} 
                  fill={CATEGORY_COLORS[entry.category]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category breakdown list */}
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Breakdown</h4>
        {data.map((category) => (
          <div key={category.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category.category] }}
              />
              <span className="text-gray-700">{category.category}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-900">${category.amount.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">({category.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 