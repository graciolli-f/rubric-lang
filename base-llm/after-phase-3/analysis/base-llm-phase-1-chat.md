# Build a React TypeScript expense tracker
_Exported on 7/26/2025 at 11:32:26 EDT from Cursor (1.2.4)_

---

**User**

I need an expense tracker application built with React and TypeScript.

Requirements:
- Form to add expenses with fields: amount, category (Food, Transport, Shopping, Bills, Entertainment, Other), date, and description
- Display all expenses in a list, sorted by date (newest first)
- Click any expense to edit it inline - the fields should become editable in place
- Delete button for each expense with a confirmation dialog
- Show running total at the bottom of the list
- Highlight the total in red if it exceeds $1000
- Use Zustand for state management
- No database yet

Keep the implementation straightforward and focus on functionality and clean architecture. 

---

**Cursor**

I'll help you build an expense tracker application with React and TypeScript. Let me first explore the current project structure to understand what's already set up.

Perfect! I can see you have a React + TypeScript project already set up with Zustand and Tailwind CSS. Let me build the expense tracker application according to your requirements.

```typescript
export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  BILLS = 'Bills',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string for sorting
}

export interface ExpenseFormData {
  amount: string;
  category: Category;
  date: string;
  description: string;
}
```

```typescript
import { create } from 'zustand';
import { Expense, Category } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  getTotal: () => number;
}

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
```

```typescript
export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  BILLS = 'Bills',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

->

export const Category = {
  FOOD: 'Food',
  TRANSPORT: 'Transport',
  SHOPPING: 'Shopping',
  BILLS: 'Bills',
  ENTERTAINMENT: 'Entertainment',
  OTHER: 'Other'
} as const;

export type Category = typeof Category[keyof typeof Category];
```

```typescript
import { create } from 'zustand';
import { Expense, Category } from '../types';

->

import { create } from 'zustand';
import type { Expense, Category } from '../types';
```

```typescriptreact
import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { Category } from '../types';
import type { ExpenseFormData } from '../types';

export const ExpenseForm: React.FC = () => {
  const addExpense = useExpenseStore((state) => state.addExpense);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: Category.OTHER,
    date: new Date().toISOString().split('T')[0], // Today's date
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    addExpense({
      amount,
      category: formData.category,
      date: formData.date,
      description: formData.description.trim()
    });

    // Reset form
    setFormData({
      amount: '',
      category: Category.OTHER,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {Object.values(Category).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter description..."
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
      >
        Add Expense
      </button>
    </form>
  );
};
```

```typescriptreact
import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  expenseDescription: string;
  expenseAmount: number;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  expenseDescription,
  expenseAmount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Delete Expense
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this expense?
        </p>
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="font-medium">${expenseAmount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">{expenseDescription}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
```

```typescriptreact
import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { Category } from '../types';
import type { Expense } from '../types';

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { updateExpense, deleteExpense } = useExpenseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [editData, setEditData] = useState({
    amount: expense.amount.toString(),
    category: expense.category,
    date: expense.date,
    description: expense.description
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const amount = parseFloat(editData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    updateExpense(expense.id, {
      amount,
      category: editData.category,
      date: editData.date,
      description: editData.description.trim()
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      description: expense.description
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteExpense(expense.id);
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: Category) => {
    const colors = {
      [Category.FOOD]: 'bg-green-100 text-green-800',
      [Category.TRANSPORT]: 'bg-blue-100 text-blue-800',
      [Category.SHOPPING]: 'bg-purple-100 text-purple-800',
      [Category.BILLS]: 'bg-red-100 text-red-800',
      [Category.ENTERTAINMENT]: 'bg-yellow-100 text-yellow-800',
      [Category.OTHER]: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editData.amount}
              onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value as Category })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.values(Category).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <input
              type="text"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition duration-200"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 cursor-pointer transition duration-200"
        onClick={handleEdit}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-gray-900">
                ${expense.amount.toFixed(2)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(expense.date)}
              </span>
            </div>
            <p className="text-gray-700">{expense.description}</p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="ml-4 text-red-500 hover:text-red-700 transition duration-200"
            title="Delete expense"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        expenseDescription={expense.description}
        expenseAmount={expense.amount}
      />
    </>
  );
};
```

```typescriptreact
import React from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { ExpenseItem } from './ExpenseItem';

export const ExpenseList: React.FC = () => {
  const { expenses, getTotal } = useExpenseStore();
  
  // Sort expenses by date (newest first), then by creation time
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return dateCompare;
  });

  const total = getTotal();
  const isOverBudget = total > 1000;

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense using the form above</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Expenses ({expenses.length})
        </h2>
        
        <div className="space-y-3">
          {sortedExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Total:</span>
            <span 
              className={`text-2xl font-bold ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              ${total.toFixed(2)}
            </span>
          </div>
          {isOverBudget && (
            <p className="text-sm text-red-600 mt-2 text-right">
              Warning: You've exceeded $1,000 in expenses
            </p>
          )}
        </div>
      </div>
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

export default App;
```

```typescript
import { create } from 'zustand';
import type { Expense, Category } from '../types';

->

import { create } from 'zustand';
import type { Expense } from '../types';
```

Perfect! I've successfully built your expense tracker application with React and TypeScript. The application is now fully functional and ready to use.

## What's been implemented:

### Core Features:
- **Add expenses form** with fields for amount, category (Food, Transport, Shopping, Bills, Entertainment, Other), date, and description
- **Expense list** displaying all expenses sorted by date (newest first)
- **Inline editing** - click any expense to edit fields directly in place
- **Delete functionality** with confirmation dialog before removing expenses
- **Running total** displayed at the bottom of the list
- **Red highlighting** when total exceeds $1,000 with warning message

### Technical Implementation:
- **Zustand state management** for clean, centralized state handling
- **TypeScript** for type safety with proper interfaces and types
- **Tailwind CSS** for responsive, modern styling
- **Component architecture** with reusable components:
  - `ExpenseForm` - Form for adding new expenses
  - `ExpenseList` - Container for displaying expenses and total
  - `ExpenseItem` - Individual expense with inline editing
  - `DeleteConfirmDialog` - Confirmation modal for deletions

### Key Functionality:
- Form validation (prevents invalid amounts)
- Automatic form reset after submission
- Color-coded categories with badges
- Date formatting for better readability
- Responsive design that works on mobile and desktop
- Clean, intuitive user interface

The application is now running on the development server and builds successfully. You can:

1. **Add expenses** using the form at the top
2. **View all expenses** sorted by date (newest first)
3. **Edit any expense** by clicking on it
4. **Delete expenses** using the trash icon (with confirmation)
5. **Monitor your total** with automatic red highlighting if over $1,000

The code is well-structured, follows React best practices, and uses modern TypeScript patterns. The state management with Zustand makes it easy to extend with additional features when you're ready to add a database or more advanced functionality.

