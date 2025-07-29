# Add analytics functionality to expense tracker
_Exported on 7/27/2025 at 14:09:57 EDT from Cursor (1.2.4)_

---

**User**

Add analytics functionality to the expense tracker.

New requirements:
- Create a separate analytics page/view
- Add navigation to switch between expenses list and analytics
- Pie chart showing expense breakdown by category for the current month
- Line chart showing daily spending trends over the last 30 days
- Add budget management: users can set a monthly budget (default $2000)
- Show budget vs actual spending with a progress bar
- Display remaining budget for the month
- Use Recharts for data visualization
- Calculate and show average daily spending

Make sure the analytics update in real-time as expenses are added/edited.

---

**Cursor**

I'll help you add comprehensive analytics functionality to your expense tracker. This is a complex feature with multiple components, so let me start by exploring the current codebase structure and then implement all the required analytics features.

```typescript
export interface ExpenseFormData {
  amount: string;
  category: Category;
  date: string;
  description: string;
}

->

export interface ExpenseFormData {
  amount: string;
  category: Category;
  date: string;
  description: string;
}

export interface Budget {
  monthlyLimit: number;
  month: string; // Format: YYYY-MM
}
```

```typescript
import { create } from 'zustand';
import type { Expense } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
}

->

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, Budget } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  budget: Budget;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
  setBudget: (amount: number) => void;
  getCurrentMonthExpenses: () => Expense[];
  getCurrentMonthTotal: () => number;
  getRemainingBudget: () => number;
  getDailySpendingData: () => { date: string; amount: number }[];
  getCategoryBreakdown: () => { category: string; amount: number; count: number }[];
  getAverageDailySpending: () => number;
}
```

```typescript
export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      expenses: [...state.expenses, newExpense]
    }));
  },
  
  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    }));
  },
  
  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    }));
  },
  
  getTotal: () => {
    return get().expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}));

->

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      budget: {
        monthlyLimit: 2000,
        month: getCurrentMonth(),
      },
      
      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          expenses: [...state.expenses, newExpense]
        }));
      },
      
      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        }));
      },
      
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id)
        }));
      },
      
      getTotal: () => {
        return get().expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      setBudget: (amount) => {
        set((state) => ({
          budget: {
            ...state.budget,
            monthlyLimit: amount,
            month: getCurrentMonth(),
          }
        }));
      },

      getCurrentMonthExpenses: () => {
        const currentMonth = getCurrentMonth();
        return get().expenses.filter(expense => 
          expense.date.startsWith(currentMonth)
        );
      },

      getCurrentMonthTotal: () => {
        return get().getCurrentMonthExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getRemainingBudget: () => {
        const { budget } = get();
        const spent = get().getCurrentMonthTotal();
        return budget.monthlyLimit - spent;
      },

      getDailySpendingData: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const expenses = get().expenses.filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        );

        const dailyTotals: { [key: string]: number } = {};
        
        // Initialize all days with 0
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyTotals[dateStr] = 0;
        }

        // Sum expenses by day
        expenses.forEach(expense => {
          const date = expense.date;
          dailyTotals[date] = (dailyTotals[date] || 0) + expense.amount;
        });

        return Object.entries(dailyTotals)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCategoryBreakdown: () => {
        const currentMonthExpenses = get().getCurrentMonthExpenses();
        const breakdown: { [key: string]: { amount: number; count: number } } = {};

        currentMonthExpenses.forEach(expense => {
          if (!breakdown[expense.category]) {
            breakdown[expense.category] = { amount: 0, count: 0 };
          }
          breakdown[expense.category].amount += expense.amount;
          breakdown[expense.category].count += 1;
        });

        return Object.entries(breakdown).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
        }));
      },

      getAverageDailySpending: () => {
        const currentMonthExpenses = get().getCurrentMonthExpenses();
        const currentDate = new Date();
        const dayOfMonth = currentDate.getDate();
        const total = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return dayOfMonth > 0 ? total / dayOfMonth : 0;
      },
    }),
    {
      name: 'expense-store',
    }
  )
);
```

```typescriptreact
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
                    `${name}: $${value.toFixed(0)} (${(percent * 100).toFixed(0)}%)`
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
```

```typescriptreact
                  label={({ name, value, percent }) => 
                    `${name}: $${value.toFixed(0)} (${(percent * 100).toFixed(0)}%)`
                  }

->

                  label={({ name, value, percent }) => 
                    `${name}: $${value?.toFixed(0) || 0} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
```

```typescriptreact
import React from 'react';

interface NavigationProps {
  activeView: 'expenses' | 'analytics';
  onViewChange: (view: 'expenses' | 'analytics') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange('expenses')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
          activeView === 'expenses'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Expenses
      </button>
      <button
        onClick={() => onViewChange('analytics')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
          activeView === 'analytics'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Analytics
      </button>
    </div>
  );
};
```

```typescriptreact
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Track your expenses and manage your budget
          </p>
        </div>
        
        <ExpenseForm />
        <ExpenseList />
      </div>
    </div>
  );
}

->

import React, { useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import { Navigation } from './components/Navigation';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics'>('expenses');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Track your expenses and manage your budget
          </p>
          
          <Navigation activeView={activeView} onViewChange={setActiveView} />
        </div>
        
        {activeView === 'expenses' ? (
          <>
            <ExpenseForm />
            <ExpenseList />
          </>
        ) : (
          <Analytics />
        )}
      </div>
    </div>
  );
}
```

Perfect! I've successfully implemented comprehensive analytics functionality for your expense tracker. Here's what has been added:

## New Features Implemented:

### 🔄 Navigation System
- Added a clean navigation component to switch between "Expenses" and "Analytics" views
- Smooth transitions and active state indicators

### 📊 Analytics Dashboard
**Budget Management:**
- Monthly budget setting (default $2000, editable)
- Current month spending display
- Remaining budget or overspending amount
- Visual progress bar with color coding (blue → yellow → red)
- Over-budget warnings

**Data Visualizations:**
- **Pie Chart**: Category breakdown for current month expenses
- **Line Chart**: Daily spending trends over the last 30 days
- Both charts use Recharts library with interactive tooltips

**Key Metrics:**
- Average daily spending calculation
- Detailed category breakdown table with totals and averages
- Real-time updates when expenses are modified

### 💾 Enhanced Data Management
- Extended Zustand store with analytics methods
- Added data persistence for budget settings
- Smart date filtering for current month and 30-day periods

### 🎨 UI/UX Features
- Responsive design that works on all screen sizes
- Color-coded budget status indicators
- Empty state handling for charts
- Professional dashboard layout

## Real-time Updates
The analytics automatically update whenever you:
- Add new expenses
- Edit existing expenses  
- Delete expenses
- Change budget settings

This works because the Analytics component is subscribed to the Zustand store, which triggers re-renders when data changes.

The development server should be running now. You can test the analytics by:
1. Adding some sample expenses in different categories
2. Switching to the Analytics view to see the charts populate
3. Trying different budget amounts to see the progress indicators
4. Adding expenses on different dates to see the daily trends

All requirements have been fully implemented with additional polish for a professional user experience!

