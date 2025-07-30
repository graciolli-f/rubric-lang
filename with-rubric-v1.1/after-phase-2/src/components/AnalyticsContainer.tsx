/**
 * Container component that orchestrates analytics dashboard
 * Manages UI state and coordinates analytics components
 */

import React, { useState } from 'react';
import clsx from 'clsx';
import { useExpenseStore } from '../stores/expense-store';
import { CategoryPieChart } from './CategoryPieChart';
import { DailyTrendsChart } from './DailyTrendsChart';
import { BudgetProgress } from './BudgetProgress';
import { BudgetManager } from './BudgetManager';

export default function AnalyticsContainer() {
  const {
    expenses,
    isLoading,
    error,
    monthlyBudget,
    setBudget,
    getAnalyticsData,
    getCategoryBreakdown,
    getDailyTrends,
    getBudgetState,
    getAverageDailySpending,
    clearError
  } = useExpenseStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Get analytics data
  const analyticsData = getAnalyticsData();
  const categoryBreakdown = getCategoryBreakdown();
  const dailyTrends = getDailyTrends();
  const budgetState = getBudgetState();
  const averageDailySpending = getAverageDailySpending();

  const handleBudgetChange = (amount: number) => {
    setBudget(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Analytics
          </h1>
          <p className="text-gray-600">
            Track your spending patterns and manage your budget
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
                aria-label="Clear error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 text-lg mb-4">
              No expenses recorded yet
            </div>
            <p className="text-gray-400">
              Add some expenses to see your analytics dashboard
            </p>
          </div>
        ) : (
          <>
            {/* Budget Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetManager
                currentBudget={monthlyBudget}
                onBudgetChange={handleBudgetChange}
                className="h-fit"
              />
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Budget Status
                </h3>
                <BudgetProgress budgetData={budgetState} />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Monthly Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${analyticsData.totalCurrentMonth.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${averageDailySpending.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Average Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {categoryBreakdown.length}
                  </div>
                  <div className="text-sm text-gray-500">Categories Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {expenses.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Expenses</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow">
                <CategoryPieChart 
                  data={categoryBreakdown}
                  title="Current Month Spending by Category"
                />
              </div>

              {/* Daily Trends */}
              <div className="bg-white p-6 rounded-lg shadow">
                <DailyTrendsChart 
                  data={dailyTrends}
                  title="Daily Spending Trends"
                />
              </div>
            </div>

            {/* Additional insights */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Insights & Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800 mb-2">
                    💡 Spending Pattern
                  </div>
                  <div className="text-blue-700">
                    {budgetState.isOverBudget
                      ? "You're over budget this month. Consider reviewing your largest expense categories."
                      : `You have $${budgetState.remainingBudget.toFixed(2)} left for this month.`
                    }
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">
                    📊 Top Category
                  </div>
                  <div className="text-green-700">
                    {categoryBreakdown.length > 0
                      ? `Your highest spending category is ${categoryBreakdown[0].category} (${categoryBreakdown[0].percentage}%)`
                      : "No spending data available"
                    }
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800 mb-2">
                    🎯 Budget Goal
                  </div>
                  <div className="text-purple-700">
                    {budgetState.currentMonthSpent < monthlyBudget * 0.8
                      ? "Great job staying within budget!"
                      : "Consider reducing spending in your top categories."
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}