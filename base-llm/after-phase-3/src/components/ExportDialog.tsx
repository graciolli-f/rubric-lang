import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  const { exportToCSV, userPreferences } = useExpenseStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToCSV(startDate || undefined, endDate || undefined);
      onClose();
      // Reset form
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export expenses. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    setStartDate('');
    setEndDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Export Expenses</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Export your expenses to a CSV file. All amounts will be shown in your preferred currency ({userPreferences.preferredCurrency}).
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (optional)
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  {startDate && endDate
                    ? `Exporting expenses from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                    : startDate
                    ? `Exporting expenses from ${new Date(startDate).toLocaleDateString()} onwards`
                    : `Exporting expenses up to ${new Date(endDate).toLocaleDateString()}`
                  }
                </p>
              </div>
            )}

            {!startDate && !endDate && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  All expenses will be exported
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </span>
              ) : (
                'Export CSV'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 