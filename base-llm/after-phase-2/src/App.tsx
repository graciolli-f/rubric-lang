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

export default App;
