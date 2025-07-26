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