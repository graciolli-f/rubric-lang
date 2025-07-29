import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import { Navigation } from './components/Navigation';
import { useExpenseStore } from './store/expenseStore';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics'>('expenses');
  const { expenses, updateExchangeRates } = useExpenseStore();

  // Initialize data migration and exchange rates on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Migrate existing expenses to new format if needed
        const needsMigration = expenses.some(expense => 
          expense.originalAmount === undefined || 
          expense.originalCurrency === undefined ||
          expense.tags === undefined
        );

        if (needsMigration) {
          console.log('Migrating existing expenses to new format...');
          expenses.forEach(expense => {
            if (expense.originalAmount === undefined) {
              expense.originalAmount = expense.amount;
            }
            if (expense.originalCurrency === undefined) {
              expense.originalCurrency = 'USD';
            }
            if (expense.tags === undefined) {
              expense.tags = [];
            }
          });
        }

        // Update exchange rates on app initialization
        await updateExchangeRates();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [expenses, updateExchangeRates]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Track expenses with receipts, multiple currencies, tags, and recurring payments
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
