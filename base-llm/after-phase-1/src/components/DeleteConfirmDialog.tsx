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