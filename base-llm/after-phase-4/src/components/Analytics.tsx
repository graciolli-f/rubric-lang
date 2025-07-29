import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExpenseStore } from '../store/expenseStore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const Analytics: React.FC = () => {
  const {
    budget,
    setBudget,
    getCurrentMonthTotal,
    getRemainingBudget,
    getDailySpendingData,
    getCategoryBreakdown,
    getAverageDailySpending,
  } = useExpenseStore();

  const currentMonthTotal = getCurrentMonthTotal();
  const remainingBudget = getRemainingBudget();
  const dailySpendingData = getDailySpendingData();
  const categoryBreakdown = getCategoryBreakdown();
  const averageDailySpending = getAverageDailySpending();

  const budgetProgress = (currentMonthTotal / budget.monthlyLimit) * 100;
  const isOverBudget = currentMonthTotal > budget.monthlyLimit;

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBudget(value);
    }
  };

  // Format data for charts
  const pieChartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    count: item.count,
  }));

  const lineChartData = dailySpendingData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
  }));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
        
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Monthly Budget</h3>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">$</span>
              <input
                type="number"
                value={budget.monthlyLimit}
                onChange={handleBudgetChange}
                className="text-2xl font-bold text-blue-900 bg-transparent border-none outline-none w-32"
                min="0"
                step="100"
              />
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isOverBudget ? 'text-red-900' : 'text-green-900'}`}>
              Spent This Month
            </h3>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${currentMonthTotal.toFixed(2)}
            </p>
          </div>
          
          <div className={`rounded-lg p-4 ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isOverBudget ? 'text-red-900' : 'text-green-900'}`}>
              {isOverBudget ? 'Over Budget' : 'Remaining Budget'}
            </h3>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(remainingBudget).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
              {budgetProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : budgetProgress > 80 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
          {isOverBudget && (
            <p className="text-red-600 text-sm mt-2">
              You are ${(currentMonthTotal - budget.monthlyLimit).toFixed(2)} over budget this month.
            </p>
          )}
        </div>

        {/* Average Daily Spending */}
        <div className="bg-purple-50 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Average Daily Spending</h3>
          <p className="text-2xl font-bold text-purple-600">${averageDailySpending.toFixed(2)}</p>
          <p className="text-sm text-purple-700 mt-1">
            Based on {new Date().getDate()} days this month
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Spending by Category (This Month)
          </h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: $${value?.toFixed(0) || 0} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expenses this month yet
            </div>
          )}
        </div>

        {/* Daily Spending Trend Line Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Daily Spending Trend (Last 30 Days)
          </h3>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Spent']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* Category Details Table */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Category Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number of Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average per Expense
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryBreakdown.map((item, index) => (
                  <tr key={item.category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(item.amount / item.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 