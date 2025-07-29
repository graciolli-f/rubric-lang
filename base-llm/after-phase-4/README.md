# Collaborative Expense Tracker

A modern, multi-user expense tracking application built with React, TypeScript, and real-time collaboration features.

## Features

### 🔐 User Authentication
- **Login/Signup**: Secure user registration and authentication
- **Role-based Access**: Employee, Manager, and Admin roles with different permissions
- **Profile Management**: User profile management with persistent sessions

### 👥 Expense Groups
- **Group Creation**: Users can create shared expense groups
- **Member Management**: Invite and manage group members with different roles
- **Group Context**: Switch between personal and group expense views
- **Demo Groups**: Pre-populated groups for testing (Marketing Team, Seattle Office)

### ✅ Approval Workflow
- **Automatic Approval Triggers**: Expenses over $500 require manager approval
- **Approval Queue**: Dedicated interface for managers to review pending expenses
- **Approve/Reject**: Full workflow with rejection reasons and notifications
- **Status Tracking**: Clear visibility of approval status for all expenses

### 🔄 Real-time Collaboration
- **Live Updates**: See expense changes in real-time across all users
- **Presence Indicators**: View who's currently online and what they're working on
- **Activity Feed**: Live stream of all group activities and changes
- **Conflict Resolution**: Optimistic updates with real-time synchronization

### 📊 Advanced Analytics
- **Multi-Currency Support**: Track expenses in different currencies with automatic conversion
- **Visual Dashboards**: Charts and graphs for expense analysis
- **Budget Tracking**: Set and monitor monthly budgets
- **Category Breakdown**: Detailed analysis by expense categories

### 🏷️ Smart Organization
- **Tags and Categories**: Flexible expense categorization
- **Recurring Expenses**: Automated recurring expense generation
- **Receipt Attachments**: Photo receipts with base64 storage
- **Export Functionality**: CSV export for external analysis

## Demo Accounts

The application includes pre-configured demo accounts for testing:

| Role | Email | Password | Permissions |
|------|--------|----------|-------------|
| Employee | john@example.com | password123 | Create personal expenses, view group expenses |
| Manager | jane@example.com | password123 | All employee permissions + approve expenses, manage groups |
| Admin | admin@example.com | password123 | Full access to all features and groups |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Quick Demo

1. **Login** with any of the demo accounts (or create a new account)
2. **Switch views** between Personal and Group expenses using the group selector
3. **Create an expense** over $500 to trigger the approval workflow
4. **Login as a manager** to see and approve pending expenses
5. **Open multiple browser tabs** to see real-time collaboration features

## Architecture

### Technology Stack
- **Frontend**: React 19+ with TypeScript
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **Real-time**: Simulated WebSocket service
- **Build Tool**: Vite

### Key Components

#### Services
- **AuthService**: Handles user authentication and profile management
- **GroupService**: Manages expense groups and member operations
- **WebSocketService**: Simulates real-time communication (demo only)
- **ExchangeService**: Currency conversion and formatting

#### Store
- **CollaborativeExpenseStore**: Zustand store managing all application state
- **Real-time Integration**: WebSocket event handling and optimistic updates
- **Multi-user State**: User sessions, groups, and collaborative features

#### Components
- **Auth Components**: Login, Signup, and authentication wrapper
- **Group Management**: Group selector, member management
- **Approval System**: Approval queue and workflow components
- **Real-time Features**: Presence indicators and activity feeds
- **Analytics**: Enhanced charts and reporting

## Features in Detail

### Multi-User Collaboration

The application supports real-time collaboration with the following features:

- **Live Presence**: See who's online and what they're viewing
- **Real-time Updates**: Changes appear instantly across all connected users
- **Activity Logging**: Complete audit trail of all user actions
- **Optimistic UI**: Immediate feedback with conflict resolution

### Expense Management

Enhanced expense tracking includes:

- **Multi-Currency**: Support for USD, EUR, GBP with live exchange rates
- **Smart Categorization**: Predefined categories with custom tags
- **Receipt Storage**: Base64 encoded image attachments
- **Recurring Expenses**: Automated recurring expense generation

### Group Functionality

Collaborative group features:

- **Role-based Permissions**: Different access levels for members, managers, and admins
- **Group Context Switching**: Seamless transition between personal and group views
- **Member Management**: Invite, remove, and manage group members
- **Group Settings**: Configurable approval thresholds and permissions

### Approval Workflow

Comprehensive approval system:

- **Threshold-based Triggers**: Configurable approval amounts (default $500)
- **Manager Queue**: Dedicated interface for pending approvals
- **Detailed Review**: Full expense details with approval/rejection options
- **Audit Trail**: Complete history of all approval actions

## Customization

### Configuration

Key configuration options can be modified in:

- **Approval Thresholds**: Update in `GroupService` or group settings
- **Currency Support**: Modify in `ExchangeService` for additional currencies
- **Demo Data**: Update mock data in service files for different test scenarios

### Adding Features

The modular architecture makes it easy to extend:

1. **New Services**: Add to `src/services/`
2. **UI Components**: Add to `src/components/`
3. **Store Extensions**: Extend the collaborative store
4. **Real-time Features**: Enhance WebSocket service

## Production Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Replace Mock Services** with real backend APIs:
   - WebSocket server for real-time features
   - Authentication service with JWT tokens
   - Database integration for persistent storage
   - Email service for notifications

3. **Environment Configuration**:
   - API endpoints
   - WebSocket URLs
   - Authentication providers

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Architecture Notes

- **State Management**: Zustand with persistence for offline capability
- **Real-time Simulation**: Mock WebSocket service for demo purposes
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Architecture**: Modular, reusable components with clear separation of concerns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
