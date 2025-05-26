# Yambo Studio Dashboard - Project Overview

## 🎯 Project Purpose
A comprehensive project management system designed for creative studios to manage artist bookings, track project progress, and monitor financial performance in real-time.

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18.3.1** - Modern React with hooks and functional components
- **Material-UI v6** - Comprehensive UI component library
- **Firebase** - Backend services (Auth + Realtime Database)
- **Context API** - Global state management
- **react-dnd** - Drag-and-drop functionality for Gantt chart

### Key Dependencies
```json
{
  "@mui/material": "^6.0.2",     // UI components
  "firebase": "^10.13.1",         // Backend services
  "react-dnd": "^14.0.2",         // Drag & drop
  "date-fns": "^3.6.0",           // Date utilities
  "recharts": "^2.12.7",          // Charts
  "framer-motion": "^11.5.4"      // Animations
}
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Auth/          # Login/Signup forms
│   ├── Database/      # Project/Artist tables
│   ├── Forms/         # Add/Edit forms
│   ├── Gantt/         # Gantt chart system
│   └── common/        # Shared components
├── contexts/          # Global state providers
│   ├── AuthContext    # Authentication state
│   ├── ProjectContext # Projects & bookings
│   ├── ArtistContext  # Artists management
│   └── FinancialVisibilityContext
├── pages/             # Route components
│   ├── Dashboard      # Main overview
│   ├── GanttView      # Project timeline
│   ├── DatabaseView   # Data management
│   └── ExperimentalDashboard # EXPERIMENTAL features
└── utils/             # Helper functions
```

## 🔑 Key Features

1. **Project Management**
   - Create, edit, delete projects
   - Track budgets and expenses
   - Monitor progress with visual indicators
   - Manage project deliveries

2. **Artist Booking System**
   - Drag-and-drop booking assignments
   - Real-time availability tracking
   - Daily rate calculations
   - Skills and specialty tracking

3. **Financial Tracking**
   - Automatic cost calculations
   - Profit/loss analysis
   - Multi-currency support
   - Financial visibility toggles

4. **Gantt Chart**
   - Interactive timeline view
   - Resize bookings by dragging
   - Visual project overlaps
   - Artist workload visualization

5. **Dashboard Analytics**
   - Project statistics
   - Currently booked artists
   - Working hours indicators
   - Quick access tools (Calculator, Currency Exchange)

## 🔐 Authentication & Security

- **Firebase Auth** with email/password
- Protected routes requiring authentication
- Secure API keys (should be in .env)
- Real-time database rules for user isolation

## 💾 Data Models

### Project
```javascript
{
  id: string,
  name: string,
  startDate: string (ISO),
  endDate: string (ISO),
  budget: number,
  additionalExpenses: number,
  bookings: Booking[],
  deliveries: Delivery[]
}
```

### Artist
```javascript
{
  id: string,
  name: string,
  email: string,
  dailyRate: number,
  country: string,
  skills: string[],
  website: string,
  favorite: boolean
}
```

### Booking
```javascript
{
  id: string,
  artistId: string,
  artistName: string,
  startDate: string (ISO),
  endDate: string (ISO),
  dailyRate: number,
  duration: number
}
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

## ⚠️ Important Considerations

1. **Firebase Configuration**
   - Environment variables configured in `.env` file locally
   - **CRITICAL**: Must set all Firebase env vars in production (Vercel, etc.)
   - **Database URL must include region**: `https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app`
   - Fallback URL hardcoded for safety but env vars should be properly set

2. **Performance Optimizations**
   - Large dataset handling in Gantt view
   - Memoization for expensive calculations
   - Real-time listener optimization

3. **Known Limitations**
   - No offline support
   - Limited to single organization
   - No role-based access control
   - All users share the same data (no user isolation)

## 🛠️ Common Development Tasks

### Adding a New Feature
1. Create component in appropriate directory
2. Add context if global state needed
3. Update routes in App.js if new page
4. Follow existing patterns for consistency

### Modifying Data Structure
1. Update Firebase database structure
2. Modify context providers
3. Update affected components
4. Test real-time sync functionality

### Styling Changes
1. Use MUI theme for consistency
2. Support both light/dark modes
3. Maintain responsive design
4. Test on various screen sizes

## 🔍 Debugging Tips

- Check browser console for Firebase errors
- Verify authentication state in AuthContext
- Use React DevTools for component inspection
- Monitor Network tab for Firebase requests
- Check localStorage for persisted data

## 🚀 Deployment Troubleshooting

### Firebase Region Issues
If you see "Database lives in a different region" warning:
1. Ensure `REACT_APP_FIREBASE_DATABASE_URL` is set in production environment
2. URL must be exact: `https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app`
3. Restart/redeploy after changing environment variables

### Missing Data in Production
1. Check browser console for Firebase errors
2. Verify all environment variables are set in hosting platform
3. Ensure Firebase database rules allow authenticated reads/writes
4. Check if using correct Firebase project (dev vs prod)

## 🧪 Experimental Features

The app includes an EXPERIMENTAL tab with features under development:
- **MCP Integration**: AI-powered tools using Model Context Protocol
- **Script Optimizer**: Generate multiple optimized versions of scripts
- **Timeline Creator**: AI-generated project timelines with automatic Gantt integration
- **New Dashboard Layout**: Widget-based, drag-and-drop interface

See `docs/experimental-features-guide.md` for details on managing experimental features.

## 📈 Future Enhancement Opportunities

1. **Performance**
   - Implement virtualization for large lists
   - Add pagination to tables
   - Optimize re-renders with React.memo

2. **Features**
   - Email notifications for bookings
   - Export functionality (PDF/Excel)
   - Team collaboration features
   - Mobile app version
   - User-specific data isolation

3. **Technical Debt**
   - Migrate to TypeScript
   - Add comprehensive test suite
   - Implement error boundaries
   - Add loading states consistently
   - Remove debug console logs

## 🧠 Session Code Memories
- **Recent Implementations**: Add relevant code snippets from current development session to help with future work and context preservation
  - Key Firebase authentication flow component
  - Gantt chart drag-and-drop implementation
  - Context provider for managing project state
  - Utility functions for date and calculation helpers