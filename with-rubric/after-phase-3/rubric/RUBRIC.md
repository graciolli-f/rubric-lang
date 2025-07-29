# Rubric Architecture Guide

This project uses Rubric (.rux files) to enforce clean architecture. Rubric is a constraint-driven approach to writing code. Rubric is *NOT* a suggestion. Rubric is *NOT* documentation. Rubric is LAW that should precede and inform all code. 

## Process you must follow when writing any code for this code base

For each new module:
1. CREATE .rux file first (using template) if one does not already exist
2. PLAN code to fit constraints  
3. WRITE code following the spec
4. RUN validation → must show "All constraints passed!"
5. If violations exist → fix code (not .rux files)
6. Repeat until clean validation

## IMPORTANT: Existing .rux files may only be appended, individual lines may not be modified

**You MUST validate all code changes. And all validation must pass.**

## How Rubric Works

1. Every code file has a matching .rux file that defines its constraints
2. The .rux file location mirrors the code location: `rubric/app/components/Button.rux` → `src/components/Button.tsx`
3. **MANDATORY**: Run `node validate.js` after EVERY code change

## Required Workflow

### Step 1: Before Writing ANY Code
1. Check if a .rux file exists for the module
2. Read the constraints in the .rux file
3. Plan your code to follow those constraints

### Step 2: For New Modules
1. FIRST: Create the .rux file in rubric/app/[matching-path]/
2. Use rubric/module.rux.template as your starting point
3. Replace placeholders and remove sections you don't need
4. THEN: Write the code following the rubric file spec
5. FINALLY: Run node validate.js - must show "All constraints passed!"

### Step 3: For Existing Modules
1. **NEVER** modify .rux files to make your code work
2. Read the existing rubric spec
3. Write code that follows the corresponding rubric spec
4. MANDATORY: Run `node validate.js` - must show "All constraints passed!"
- If you see violations and/or if the validation fails:
    1. Fix your code to fit spec (do NOT modify .rux files)
    2. Run validation again
    3. Repeat until you see: "All constraints passed!"

## Need Different Permissions?

If a constraint prevents you from doing something:
1. Create a NEW module with appropriate permissions
2. Create its .rux file with the permissions you need
3. Have your original module use this new module

Example: Component needs console.log but it's denied?
```bash
# 1. Create new module with permission
rubric/app/utils/logger.rux  # with: allow io.console.*
src/utils/logger.ts

# 2. Import and use from your component
import { logger } from '../utils/logger';
```

## Component Relationships (IMPORTANT POINT)
Container components can import their related components. If a component's primary purpose is to orchestrate other components, it should be able to import them:

- A list component can import both item and item-edit components
- A page component can import all components it needs to compose
- A modal trigger can import the modal it triggers

This is different from breaking layer boundaries (like importing services or data layers).

## Directory Structure
```
src/                    # Your code
rubric/app/            # Constraints (mirrors src/)
validate.js            # Validation script (run after EVERY change)
```

## Remember

1. **Always run `node validate.js`** - no exceptions
2. **Never skip validation** - it ensures clean architecture
3. **Fix violations immediately** - don't accumulate technical debt
4. **Constraints are immutable** - change your code, not the rules

The validation script is your quality gate. Use it.