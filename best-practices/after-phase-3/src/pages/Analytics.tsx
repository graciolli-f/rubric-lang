import React from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import CategoryPieChart from '../components/CategoryPieChart';
import DailySpendingChart from '../components/DailySpendingChart';
import BudgetOverview from '../components/BudgetOverview';

export default function Analytics() {
  const { getAnalyticsData, setMonthlyBudget, isLoading, error } = useExpenseStore();
  
  // Get fresh analytics data every render to ensure real-time updates
  const analyticsData = getAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Insights into your spending patterns and budget management
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview - Full Width */}
      <BudgetOverview
        budgetState={analyticsData.budgetState}
        averageDailySpending={analyticsData.averageDailySpending}
        onBudgetUpdate={setMonthlyBudget}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Pie Chart */}
        <CategoryPieChart data={analyticsData.categoryBreakdown} />
        
        {/* Daily Spending Line Chart */}
        <DailySpendingChart data={analyticsData.dailySpending} />
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              ${analyticsData.budgetState.currentMonthSpending.toFixed(2)}
            </p>
            <p className="text-sm text-blue-700 font-medium">This Month</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              ${analyticsData.averageDailySpending.toFixed(2)}
            </p>
            <p className="text-sm text-green-700 font-medium">Daily Average</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {analyticsData.categoryBreakdown.length}
            </p>
            <p className="text-sm text-yellow-700 font-medium">Categories Used</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {analyticsData.budgetState.percentageUsed}%
            </p>
            <p className="text-sm text-purple-700 font-medium">Budget Used</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm pt-4">
        <p>Analytics update automatically as you add or modify expenses</p>
      </div>
    </div>
  );
} 