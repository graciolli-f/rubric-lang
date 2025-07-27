import React from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Track your expenses and stay within budget
          </p>
        </header>

        <main className="space-y-8">
          <ExpenseForm />
          <ExpenseList />
        </main>
      </div>
    </div>
  );
}

export default App;
