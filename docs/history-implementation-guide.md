# History Feature Implementation Guide

## Step 1: Create History Context

```javascript
// src/contexts/HistoryContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { database, ref, push, get, onValue, query, orderByChild, limitToLast } from '../firebase';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export function useHistory() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
  const [historyEntries, setHistoryEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const recordHistory = useCallback(async (projectId, bookingId, action, changes, metadata = {}) => {
    if (!currentUser) return;

    const historyRef = ref(database, `history/${projectId}`);
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userId: currentUser.uid,
      userEmail: currentUser.email,
      bookingId,
      action,
      changes,
      metadata,
      projectId
    };

    try {
      await push(historyRef, historyEntry);
    } catch (error) {
      console.error('Failed to record history:', error);
    }
  }, [currentUser]);

  const fetchHistory = useCallback(async (projectId, options = {}) => {
    setLoading(true);
    try {
      const historyRef = ref(database, `history/${projectId}`);
      const historyQuery = query(
        historyRef,
        orderByChild('timestamp'),
        limitToLast(options.limit || 50)
      );

      const snapshot = await get(historyQuery);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entries = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry
        }));
        
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: entries.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          )
        }));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToHistory = useCallback((projectId) => {
    const historyRef = ref(database, `history/${projectId}`);
    const historyQuery = query(
      historyRef,
      orderByChild('timestamp'),
      limitToLast(20)
    );

    const unsubscribe = onValue(historyQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const entries = Object.entries(data).map(([id, entry]) => ({
          id,
          ...entry
        }));
        
        setHistoryEntries(prev => ({
          ...prev,
          [projectId]: entries.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          )
        }));
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    historyEntries,
    loading,
    recordHistory,
    fetchHistory,
    subscribeToHistory
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}
```

## Step 2: Update ProjectContext to Record History

```javascript
// In src/contexts/ProjectContext.js, add history recording
import { useHistory } from './HistoryContext';

export function ProjectProvider({ children }) {
  // ... existing code ...
  const { recordHistory } = useHistory();

  const addBooking = useCallback(async (projectId, newBooking) => {
    // ... existing booking creation code ...
    
    // Record history
    await recordHistory(projectId, newBooking.id, 'created', {
      before: null,
      after: bookingWithOffsetDates
    }, {
      dragOperation: false
    });
    
    // ... rest of existing code ...
  }, [recordHistory]);

  const updateBooking = useCallback(async (projectId, bookingId, updatedStartDate, updatedEndDate) => {
    // Get current booking state first
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    
    if (snapshot.exists()) {
      const project = snapshot.val();
      const currentBooking = project.bookings.find(b => b.id === bookingId);
      
      // ... existing update code ...
      
      // Record history with what changed
      await recordHistory(projectId, bookingId, 'updated', {
        before: {
          startDate: currentBooking.startDate,
          endDate: currentBooking.endDate,
          duration: currentBooking.duration
        },
        after: {
          startDate: offsetStartDate,
          endDate: offsetEndDate,
          duration: duration
        }
      }, {
        dragOperation: true
      });
    }
  }, [recordHistory]);

  const removeBooking = useCallback(async (projectId, bookingId) => {
    const projectRef = ref(database, `projects/${projectId}`);
    const snapshot = await get(projectRef);
    
    if (snapshot.exists()) {
      const project = snapshot.val();
      const bookingToRemove = project.bookings.find(b => b.id === bookingId);
      
      // ... existing removal code ...
      
      // Record deletion
      await recordHistory(projectId, bookingId, 'deleted', {
        before: bookingToRemove,
        after: null
      });
    }
  }, [recordHistory]);

  // ... rest of existing code ...
}
```

## Step 3: Create History Panel Component

```javascript
// src/components/History/HistoryPanel.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useHistory } from '../../contexts/HistoryContext';

export default function HistoryPanel({ projectId }) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const { historyEntries, loading, fetchHistory, subscribeToHistory } = useHistory();
  
  const projectHistory = historyEntries[projectId] || [];

  useEffect(() => {
    if (projectId && expanded) {
      fetchHistory(projectId);
      const unsubscribe = subscribeToHistory(projectId);
      return () => unsubscribe();
    }
  }, [projectId, expanded, fetchHistory, subscribeToHistory]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <AddIcon fontSize="small" />;
      case 'updated':
        return <EditIcon fontSize="small" />;
      case 'deleted':
        return <DeleteIcon fontSize="small" />;
      default:
        return <HistoryIcon fontSize="small" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MMM d, yyyy HH:mm');
  };

  const getChangeDescription = (entry) => {
    const { action, changes } = entry;
    
    if (action === 'created') {
      return `Created booking for ${changes.after.artistName}`;
    } else if (action === 'deleted') {
      return `Deleted booking for ${changes.before.artistName}`;
    } else if (action === 'updated') {
      const dateChanged = changes.before.startDate !== changes.after.startDate || 
                         changes.before.endDate !== changes.after.endDate;
      if (dateChanged) {
        return `Moved booking: ${format(parseISO(changes.before.startDate), 'MMM d')} - ${format(parseISO(changes.before.endDate), 'MMM d')} → ${format(parseISO(changes.after.startDate), 'MMM d')} - ${format(parseISO(changes.after.endDate), 'MMM d')}`;
      }
      return 'Updated booking details';
    }
    return 'Made changes';
  };

  const filteredHistory = projectHistory.filter(entry => {
    if (filter === 'all') return true;
    return entry.action === filter;
  });

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        mb: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="action" />
          <Typography variant="subtitle1" fontWeight="medium">
            Booking History
          </Typography>
          {!expanded && projectHistory.length > 0 && (
            <Chip
              label={`${projectHistory.length} changes`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        
        {/* Filters */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={filter}
                label="Action"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Changes</MenuItem>
                <MenuItem value="created">Created</MenuItem>
                <MenuItem value="updated">Updated</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={dateRange}
                label="Time Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 days</MenuItem>
                <MenuItem value="month">Last 30 days</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider />

        {/* History List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredHistory.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No history entries found
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredHistory.map((entry, index) => (
                <React.Fragment key={entry.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getActionColor(entry.action)}.light`,
                          width: 32,
                          height: 32
                        }}
                      >
                        {getActionIcon(entry.action)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" component="span">
                            {entry.userEmail}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(entry.timestamp)}
                          </Typography>
                          {entry.metadata?.dragOperation && (
                            <Chip
                              icon={<DragIcon />}
                              label="Drag"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {getChangeDescription(entry)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < filteredHistory.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {filteredHistory.length > 10 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button size="small">
                View All History
              </Button>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
}
```

## Step 4: Add History Panel to Gantt View

```javascript
// In src/pages/GanttView.js
import HistoryPanel from '../components/History/HistoryPanel';

function GanttView() {
  // ... existing code ...

  return (
    <Box sx={{ p: 3 }}>
      {/* ... existing components ... */}
      
      {/* Add History Panel after project selector */}
      {selectedProject && (
        <HistoryPanel projectId={selectedProject.id} />
      )}
      
      {/* ... rest of components ... */}
    </Box>
  );
}
```

## Step 5: Update App.js to Include History Provider

```javascript
// In src/App.js
import { HistoryProvider } from './contexts/HistoryContext';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ProjectProvider>
            <ArtistProvider>
              <HistoryProvider>
                <FinancialVisibilityProvider>
                  {/* ... rest of app ... */}
                </FinancialVisibilityProvider>
              </HistoryProvider>
            </ArtistProvider>
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
```

## Step 6: Add History Export Functionality

```javascript
// src/utils/historyExport.js
export function exportHistoryToCSV(historyEntries, projectName) {
  const headers = [
    'Date',
    'Time',
    'User',
    'Action',
    'Artist',
    'Previous Dates',
    'New Dates',
    'Changes'
  ];

  const rows = historyEntries.map(entry => {
    const date = new Date(entry.timestamp);
    const prevDates = entry.changes.before ? 
      `${entry.changes.before.startDate} - ${entry.changes.before.endDate}` : '-';
    const newDates = entry.changes.after ? 
      `${entry.changes.after.startDate} - ${entry.changes.after.endDate}` : '-';
    
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      entry.userEmail,
      entry.action,
      entry.changes.after?.artistName || entry.changes.before?.artistName || '-',
      prevDates,
      newDates,
      JSON.stringify(entry.changes)
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}_history_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

## Step 7: Update Firebase Security Rules

```json
// firebase-database-rules.json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "history": {
      "$projectId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["timestamp", "userId", "bookingId"]
      }
    },
    "projects": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "artists": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```