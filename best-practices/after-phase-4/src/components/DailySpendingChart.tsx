import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DailySpending } from '../types';

interface DailySpendingChartProps {
  data: DailySpending[];
}

export default function DailySpendingChart({ data }: DailySpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Spending Trends (Last 30 Days)
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No spending data available</p>
            <p className="text-sm">Add some expenses to see the trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display in tooltip
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date for X-axis (show every 5th day to avoid crowding)
  const formatXAxisDate = (dateString: string, index: number) => {
    if (index % 5 === 0) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return '';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Spent: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate some stats for display
  const totalSpent = data.reduce((sum, day) => sum + day.amount, 0);
  const daysWithSpending = data.filter(day => day.amount > 0).length;
  const highestSpendingDay = data.reduce((max, day) => 
    day.amount > max.amount ? day : max, data[0]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Spending Trends (Last 30 Days)
      </h3>
      
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatXAxisDate}
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              tick={{ fontSize: 12 }}
              stroke="#6B7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Spent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{daysWithSpending}</p>
          <p className="text-sm text-gray-600">Days with Spending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">${highestSpendingDay.amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Highest Day</p>
        </div>
      </div>
    </div>
  );
} 