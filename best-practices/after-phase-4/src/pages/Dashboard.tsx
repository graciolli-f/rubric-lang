import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCollaborationStore } from '../stores/collaborationStore';
import { useExpenseStore } from '../stores/expenseStore';
import { mockUsers } from '../stores/authStore';
import { 
  Plus, 
  CreditCard, 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { getUserGroups, getPendingApprovals } = useCollaborationStore();
  const { expenses } = useExpenseStore();

  const userGroups = getUserGroups(user?.id || '');
  const pendingApprovals = getPendingApprovals(user?.id || '');
  const recentExpenses = expenses.slice(0, 5);
  
  // Calculate total for this month
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const stats = [
    {
      name: 'Total This Month',
      value: `$${totalThisMonth.toFixed(2)}`,
      icon: CreditCard,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Groups',
      value: userGroups.length.toString(),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Approvals',
      value: pendingApprovals.length.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Expenses',
      value: expenses.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Here's your expense tracker overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <Link
                to="/expenses"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center">
                        {expense.approvalStatus === 'approved' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {expense.approvalStatus === 'pending' && (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        {expense.approvalStatus === 'rejected' && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No expenses yet</p>
                <Link
                  to="/expenses"
                  className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Add your first expense
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Groups & Approvals */}
        <div className="space-y-6">
          {/* Your Groups */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
                <Link
                  to="/groups"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {userGroups.length > 0 ? (
                <div className="space-y-3">
                  {userGroups.slice(0, 3).map((group) => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-500">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No groups yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Approvals
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {pendingApprovals.slice(0, 3).map((approval) => {
                    const requester = mockUsers.find(u => u.id === approval.requestedBy);
                    return (
                      <div key={approval.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Expense approval
                            </p>
                            <p className="text-sm text-gray-500">
                              From {requester?.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/expenses"
            className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-8 h-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-indigo-900">Add Expense</p>
              <p className="text-xs text-indigo-600">Create new expense</p>
            </div>
          </Link>
          
          <Link
            to="/groups"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Join Group</p>
              <p className="text-xs text-green-600">Collaborate with team</p>
            </div>
          </Link>
          
          <Link
            to="/analytics"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">View Analytics</p>
              <p className="text-xs text-purple-600">Check spending trends</p>
            </div>
          </Link>
          
          <Link
            to="/activity"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-900">Activity Feed</p>
              <p className="text-xs text-orange-600">Recent updates</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 