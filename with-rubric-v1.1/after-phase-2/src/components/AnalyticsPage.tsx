/**
 * Container component that orchestrates analytics dashboard
 * Manages UI state and coordinates analytics child components
 */

import React, { useState, useMemo } from 'react';
import { Settings, Calendar, TrendingUp } from 'lucide-react';
import ExpensePieChart from './ExpensePieChart';
import ExpenseLineChart from './ExpenseLineChart';
import BudgetProgress from './BudgetProgress';
import { useExpenseStore } from '../stores/expense-store';
import { 
  calculateCategoryBreakdown, 
  calculateDailySpending,
  getAverageDailySpending,
  getMonthlySpending 
} from '../utils/analytics';
import { formatCurrency } from '../utils/currency';

const AnalyticsPage: React.FC = () => {
  const {
    expenses,
    budget,
    setBudget,
    getCurrentMonthSpending,
    getRemainingBudget,
    getBudgetProgress,
    error
  } = useExpenseStore();

  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 30 | 90>(30);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.monthlyLimit.toString());

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(budget.currentMonth)
    );

    return {
      categoryBreakdown: calculateCategoryBreakdown(currentMonthExpenses),
      dailySpending: calculateDailySpending(expenses, selectedTimeframe),
      currentMonthSpending: getCurrentMonthSpending(),
      remainingBudget: getRemainingBudget(),
      budgetProgress: getBudgetProgress(),
      averageDailySpending: getAverageDailySpending(expenses, selectedTimeframe)
    };
  }, [expenses, budget, selectedTimeframe, getCurrentMonthSpending, getRemainingBudget, getBudgetProgress]);

  const handleBudgetUpdate = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      setBudget(newBudget);
      setShowBudgetModal(false);
    }
  };

  const timeframeOptions = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' }
  ] as const;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your spending patterns and budget progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(Number(e.target.value) as 7 | 30 | 90)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select timeframe for analytics"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Settings */}
          <button
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Update budget settings"
          >
            <Settings className="w-4 h-4" />
            Budget Settings
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <BudgetProgress
        budget={budget.monthlyLimit}
        spent={analyticsData.currentMonthSpending}
        remaining={analyticsData.remainingBudget}
        showDetails={true}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">This Month</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analyticsData.currentMonthSpending)}
          </p>
          <p className="text-sm text-gray-600">Total spent in {budget.currentMonth}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">Daily Average</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analyticsData.averageDailySpending)}
          </p>
          <p className="text-sm text-gray-600">Over last {selectedTimeframe} days</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-gray-900">Budget Status</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analyticsData.budgetProgress.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {analyticsData.remainingBudget > 0 ? 'Used' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Spending by Category
          </h3>
          <ExpensePieChart
            data={analyticsData.categoryBreakdown}
            height={350}
          />
        </div>

        {/* Daily Spending Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <ExpenseLineChart
            data={analyticsData.dailySpending}
            timeframe={selectedTimeframe}
            height={350}
          />
        </div>
      </div>

      {/* Budget Settings Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Update Monthly Budget</h2>
            
            <div className="mb-4">
              <label htmlFor="budget-input" className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget Amount
              </label>
              <input
                id="budget-input"
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBudgetUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;