import React, { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';

export const TagFilter: React.FC = () => {
  const { getAllTags, tagFilter, setTagFilter } = useExpenseStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const allTags = getAllTags();
  const selectedTags = tagFilter;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setTagFilter(selectedTags.filter(t => t !== tag));
    } else {
      setTagFilter([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setTagFilter([]);
  };

  const selectAllTags = () => {
    setTagFilter(allTags);
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          Filter by Tags
          {selectedTags.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {selectedTags.length}
            </span>
          )}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Select Tags</span>
              <div className="flex gap-2">
                <button
                  onClick={selectAllTags}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  All
                </button>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {allTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 cursor-pointer rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">#{tag}</span>
                </label>
              ))}
            </div>

            {selectedTags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Active filters:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}; 