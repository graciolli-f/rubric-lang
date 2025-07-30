import React from 'react';

interface NavigationProps {
  activeView: "expenses" | "analytics";
  onViewChange: (view: "expenses" | "analytics") => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps): React.JSX.Element {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-8">
          <button
            onClick={() => onViewChange("expenses")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === "expenses"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => onViewChange("analytics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeView === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </nav>
  );
} 