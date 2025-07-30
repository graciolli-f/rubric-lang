import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  BarChart3, 
  CreditCard, 
  Users, 
  Activity, 
  User, 
  LogOut,
  Home
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function Navigation() {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const navItems: NavItem[] = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: <Home className="w-5 h-5" />
    },
    { 
      path: '/expenses', 
      label: 'Expenses', 
      icon: <CreditCard className="w-5 h-5" />
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: <BarChart3 className="w-5 h-5" />
    },
    { 
      path: '/groups', 
      label: 'Groups', 
      icon: <Users className="w-5 h-5" />
    },
    { 
      path: '/activity', 
      label: 'Activity', 
      icon: <Activity className="w-5 h-5" />
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="flex items-center justify-between">
      {/* Main Navigation */}
      <div className="flex space-x-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* User Menu */}
      <div className="flex items-center space-x-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
} 