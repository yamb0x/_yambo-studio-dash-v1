# Yambo Studio Dashboard - Development Guidelines

## Development Environment Setup

### Prerequisites
```bash
# Required versions
Node.js: 14.0.0+
npm: 6.0.0+
Git: 2.0.0+

# Recommended tools
VS Code with extensions:
- ESLint
- Prettier
- React Developer Tools
- Firebase Explorer
```

### Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd yambo-studio-dash-v1

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start development server
npm start
```

## Code Standards & Conventions

### File Naming Conventions
```
Components: PascalCase.js       (e.g., ProjectCard.js)
Utilities:  camelCase.js        (e.g., dateUtils.js)
Contexts:   PascalCaseContext.js (e.g., AuthContext.js)
Hooks:      useCamelCase.js     (e.g., useProjects.js)
```

### Component Structure
```javascript
// Standard functional component template
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useProjects } from '../contexts/ProjectContext';

function ComponentName({ prop1, prop2 }) {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Context hooks
  const { projects } = useProjects();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <Box>
      <Typography>Component content</Typography>
    </Box>
  );
}

export default ComponentName;
```

### State Management Patterns

#### Context Usage
```javascript
// Creating a context
const MyContext = React.createContext();

export function MyProvider({ children }) {
  const [state, setState] = useState();
  
  const value = {
    state,
    setState,
    // Other methods
  };
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// Using the context
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

#### Firebase Integration Pattern
```javascript
// Standard Firebase operation pattern
async function createItem(data) {
  try {
    // Optimistic update
    setLocalState(prev => [...prev, tempItem]);
    
    // Firebase operation
    const newRef = push(ref(database, 'items'));
    await set(newRef, data);
    
    // Success handling
    console.log('Item created successfully');
  } catch (error) {
    // Error handling
    console.error('Error creating item:', error);
    // Revert optimistic update
    setLocalState(prev => prev.filter(item => item.id !== tempItem.id));
  }
}
```

## Common Development Tasks

### Adding a New Feature

#### 1. Create Component
```bash
# Create component file
touch src/components/MyNewFeature.js
```

#### 2. Implement Component
```javascript
import React from 'react';
import { Paper, Typography } from '@mui/material';

function MyNewFeature() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">My New Feature</Typography>
      {/* Feature implementation */}
    </Paper>
  );
}

export default MyNewFeature;
```

#### 3. Add Route (if needed)
```javascript
// In App.js
<Route path="/new-feature" element={<MyNewFeature />} />
```

#### 4. Update Navigation
```javascript
// In Header.js
<Button component={Link} to="/new-feature">
  New Feature
</Button>
```

### Working with Firebase

#### Reading Data
```javascript
// Set up real-time listener
useEffect(() => {
  const itemsRef = ref(database, 'items');
  const unsubscribe = onValue(itemsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const itemsArray = Object.entries(data).map(([id, item]) => ({
        id,
        ...item
      }));
      setItems(itemsArray);
    }
  });
  
  return () => unsubscribe();
}, []);
```

#### Writing Data
```javascript
// Create
const newRef = push(ref(database, 'items'));
await set(newRef, itemData);

// Update
await set(ref(database, `items/${itemId}`), updatedData);

// Delete
await remove(ref(database, `items/${itemId}`));
```

### Styling Guidelines

#### Using MUI Theme
```javascript
// Access theme in component
const theme = useTheme();

// Use theme values
<Box sx={{ 
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(2)
}}>
```

#### Custom Styles
```javascript
// Inline styles with sx prop
<Box sx={{
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  '&:hover': {
    backgroundColor: 'action.hover'
  }
}}>

// Style objects
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    p: 2
  }
};
```

### Performance Optimization

#### Memoization
```javascript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

#### Lazy Loading
```javascript
// Lazy load routes
const GanttView = lazy(() => import('./pages/GanttView'));

// Use with Suspense
<Suspense fallback={<CircularProgress />}>
  <GanttView />
</Suspense>
```

## Testing Guidelines

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders and responds to user input', () => {
  render(<MyComponent />);
  
  const button = screen.getByText('Click me');
  fireEvent.click(button);
  
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

### Context Testing
```javascript
// Mock provider for testing
const MockProvider = ({ children }) => {
  const mockValue = {
    projects: mockProjects,
    addProject: jest.fn(),
  };
  
  return (
    <ProjectContext.Provider value={mockValue}>
      {children}
    </ProjectContext.Provider>
  );
};
```

## Debugging Tips

### Common Issues & Solutions

#### 1. Firebase Connection Issues
```javascript
// Check Firebase initialization
console.log('Firebase app:', app);
console.log('Database ref:', database);

// Test connection
testFirebaseConnection().then(result => {
  console.log('Connection test:', result);
});
```

#### 2. State Update Issues
```javascript
// Ensure state updates are batched
setState(prev => ({
  ...prev,
  newValue: value
}));

// Debug state changes
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

#### 3. Performance Issues
```javascript
// Use React DevTools Profiler
// Check for unnecessary re-renders
console.log('Component rendered:', componentName);

// Monitor effect runs
useEffect(() => {
  console.log('Effect ran with deps:', [dep1, dep2]);
}, [dep1, dep2]);
```

## Deployment Process

### Pre-deployment Checklist
- [ ] Remove all console.logs
- [ ] Update environment variables
- [ ] Run build locally: `npm run build`
- [ ] Test build: `serve -s build`
- [ ] Update version in package.json
- [ ] Commit all changes

### Build & Deploy
```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy to other platforms
# Netlify: drag build folder to Netlify
# Vercel: vercel --prod
```

## Git Workflow

### Branch Naming
```
feature/add-new-component
bugfix/fix-booking-calculation
hotfix/critical-auth-issue
refactor/improve-performance
```

### Commit Messages
```
feat: Add currency exchange feature
fix: Resolve booking overlap issue
docs: Update README with new instructions
style: Format code with prettier
refactor: Simplify date calculation logic
test: Add tests for ProjectContext
chore: Update dependencies
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] All tests pass

## Screenshots (if applicable)
```

## Security Best Practices

### Environment Variables
```javascript
// Never commit sensitive data
// Use .env for local development
// Use platform-specific env vars for production

// Good
const apiKey = process.env.REACT_APP_API_KEY;

// Bad
const apiKey = 'AIzaSyAEtA8Q_nMUXGYwgXj3SrPiREGAetKX8jQ';
```

### Data Validation
```javascript
// Always validate user input
const validateProject = (project) => {
  if (!project.name || project.name.trim() === '') {
    throw new Error('Project name is required');
  }
  if (!project.budget || project.budget < 0) {
    throw new Error('Valid budget is required');
  }
  // More validations...
};
```

## Resources & Documentation

### Key Documentation
- [React Docs](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Router Docs](https://reactrouter.com)

### Useful Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Firebase Console](https://console.firebase.google.com)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Community Resources
- Project Slack/Discord channel
- Internal wiki/documentation
- Code review guidelines
- Team style guide