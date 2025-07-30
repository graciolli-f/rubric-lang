import React, { useState } from 'react';
import type { ExpenseCategory, ExpenseFilters, ExportFilters } from '../types';
import { useExpenseStore } from '../stores/expenseStore';

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport', 
  'Shopping',
  'Bills',
  'Entertainment',
  'Other'
];

interface ExpenseFiltersProps {
  onFiltersChange: (filters: ExpenseFilters) => void;
  currentFilters: ExpenseFilters;
}

export default function ExpenseFiltersComponent({ onFiltersChange, currentFilters }: ExpenseFiltersProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  
  const { getAllTags, exportExpenses, expenses } = useExpenseStore();
  const allTags = getAllTags();

  const handleCategoryChange = (category: ExpenseCategory, checked: boolean) => {
    const categories = currentFilters.categories || [];
    const newCategories = checked
      ? [...categories, category]
      : categories.filter(c => c !== category);
    
    onFiltersChange({
      ...currentFilters,
      categories: newCategories.length > 0 ? newCategories : undefined
    });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const tags = currentFilters.tags || [];
    const newTags = checked
      ? [...tags, tag]
      : tags.filter(t => t !== tag);
    
    onFiltersChange({
      ...currentFilters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...currentFilters,
      [field]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExpenses(exportFilters);
      setShowExportModal(false);
      setExportFilters({});
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = 
    (currentFilters.categories && currentFilters.categories.length > 0) ||
    (currentFilters.tags && currentFilters.tags.length > 0) ||
    currentFilters.startDate ||
    currentFilters.endDate;

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Export</h3>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear all filters
            </button>
          )}
          
          <div className="ml-auto">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={currentFilters.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                placeholder="Start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <input
                type="date"
                value={currentFilters.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                placeholder="End date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentFilters.categories?.includes(category) || false}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            {allTags.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentFilters.tags?.includes(tag) || false}
                      onChange={(e) => handleTagChange(tag, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tags available</p>
            )}
          </div>

          {/* Filter Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
            <div className="text-sm text-gray-600">
              <p>{expenses.length} total expenses</p>
              {hasActiveFilters && (
                <p className="text-blue-600 font-medium">
                  Filters active
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Expenses</h3>
            
            <div className="space-y-4">
              {/* Export Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={exportFilters.startDate || ''}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                    placeholder="Start date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="date"
                    value={exportFilters.endDate || ''}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                    placeholder="End date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Export Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (Optional)
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportFilters.categories?.includes(category) || false}
                        onChange={(e) => {
                          const categories = exportFilters.categories || [];
                          const newCategories = e.target.checked
                            ? [...categories, category]
                            : categories.filter(c => c !== category);
                          setExportFilters(prev => ({
                            ...prev,
                            categories: newCategories.length > 0 ? newCategories : undefined
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                      />
                      <span className="text-xs text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFilters({});
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 