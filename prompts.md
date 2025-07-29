# Prompts for Expense Tracker

## Phase 1: Basic CRUD

```
I need an expense tracker application built with React and TypeScript.

Requirements:
- Form to add expenses with fields: amount, category (Food, Transport, Shopping, Bills, Entertainment, Other), date, and description
- Display all expenses in a list, sorted by date (newest first)
- Click any expense to edit it inline - the fields should become editable in place
- Delete button for each expense with a confirmation dialog
- Show running total at the bottom of the list
- Highlight the total in red if it exceeds $1000
- Use Tailwind CSS for styling
- Use Zustand for state management
- No database yet

Keep the implementation straightforward and focus on functionality and clean architecture. 
```

## Phase 2: Analytics Dashboard

```
Add analytics functionality to the expense tracker.

New requirements:
- Create a separate analytics page/view
- Add navigation to switch between expenses list and analytics
- Pie chart showing expense breakdown by category for the current month
- Line chart showing daily spending trends over the last 30 days
- Add budget management: users can set a monthly budget (default $2000)
- Show budget vs actual spending with a progress bar
- Display remaining budget for the month
- Use Recharts for data visualization
- Calculate and show average daily spending

Make sure the analytics update in real-time as expenses are added/edited.
```

## Phase 3: Advanced Features

```
Extend the expense tracker with these advanced features:

1. Receipt management:
   - Add ability to attach receipt photos to expenses
   - Display thumbnail in expense list
   - Click to view full size
   - Store images in base64 in localStorage

2. Multi-currency support:
   - Support USD, EUR, and GBP
   - Add currency field to expense form
   - Fetch real exchange rates from exchangerate-api.com
   - Show all amounts in user's preferred currency
   - Store amounts in original currency but display in preferred

3. Recurring expenses:
   - Add "recurring" checkbox to expense form
   - If checked, show frequency options (weekly/monthly)
   - Automatically generate future expenses
   - Mark recurring expenses with an icon in the list

4. Export functionality:
   - Add export button to download expenses as CSV
   - Include all fields in export
   - Allow date range selection for export

5. Tags and filtering:
   - Add tags field to expenses (comma-separated)
   - Add tag filter dropdown above expense list
   - Support multiple tag selection
   - Show tag pills on each expense
```

## Phase 4: Team Collaboration

```
Transform the expense tracker into a multi-user collaborative application.

Requirements:

1. User authentication:
   - Add login/signup pages
   - Store user profiles (name, email)
   - Each expense should track who created it

2. Expense groups:
   - Users can create shared expense groups (e.g., "Marketing Team", "Seattle Office")
   - Invite other users to groups via email
   - Expenses can be assigned to personal or group categories
   - Show group expenses separately

3. Approval workflow:
   - Expenses over $500 require manager approval
   - Add approve/reject buttons for managers
   - Show pending approval status
   - Email notifications for approval requests

4. Real-time collaboration:
   - When multiple users view the same group, show live updates
   - Display who's currently viewing with presence indicators
   - Show when someone is editing an expense
   - Implement optimistic updates with conflict resolution

5. Activity feed:
   - Show recent activity in the group
   - Track all changes (who added/edited/deleted what)
   - Include approval actions in the feed

Use WebSockets for real-time features. For now, simulate the backend with a simple WebSocket server or use mock data with setTimeout to demonstrate the real-time behavior.
```

## Additional Context Prompts (Used Throughout)

### When AI asks for clarification:
```
Just make a reasonable choice and continue. Use common patterns and best practices.
```

### When suggesting architectural changes:
```
Sure, go ahead and refactor if it makes the code better. Update any documentation as needed.
```

### When running into constraints:
```
Find a way to make it work within the current architecture. What's the best approach given our setup?
```

### For performance concerns:
```
Don't worry about optimization yet, just get it working. We can optimize later if needed.
```

### For error handling:
```
Add basic error handling - try/catch blocks and user-friendly error messages. Nothing complex.
```