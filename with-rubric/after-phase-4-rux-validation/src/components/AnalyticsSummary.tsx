import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface AnalyticsSummaryProps {
  totalExpenses: number;
  averageDaily: number;
  currentMonth: string;
  transactionCount: number;
}

export function AnalyticsSummary({ 
  totalExpenses, 
  averageDaily, 
  currentMonth, 
  transactionCount 
}: AnalyticsSummaryProps): React.JSX.Element {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Summary for {formatMonth(currentMonth)}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Total Expenses
          </div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(averageDaily)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Average Daily
          </div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {transactionCount}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Transactions
          </div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {transactionCount > 0 ? formatCurrency(totalExpenses / transactionCount) : formatCurrency(0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Avg per Transaction
          </div>
        </div>
      </div>
    </div>
  );
} 