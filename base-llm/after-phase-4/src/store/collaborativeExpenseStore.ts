import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Expense, 
  Budget, 
  Currency, 
  UserPreferences, 
  ExchangeRates, 
  User, 
  ExpenseGroup, 
  ActivityLog, 
  ApprovalStatus,
  PresenceInfo 
} from '../types';
import { ExchangeService } from '../services/exchangeService';
import AuthService from '../services/authService';
import GroupService from '../services/groupService';
import WebSocketService from '../services/websocketService';
import { RecurringUtils } from '../utils/recurringUtils';
import { ExportUtils } from '../utils/exportUtils';

interface CollaborativeExpenseStore {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Expense state
  expenses: Expense[];
  personalExpenses: Expense[];
  groupExpenses: Map<string, Expense[]>;
  
  // Group state
  currentGroup: ExpenseGroup | null;
  userGroups: ExpenseGroup[];
  
  // UI state
  currentView: 'personal' | 'group';
  selectedGroupId: string | null;
  tagFilter: string[];
  
  // Real-time state
  presenceInfo: PresenceInfo[];
  activityFeed: ActivityLog[];
  isConnected: boolean;
  
  // Legacy state (for compatibility)
  budget: Budget;
  userPreferences: UserPreferences;
  
  // Authentication methods
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>, groupId?: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  approveExpense: (id: string, approval: boolean, reason?: string) => Promise<void>;
  
  // Group methods
  createGroup: (name: string, description: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  selectGroup: (groupId: string | null) => Promise<void>;
  switchToPersonalView: () => void;
  switchToGroupView: (groupId: string) => Promise<void>;
  
  // Data retrieval methods
  getExpenses: () => Expense[];
  getPersonalExpenses: () => Expense[];
  getGroupExpenses: (groupId?: string) => Expense[];
  getPendingApprovals: () => Expense[];
  getTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  getCurrentMonthTotal: () => number;
  getRemainingBudget: () => number;
  getDailySpendingData: () => { date: string; amount: number }[];
  getCategoryBreakdown: () => { category: string; amount: number; count: number }[];
  getAverageDailySpending: () => number;
  
  // Currency and preferences
  setPreferredCurrency: (currency: Currency) => void;
  updateExchangeRates: () => Promise<void>;
  getConvertedAmount: (originalAmount: number, originalCurrency: Currency) => number;
  formatAmount: (amount: number, currency?: Currency) => string;
  setBudget: (amount: number) => void;
  
  // Filtering and tags
  setTagFilter: (tags: string[]) => void;
  getFilteredExpenses: () => Expense[];
  getAllTags: () => string[];
  
  // Recurring expenses
  generateOverdueRecurringExpenses: () => void;
  toggleRecurringExpense: (id: string, isActive: boolean) => void;
  
  // Export functionality
  exportToCSV: (startDate?: string, endDate?: string) => Promise<void>;
  
  // Real-time methods
  broadcastExpenseUpdate: (expense: Expense, action: 'create' | 'update' | 'delete') => void;
  handleRealtimeUpdate: (expense: Expense, action: 'create' | 'update' | 'delete') => void;
  updatePresence: (view: string) => void;
  
  // Activity methods
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  getActivityFeed: (groupId?: string) => ActivityLog[];
}

const authService = AuthService.getInstance();
const groupService = GroupService.getInstance();
const wsService = WebSocketService.getInstance();
const exchangeService = ExchangeService.getInstance();

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useCollaborativeExpenseStore = create<CollaborativeExpenseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      expenses: [],
      personalExpenses: [],
      groupExpenses: new Map(),
      currentGroup: null,
      userGroups: [],
      currentView: 'personal',
      selectedGroupId: null,
      tagFilter: [],
      presenceInfo: [],
      activityFeed: [],
      isConnected: false,
      budget: {
        monthlyLimit: 2000,
        month: getCurrentMonth(),
      },
      userPreferences: {
        preferredCurrency: 'USD' as Currency,
        exchangeRates: { USD: 1, EUR: 0.85, GBP: 0.73 },
        lastRateUpdate: new Date().toISOString()
      },

      // Authentication methods
      login: async (user: User) => {
        set({ currentUser: user, isAuthenticated: true });
        
        // Load user's groups
        const groups = await groupService.getGroupsByUser(user.id);
        set({ userGroups: groups });
        
        // Connect to WebSocket
        try {
          await wsService.connect(user.id);
          set({ isConnected: true });
          
          // Set up real-time event handlers
          wsService.on('expense_update', (message) => {
            get().handleRealtimeUpdate(message.payload, 'update');
          });
          
          wsService.on('expense_create', (message) => {
            get().handleRealtimeUpdate(message.payload, 'create');
          });
          
          wsService.on('expense_delete', (message) => {
            get().handleRealtimeUpdate(message.payload, 'delete');
          });
          
          wsService.onPresenceUpdate((presence) => {
            set({ presenceInfo: presence });
          });
          
          wsService.on('activity_update', (message) => {
            const { activityFeed } = get();
            set({ activityFeed: [message.payload, ...activityFeed].slice(0, 100) });
          });
          
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
        }
      },

      logout: async () => {
        wsService.disconnect();
        await authService.logout();
        set({
          currentUser: null,
          isAuthenticated: false,
          expenses: [],
          personalExpenses: [],
          groupExpenses: new Map(),
          currentGroup: null,
          userGroups: [],
          selectedGroupId: null,
          presenceInfo: [],
          activityFeed: [],
          isConnected: false
        });
      },

      // Expense methods
      addExpense: async (expenseData, groupId) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const newExpense: Expense = {
          ...expenseData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          createdBy: currentUser.id,
          groupId,
          amount: get().getConvertedAmount(expenseData.originalAmount, expenseData.originalCurrency),
          tags: expenseData.tags || [],
        };

        // Check if approval is required
        const approvalThreshold = groupId ? 
          (await groupService.getGroupById(groupId))?.settings.requireApprovalThreshold || 500 : 
          500;
          
        if (newExpense.amount >= approvalThreshold) {
          newExpense.approval = { status: 'pending' };
        }

        // Add to appropriate expense list
        if (groupId) {
          const groupExpenses = get().groupExpenses.get(groupId) || [];
          get().groupExpenses.set(groupId, [...groupExpenses, newExpense]);
        } else {
          set(state => ({ personalExpenses: [...state.personalExpenses, newExpense] }));
        }

        // Update main expenses array
        set(state => ({ expenses: [...state.expenses, newExpense] }));

        // Broadcast update
        get().broadcastExpenseUpdate(newExpense, 'create');

        // Log activity
        get().addActivity({
          groupId: groupId || '',
          userId: currentUser.id,
          action: 'expense_created',
          target: newExpense.id,
          details: `Created expense: ${newExpense.description} (${get().formatAmount(newExpense.amount)})`
        });

        // Auto-generate recurring instances if needed
        if (expenseData.recurring && expenseData.recurring.isActive) {
          get().generateOverdueRecurringExpenses();
        }
      },

      updateExpense: async (id, updates) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        set(state => ({
          expenses: state.expenses.map(expense => {
            if (expense.id === id) {
              const updatedExpense = { 
                ...expense, 
                ...updates,
                lastModifiedBy: currentUser.id,
                lastModifiedAt: new Date().toISOString()
              };
              
              // Recalculate converted amount if currency changed
              if (updates.originalAmount !== undefined || updates.originalCurrency !== undefined) {
                updatedExpense.amount = get().getConvertedAmount(
                  updatedExpense.originalAmount,
                  updatedExpense.originalCurrency
                );
              }
              
              // Update group expenses map
              if (expense.groupId) {
                const groupExpenses = get().groupExpenses.get(expense.groupId) || [];
                const groupIndex = groupExpenses.findIndex(e => e.id === id);
                if (groupIndex !== -1) {
                  groupExpenses[groupIndex] = updatedExpense;
                  get().groupExpenses.set(expense.groupId, groupExpenses);
                }
              } else {
                // Update personal expenses
                set(state => ({
                  personalExpenses: state.personalExpenses.map(e => 
                    e.id === id ? updatedExpense : e
                  )
                }));
              }

              // Broadcast update
              get().broadcastExpenseUpdate(updatedExpense, 'update');

              // Log activity
              get().addActivity({
                groupId: expense.groupId || '',
                userId: currentUser.id,
                action: 'expense_updated',
                target: id,
                details: `Updated expense: ${updatedExpense.description}`
              });

              return updatedExpense;
            }
            return expense;
          })
        }));
      },

      deleteExpense: async (id) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const expense = get().expenses.find(e => e.id === id);
        if (!expense) return;

        // Remove from main expenses
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }));

        // Remove from appropriate list
        if (expense.groupId) {
          const groupExpenses = get().groupExpenses.get(expense.groupId) || [];
          get().groupExpenses.set(
            expense.groupId, 
            groupExpenses.filter(e => e.id !== id)
          );
        } else {
          set(state => ({
            personalExpenses: state.personalExpenses.filter(e => e.id !== id)
          }));
        }

        // Broadcast update
        get().broadcastExpenseUpdate(expense, 'delete');

        // Log activity
        get().addActivity({
          groupId: expense.groupId || '',
          userId: currentUser.id,
          action: 'expense_deleted',
          target: id,
          details: `Deleted expense: ${expense.description}`
        });
      },

      approveExpense: async (id, approved, reason) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const expense = get().expenses.find(e => e.id === id);
        if (!expense || !expense.approval) return;

        const approval: ApprovalStatus = {
          status: approved ? 'approved' : 'rejected',
          approvedBy: currentUser.id,
          approvedAt: new Date().toISOString(),
          rejectionReason: reason
        };

        await get().updateExpense(id, { approval });

        // Log activity
        get().addActivity({
          groupId: expense.groupId || '',
          userId: currentUser.id,
          action: approved ? 'expense_approved' : 'expense_rejected',
          target: id,
          details: `${approved ? 'Approved' : 'Rejected'} expense: ${expense.description}${reason ? ` (${reason})` : ''}`
        });
      },

      // Group methods
      createGroup: async (name, description) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const newGroup = await groupService.createGroup({ name, description }, currentUser.id);
        set(state => ({ userGroups: [...state.userGroups, newGroup] }));
      },

      joinGroup: async (groupId) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        await wsService.joinGroup(groupId);
        const group = await groupService.getGroupById(groupId);
        if (group) {
          set({ currentGroup: group, selectedGroupId: groupId, currentView: 'group' });
          
          // Load group expenses (mock implementation)
          const groupExpenses = get().expenses.filter(e => e.groupId === groupId);
          get().groupExpenses.set(groupId, groupExpenses);
        }
      },

      leaveGroup: async (groupId) => {
        await wsService.leaveGroup();
        if (get().selectedGroupId === groupId) {
          set({ currentGroup: null, selectedGroupId: null, currentView: 'personal' });
        }
      },

      selectGroup: async (groupId) => {
        if (groupId) {
          await get().joinGroup(groupId);
        } else {
          get().switchToPersonalView();
        }
      },

      switchToPersonalView: () => {
        wsService.leaveGroup();
        set({ 
          currentView: 'personal', 
          selectedGroupId: null, 
          currentGroup: null 
        });
        wsService.updatePresence('personal');
      },

      switchToGroupView: async (groupId) => {
        await get().joinGroup(groupId);
        wsService.updatePresence(`group-${groupId}`);
      },

      // Data retrieval methods
      getExpenses: () => {
        const { currentView, selectedGroupId } = get();
        if (currentView === 'personal') {
          return get().getPersonalExpenses();
        } else if (selectedGroupId) {
          return get().getGroupExpenses(selectedGroupId);
        }
        return get().expenses;
      },

      getPersonalExpenses: () => {
        return get().personalExpenses;
      },

      getGroupExpenses: (groupId) => {
        if (!groupId) return [];
        return get().groupExpenses.get(groupId) || [];
      },

      getPendingApprovals: () => {
        return get().getExpenses().filter(expense => 
          expense.approval?.status === 'pending'
        );
      },

      getTotal: () => {
        return get().getExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getCurrentMonthExpenses: () => {
        const currentMonth = getCurrentMonth();
        return get().getFilteredExpenses().filter(expense => 
          expense.date.startsWith(currentMonth)
        );
      },

      getCurrentMonthTotal: () => {
        return get().getCurrentMonthExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getRemainingBudget: () => {
        const { budget } = get();
        const spent = get().getCurrentMonthTotal();
        return budget.monthlyLimit - spent;
      },

      getDailySpendingData: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const expenses = get().getFilteredExpenses().filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        );

        const dailyData = new Map<string, number>();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyData.set(dateStr, 0);
        }

        expenses.forEach(expense => {
          const dateStr = expense.date.split('T')[0];
          dailyData.set(dateStr, (dailyData.get(dateStr) || 0) + expense.amount);
        });

        return Array.from(dailyData.entries())
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCategoryBreakdown: () => {
        const expenses = get().getFilteredExpenses();
        const breakdown = new Map<string, { amount: number; count: number }>();

        expenses.forEach(expense => {
          const existing = breakdown.get(expense.category) || { amount: 0, count: 0 };
          breakdown.set(expense.category, {
            amount: existing.amount + expense.amount,
            count: existing.count + 1
          });
        });

        return Array.from(breakdown.entries()).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count
        }));
      },

      getAverageDailySpending: () => {
        const dailyData = get().getDailySpendingData();
        const totalSpending = dailyData.reduce((sum, day) => sum + day.amount, 0);
        return totalSpending / dailyData.length;
      },

      // Currency and preferences methods
      setPreferredCurrency: (currency) => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            preferredCurrency: currency
          }
        }));
      },

      updateExchangeRates: async () => {
        try {
          const rates = await exchangeService.getLatestRates();
          set(state => ({
            userPreferences: {
              ...state.userPreferences,
              exchangeRates: rates,
              lastRateUpdate: new Date().toISOString()
            }
          }));
        } catch (error) {
          console.error('Failed to update exchange rates:', error);
        }
      },

      getConvertedAmount: (originalAmount, originalCurrency) => {
        const { userPreferences } = get();
        const rates = userPreferences.exchangeRates;
        const preferredCurrency = userPreferences.preferredCurrency;
        
        if (originalCurrency === preferredCurrency) {
          return originalAmount;
        }
        
        const usdAmount = originalAmount / (rates[originalCurrency] || 1);
        return usdAmount * (rates[preferredCurrency] || 1);
      },

      formatAmount: (amount, currency) => {
        const { userPreferences } = get();
        const targetCurrency = currency || userPreferences.preferredCurrency;
        return exchangeService.formatCurrency(amount, targetCurrency);
      },

      setBudget: (amount) => {
        set(state => ({
          budget: {
            ...state.budget,
            monthlyLimit: amount,
            month: getCurrentMonth(),
          }
        }));
      },

      // Filtering and tags
      setTagFilter: (tags) => {
        set({ tagFilter: tags });
      },

      getFilteredExpenses: () => {
        const expenses = get().getExpenses();
        const { tagFilter } = get();
        
        if (tagFilter.length === 0) {
          return expenses;
        }
        
        return expenses.filter(expense =>
          tagFilter.some(tag => expense.tags.includes(tag))
        );
      },

      getAllTags: () => {
        const expenses = get().getExpenses();
        const tags = new Set<string>();
        expenses.forEach(expense => {
          expense.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
      },

      // Recurring expenses
      generateOverdueRecurringExpenses: () => {
        RecurringUtils.generateOverdueExpenses(get().expenses, get().addExpense);
      },

      toggleRecurringExpense: (id, isActive) => {
        get().updateExpense(id, {
          recurring: {
            ...get().expenses.find(e => e.id === id)?.recurring,
            isActive
          }
        });
      },

      // Export functionality
      exportToCSV: async (startDate, endDate) => {
        const expenses = get().getFilteredExpenses();
        await ExportUtils.exportToCSV(expenses, startDate, endDate);
      },

      // Real-time methods
      broadcastExpenseUpdate: (expense, action) => {
        if (wsService.isConnected()) {
          wsService.broadcastExpenseUpdate(expense, action);
        }
      },

      handleRealtimeUpdate: (expense, action) => {
        const { currentUser } = get();
        if (!currentUser || expense.createdBy === currentUser.id) {
          // Don't process our own updates
          return;
        }

        switch (action) {
          case 'create':
            set(state => ({ expenses: [...state.expenses, expense] }));
            break;
          case 'update':
            set(state => ({
              expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
            }));
            break;
          case 'delete':
            set(state => ({
              expenses: state.expenses.filter(e => e.id !== expense.id)
            }));
            break;
        }
      },

      updatePresence: (view) => {
        wsService.updatePresence(view);
      },

      // Activity methods
      addActivity: (activity) => {
        const newActivity: ActivityLog = {
          ...activity,
          id: `activity-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          activityFeed: [newActivity, ...state.activityFeed].slice(0, 100)
        }));
      },

      getActivityFeed: (groupId) => {
        const { activityFeed } = get();
        if (!groupId) return activityFeed;
        return activityFeed.filter(activity => activity.groupId === groupId);
      }
    }),
    {
      name: 'collaborative-expense-store',
      partialize: (state) => ({
        expenses: state.expenses,
        personalExpenses: state.personalExpenses,
        budget: state.budget,
        userPreferences: state.userPreferences,
        tagFilter: state.tagFilter
      })
    }
  )
); 