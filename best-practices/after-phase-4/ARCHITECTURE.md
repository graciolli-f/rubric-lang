# Expense Tracker Architecture

## Overview
This application follows clean architecture principles with clear separation of concerns across different layers.

## Architecture Layers

### 1. Presentation Layer (UI)
- **Location**: `src/components/`, `src/pages/`
- **Responsibility**: Display data and handle user interactions
- **Rules**:
  - Components should be pure and focused on rendering
  - No business logic in components
  - Use props and callbacks for data flow
  - Keep components under 200 lines

### 2. State Management Layer
- **Location**: `src/stores/`
- **Technology**: Zustand
- **Responsibility**: Application state management
- **Rules**:
  - Stores coordinate between UI and services
  - No direct API calls from stores
  - Stores should not contain complex business logic
  - Use actions for state modifications

### 3. Business Logic Layer (Services)
- **Location**: `src/services/`
- **Responsibility**: Core business logic and rules
- **Rules**:
  - Services are pure functions when possible
  - No UI framework dependencies
  - Services handle validation, calculations, and transformations
  - One service per domain concept

### 4. Data Access Layer
- **Location**: `src/data/`
- **Responsibility**: External data operations
- **Rules**:
  - Handles localStorage, API calls, etc.
  - Returns domain objects, not raw data
  - Error handling at this layer
  - No business logic

## Data Flow
```
UI Components → Stores → Services → Data Layer
     ↑                                    ↓
     ←──────────── State Updates ────────←
```

## Key Principles

### Separation of Concerns
- Each layer has a single, well-defined responsibility
- Dependencies flow inward (UI → Services → Data)
- No circular dependencies

### Dependency Rule
- Inner layers should not know about outer layers
- Use interfaces/contracts between layers
- Dependency injection where appropriate

## Folder Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── stores/        # Zustand stores
├── services/      # Business logic
├── data/          # Data access
├── types/         # TypeScript types
├── utils/         # Shared utilities
└── App.tsx        # Application root
```

## Best Practices

### Component Guidelines
- One component per file
- Props interface defined
- No direct store access in dumb components
- Use custom hooks for complex logic

### Service Guidelines  
- Services should be stateless
- Group related operations
- Clear method names
- Comprehensive error handling

### State Management
- Minimal store size
- Derived state through selectors
- Actions for all mutations
- No async operations in stores

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Consistent naming conventions
- Documentation for complex logic