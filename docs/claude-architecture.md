# Yambo Studio Dashboard - Architecture Documentation

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 React Application                 │   │
│  │  ┌───────────┐  ┌────────────┐  ┌────────────┐ │   │
│  │  │   Pages   │  │ Components │  │  Contexts  │ │   │
│  │  └───────────┘  └────────────┘  └────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase Services                     │
│  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │ Authentication │  │   Realtime Database          │  │
│  │   (Auth)       │  │   ├── projects/              │  │
│  └────────────────┘  │   ├── artists/               │  │
│                      │   └── users/                  │  │
│                      └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Component Hierarchy
```
App
├── AuthProvider
│   └── FinancialVisibilityProvider
│       └── DndProvider
│           └── ThemeProvider
│               ├── ArtistProvider
│               └── ProjectProvider
│                   ├── Header
│                   └── Routes
│                       ├── Dashboard
│                       │   ├── ProjectCard
│                       │   ├── Calculator
│                       │   └── CurrencyExchange
│                       ├── GanttView
│                       │   ├── GanttChart
│                       │   ├── ArtistList
│                       │   └── ProjectList
│                       └── DatabaseView
│                           ├── ProjectTable
│                           └── ArtistTable
```

### State Management Architecture

#### Context Providers
1. **AuthContext**
   - Manages user authentication state
   - Handles login, logout, signup operations
   - Provides currentUser object throughout app

2. **ProjectContext**
   - Manages all project-related state
   - Handles CRUD operations for projects
   - Manages bookings and deliveries
   - Real-time sync with Firebase

3. **ArtistContext**
   - Manages artist profiles and data
   - Handles CRUD operations for artists
   - Tracks artist availability

4. **FinancialVisibilityContext**
   - Controls visibility of financial information
   - Allows toggling sensitive data display

### Data Flow Architecture

```
User Action → Component → Context → Firebase → Database
     ↑                        ↓
     └────── Real-time ←──────┘
              Updates
```

#### Write Operations
1. User initiates action (e.g., create project)
2. Component calls context method
3. Context updates local state optimistically
4. Context writes to Firebase
5. Firebase confirms write
6. Other clients receive real-time update

#### Read Operations
1. Context establishes Firebase listeners on mount
2. Firebase pushes initial data
3. Context updates local state
4. Components re-render with new data
5. Real-time updates trigger re-renders

## Technical Architecture Details

### Frontend Architecture

#### Technology Stack
- **React 18.3.1**: UI library with hooks
- **Material-UI v6**: Component library
- **React Router v6**: Client-side routing
- **React DnD**: Drag-and-drop functionality
- **Emotion**: CSS-in-JS styling

#### Key Architectural Patterns

1. **Container/Presentational Components**
   - Pages act as containers
   - Components are mostly presentational
   - Business logic in contexts

2. **Provider Pattern**
   - Multiple nested providers
   - Each provider has specific responsibility
   - Clean separation of concerns

3. **Hooks Pattern**
   - Custom hooks for data access
   - useContext for state consumption
   - useState/useEffect for local state

### Backend Architecture

#### Firebase Services

1. **Authentication**
   - Email/password authentication
   - Session persistence
   - Secure token management

2. **Realtime Database**
   - NoSQL document structure
   - Real-time synchronization
   - Optimistic updates

#### Database Schema
```
root/
├── users/
│   └── {userId}/
│       ├── email
│       └── profile
├── projects/
│   └── {projectId}/
│       ├── name
│       ├── startDate
│       ├── endDate
│       ├── budget
│       ├── bookings/
│       └── deliveries/
└── artists/
    └── {artistId}/
        ├── name
        ├── email
        ├── dailyRate
        └── skills[]
```

## Security Architecture

### Authentication Flow
1. User enters credentials
2. Firebase Auth validates
3. Auth token generated
4. Token stored in browser
5. All requests include token
6. Firebase validates token

### Data Access Control
- Authentication required for all routes
- Firebase rules enforce access control
- Client-side route protection
- Sensitive data visibility controls

## Performance Architecture

### Optimization Strategies

1. **Component Optimization**
   - React.memo for expensive components
   - useMemo for calculated values
   - useCallback for stable references

2. **Data Optimization**
   - Selective Firebase listeners
   - Minimal data fetching
   - Local state for UI-only data

3. **Rendering Optimization**
   - Virtualization for long lists
   - Lazy loading for routes
   - Debounced updates

### Caching Strategy
- Browser caching for static assets
- Firebase offline persistence
- LocalStorage for user preferences
- Memory caching for calculations

## Deployment Architecture

### Build Process
1. `npm run build` creates optimized bundle
2. Static files generated in `/build`
3. Deploy to static hosting (e.g., Firebase Hosting)
4. CDN distribution for assets

### Environment Configuration
- Development: Local Firebase emulator
- Staging: Separate Firebase project
- Production: Production Firebase project

## Scalability Considerations

### Current Limitations
- Single organization support
- No horizontal scaling
- Limited offline functionality
- No server-side rendering

### Future Architecture Improvements
1. **Multi-tenancy**
   - Organization-based data isolation
   - Role-based access control
   - Team collaboration features

2. **Performance at Scale**
   - Implement pagination
   - Add data virtualization
   - Server-side aggregation

3. **Microservices Migration**
   - Separate auth service
   - Independent booking service
   - Analytics service

## Error Handling Architecture

### Client-Side Error Handling
- Try-catch blocks in async operations
- Error boundaries for component crashes
- User-friendly error messages
- Fallback UI components

### Firebase Error Handling
- Network error recovery
- Authentication error handling
- Permission denied handling
- Data validation errors

## Testing Architecture

### Testing Strategy
1. **Unit Tests**
   - Component testing with React Testing Library
   - Context testing with mock providers
   - Utility function testing

2. **Integration Tests**
   - Firebase integration tests
   - Component interaction tests
   - Route testing

3. **E2E Tests**
   - User flow testing
   - Cross-browser testing
   - Performance testing

## Monitoring Architecture

### Application Monitoring
- Console logging for development
- Error tracking (e.g., Sentry)
- Performance monitoring
- User analytics

### Firebase Monitoring
- Firebase Analytics
- Performance monitoring
- Crash reporting
- Usage metrics