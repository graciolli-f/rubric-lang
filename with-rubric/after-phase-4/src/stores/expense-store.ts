import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Expense, ExpenseFormData } from '../types/expense-types';
import { generateId } from '../utils/formatters';
import { processReceiptFile } from '../services/receipt-service';
import { generateRecurringExpenses, shouldGenerateRecurring } from '../services/recurring-service';
import { requiresApproval } from '../types/approval-types';

export interface ExpenseStoreState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (data: ExpenseFormData, createdBy: string) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getTotal: () => number;
  getSortedExpenses: () => Expense[];
  getExpenseById: (id: string) => Expense | undefined;
  getFilteredExpenses: (tags?: string[]) => Expense[];
  getAllTags: () => string[];
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        expenses: [],
        isLoading: false,
        error: null,

        addExpense: async (data: ExpenseFormData, createdBy: string) => {
          set({ isLoading: true, error: null });
          
          try {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount <= 0) {
              throw new Error('Amount must be a positive number');
            }

            // Process receipt if provided
            let receipt;
            if (data.receipt) {
              receipt = await processReceiptFile(data.receipt);
            }

            // Parse tags
            const tags = data.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);

            const now = new Date().toISOString();
            const newExpense: Expense = {
              id: generateId(),
              amount,
              category: data.category,
              date: data.date,
              description: data.description.trim(),
              createdAt: now,
              createdBy,
              groupId: data.groupId,
              currency: data.currency,
              originalAmount: amount,
              originalCurrency: data.currency,
              tags,
              isRecurring: data.isRecurring,
              recurringFrequency: data.recurringFrequency,
              receipt,
              approvalRequest: requiresApproval(amount) ? {
                id: generateId(),
                expenseId: generateId(),
                requestedBy: createdBy,
                requestedAt: now,
                status: 'pending'
              } : undefined
            };

            const allExpenses = [newExpense];

            // Generate recurring instances if applicable
            if (shouldGenerateRecurring(newExpense)) {
              const recurringInstances = generateRecurringExpenses(newExpense);
              allExpenses.push(...recurringInstances);
            }

            set(state => ({
              expenses: [...state.expenses, ...allExpenses],
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to add expense',
              isLoading: false 
            });
            throw error;
          }
        },

        updateExpense: async (id: string, data: Partial<Expense>) => {
          set({ isLoading: true, error: null });
          
          try {
            const { expenses } = get();
            const existingExpense = expenses.find(e => e.id === id);
            
            if (!existingExpense) {
              throw new Error('Expense not found');
            }

            const updatedExpense: Expense = {
              ...existingExpense,
              ...data,
              id, // Ensure ID cannot be changed
              updatedAt: new Date().toISOString()
            };

            set(state => ({
              expenses: state.expenses.map(e => e.id === id ? updatedExpense : e),
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update expense',
              isLoading: false 
            });
            throw error;
          }
        },

        deleteExpense: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            set(state => ({
              expenses: state.expenses.filter(e => e.id !== id),
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete expense',
              isLoading: false 
            });
            throw error;
          }
        },

        getTotal: () => {
          const { expenses } = get();
          return expenses.reduce((total, expense) => total + expense.amount, 0);
        },

        getSortedExpenses: () => {
          const { expenses } = get();
          return [...expenses].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        },

        getExpenseById: (id: string) => {
          const { expenses } = get();
          return expenses.find(e => e.id === id);
        },

        getFilteredExpenses: (tags?: string[]) => {
          const { expenses } = get();
          if (!tags || tags.length === 0) {
            return [...expenses].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }

          return expenses
            .filter(expense => 
              expense.tags && tags.some(tag => expense.tags.includes(tag))
            )
            .sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },

        getAllTags: () => {
          const { expenses } = get();
          const allTags = new Set<string>();
          expenses.forEach(expense => {
            if (expense.tags && Array.isArray(expense.tags)) {
              expense.tags.forEach(tag => allTags.add(tag));
            }
          });
          return Array.from(allTags).sort();
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'expense-tracker-data',
        partialize: (state) => ({ expenses: state.expenses }),
      }
    ),
    {
      name: 'expense-store',
    }
  )
); 