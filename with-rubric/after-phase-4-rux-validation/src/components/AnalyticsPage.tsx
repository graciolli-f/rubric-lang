import React from 'react';
import { useExpenseStore } from '../stores/expense-store';
import { useAnalyticsStore } from '../stores/analytics-store';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';
import { BudgetProgress } from './BudgetProgress';
import { AnalyticsSummary } from './AnalyticsSummary';
import { formatCurrency } from '../utils/formatters';

export function AnalyticsPage(): React.JSX.Element {
  const { expenses } = useExpenseStore();
  const { 
    budget, 
    setBudget, 
    getCurrentMonthTotal, 
    getAnalyticsData 
  } = useAnalyticsStore();

  const analyticsData = getAnalyticsData(expenses);
  const currentMonthTotal = getCurrentMonthTotal(expenses);
  const currentBudget = budget?.monthlyLimit || 2000; // Default budget
  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleBudgetUpdate = async (newBudget: number) => {
    try {
      await setBudget({ monthlyLimit: newBudget.toString() });
    } catch (error) {
      // Handle error silently in production
    }
  };

  // Initialize default budget if none exists
  React.useEffect(() => {
    if (!budget) {
      setBudget({ monthlyLimit: '2000' }).catch(() => {});
    }
  }, [budget, setBudget]);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <AnalyticsSummary 
        totalExpenses={analyticsData.currentMonthTotal}
        averageDaily={analyticsData.averageDaily}
        currentMonth={currentMonth}
        transactionCount={analyticsData.transactionCount}
      />

      {/* Budget Progress */}
      <BudgetProgress 
        budget={currentBudget}
        spent={currentMonthTotal}
        onBudgetUpdate={handleBudgetUpdate}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <PieChart 
          data={analyticsData.categoryBreakdown}
          title={`Expense Breakdown - ${new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        />

        {/* Line Chart */}
        <LineChart 
          data={analyticsData.dailyTrends}
          title="Daily Spending Trends (Last 30 Days)"
        />
      </div>

      {/* Additional Insights */}
      {analyticsData.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Top spending category:</span>
              <span className="font-medium">
                {analyticsData.categoryBreakdown[0]?.category} 
                ({formatCurrency(analyticsData.categoryBreakdown[0]?.amount || 0)})
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Days remaining this month:</span>
              <span className="font-medium">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} days
              </span>
            </div>
            
            {currentBudget > currentMonthTotal && (
              <div className="flex justify-between">
                <span className="text-gray-600">Suggested daily budget:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency((currentBudget - currentMonthTotal) / Math.max(1, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()))}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 