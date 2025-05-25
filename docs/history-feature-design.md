# Booking History Feature Design

## 1. Feature Overview

The Booking History feature will provide a comprehensive audit trail for all changes made to artist bookings in the Gantt chart. This feature will track who made changes, when they were made, and what exactly changed, allowing studio managers to:

- View complete history of booking modifications
- Track project timeline changes
- Audit artist allocation decisions
- Identify patterns in booking adjustments
- Restore or reference previous booking states

## 2. Database Schema Design

### History Entry Model

```javascript
{
  id: string,                    // Unique history entry ID
  timestamp: string (ISO),       // When the change occurred
  userId: string,                // User who made the change
  userEmail: string,             // User email for display
  projectId: string,             // Associated project
  projectName: string,           // Project name at time of change
  bookingId: string,             // Affected booking
  action: string,                // 'created' | 'updated' | 'deleted'
  changes: {
    before: {                    // Previous state (null for create)
      artistId?: string,
      artistName?: string,
      startDate?: string,
      endDate?: string,
      dailyRate?: number,
      duration?: number
    },
    after: {                     // New state (null for delete)
      artistId?: string,
      artistName?: string,
      startDate?: string,
      endDate?: string,
      dailyRate?: number,
      duration?: number
    }
  },
  metadata: {                    // Additional context
    reason?: string,             // Optional change reason
    dragOperation?: boolean,     // Was this a drag-drop change
    bulkOperation?: boolean,     // Part of bulk update
    relatedBookings?: string[]   // Other bookings affected
  }
}
```

### Firebase Structure

```
/history
  /{projectId}
    /{historyId}
      - timestamp
      - userId
      - userEmail
      - bookingId
      - action
      - changes
      - metadata
```

## 3. Backend Functionality

### API Functions

#### recordBookingHistory()
```javascript
async function recordBookingHistory(projectId, bookingId, action, changes, metadata = {}) {
  const { currentUser } = auth;
  const historyRef = ref(database, `history/${projectId}`);
  const newHistoryEntry = {
    timestamp: new Date().toISOString(),
    userId: currentUser.uid,
    userEmail: currentUser.email,
    bookingId,
    action,
    changes,
    metadata,
    projectId,
    projectName: await getProjectName(projectId)
  };
  
  await push(historyRef, newHistoryEntry);
}
```

#### getBookingHistory()
```javascript
async function getBookingHistory(projectId, options = {}) {
  const {
    limit = 50,
    startDate = null,
    endDate = null,
    bookingId = null,
    userId = null,
    action = null
  } = options;
  
  const historyRef = ref(database, `history/${projectId}`);
  let query = historyRef;
  
  // Apply filters
  if (limit) {
    query = limitToLast(query, limit);
  }
  
  const snapshot = await get(query);
  let history = [];
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    history = Object.entries(data).map(([id, entry]) => ({
      id,
      ...entry
    }));
    
    // Client-side filtering for additional criteria
    if (startDate) {
      history = history.filter(h => new Date(h.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      history = history.filter(h => new Date(h.timestamp) <= new Date(endDate));
    }
    if (bookingId) {
      history = history.filter(h => h.bookingId === bookingId);
    }
    if (userId) {
      history = history.filter(h => h.userId === userId);
    }
    if (action) {
      history = history.filter(h => h.action === action);
    }
  }
  
  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
```

### Integration with Existing Functions

Update existing booking functions to automatically record history:

```javascript
// In ProjectContext.js
const addBooking = useCallback(async (projectId, newBooking) => {
  // ... existing code ...
  
  // Record history
  await recordBookingHistory(projectId, newBooking.id, 'created', {
    before: null,
    after: newBooking
  });
}, []);

const updateBooking = useCallback(async (projectId, bookingId, updates) => {
  // Get current state
  const currentBooking = await getBooking(projectId, bookingId);
  
  // ... existing update code ...
  
  // Record history with changes
  await recordBookingHistory(projectId, bookingId, 'updated', {
    before: currentBooking,
    after: { ...currentBooking, ...updates }
  });
}, []);
```

## 4. Frontend Design

### UI Components

#### History Panel
A collapsible panel in the Gantt view that shows recent changes:

```
┌─────────────────────────────────────────────────────────┐
│ 📜 Booking History                               [▼ Hide]│
├─────────────────────────────────────────────────────────┤
│ Filter: [All Changes ▼] [Last 7 days ▼] [All Users ▼]  │
├─────────────────────────────────────────────────────────┤
│ Today                                                    │
│ ├─ 14:32 - John moved "Emma Wilson" booking            │
│ │   Project: Summer Campaign                            │
│ │   Changed: June 15-20 → June 17-22                   │
│ │                                                       │
│ ├─ 11:45 - Sarah created new booking                   │
│ │   Project: Product Launch                             │
│ │   Artist: David Chen (June 1-5)                      │
│ │                                                       │
│ Yesterday                                               │
│ ├─ 16:20 - Mike deleted booking                        │
│ │   Project: Brand Refresh                              │
│ │   Artist: Lisa Park (was June 10-12)                 │
│ │                                                       │
│ └─ View all history →                                   │
└─────────────────────────────────────────────────────────┘
```

#### History Timeline View
Visual representation of changes over time:

```
┌─────────────────────────────────────────────────────────┐
│ Timeline View: June 2024                                 │
├─────────────────────────────────────────────────────────┤
│ Week 1  |████░░░░| 8 changes                           │
│ Week 2  |██████░░| 12 changes                          │
│ Week 3  |███░░░░░| 5 changes                           │
│ Week 4  |█████░░░| 10 changes                          │
│                                                         │
│ Most Active: John (15), Sarah (12), Mike (8)           │
└─────────────────────────────────────────────────────────┘
```

#### Booking History Tooltip
When hovering over a booking, show its history:

```
┌─────────────────────────────────┐
│ Emma Wilson                     │
│ June 17-22 (6 days)            │
├─────────────────────────────────┤
│ History:                        │
│ • Created: June 1 by Sarah      │
│ • Moved: June 10 by John        │
│   (was June 15-20)             │
│ • Rate changed: June 12 by Mike │
│   ($500 → $550)                │
└─────────────────────────────────┘
```

### User Interactions

1. **View History**: Click history icon in Gantt toolbar
2. **Filter History**: Dropdown filters for date range, user, action type
3. **Search History**: Text search for artist names or project names
4. **Export History**: Download as CSV for reporting
5. **Restore Booking**: Option to recreate deleted bookings
6. **Compare Changes**: Side-by-side view of before/after states

### Component Structure

```jsx
// HistoryPanel.js
<HistoryPanel>
  <HistoryFilters 
    onFilterChange={handleFilterChange}
    dateRange={dateRange}
    selectedUser={selectedUser}
    selectedAction={selectedAction}
  />
  <HistoryList>
    {groupedHistory.map(group => (
      <HistoryGroup key={group.date} date={group.date}>
        {group.entries.map(entry => (
          <HistoryEntry 
            key={entry.id}
            entry={entry}
            onRestore={handleRestore}
            onViewDetails={handleViewDetails}
          />
        ))}
      </HistoryGroup>
    ))}
  </HistoryList>
  <HistoryPagination 
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</HistoryPanel>
```

## 5. Implementation Considerations

### Performance Optimizations

1. **Pagination**: Load history in chunks of 50 entries
2. **Indexing**: Create Firebase indexes on timestamp and userId
3. **Caching**: Cache recent history in React Context
4. **Lazy Loading**: Load detailed change data only when expanded
5. **Batch Operations**: Group related changes to reduce entries

### Security & Privacy

1. **Access Control**: 
   - Users can only view history for projects they have access to
   - Admin role can view all history
   - Option to anonymize user data in history

2. **Data Retention**:
   - Automatic cleanup of history older than 1 year
   - Option to archive important history entries
   - Compliance with data protection regulations

3. **Audit Trail**:
   - History entries are immutable once created
   - Deletion of history requires admin permission
   - All history actions are logged

### Scalability

1. **Data Structure**:
   - Separate history by project to improve query performance
   - Consider moving to dedicated history collection for large datasets
   - Implement data archiving for old entries

2. **Real-time Updates**:
   - Use Firebase listeners for live history updates
   - Debounce rapid changes to prevent spam
   - Aggregate similar changes within time windows

## 6. Challenges & Limitations

### Technical Challenges

1. **Data Migration**: Existing bookings won't have history
2. **Storage Costs**: History data will grow continuously
3. **Complex Queries**: Firebase limitations on complex filtering
4. **Offline Support**: History may not sync properly offline

### UX Challenges

1. **Information Overload**: Too much history can be overwhelming
2. **Performance Impact**: Loading history may slow down Gantt view
3. **Mobile Experience**: Complex history UI on small screens
4. **Change Tracking**: Determining what constitutes a "significant" change

### Proposed Solutions

1. **Progressive Disclosure**: Show summary by default, details on demand
2. **Smart Filters**: Pre-configured filters for common use cases
3. **Background Loading**: Load history asynchronously
4. **Mobile-Optimized View**: Simplified history for mobile devices
5. **Change Significance**: User-configurable thresholds for tracking

## 7. Implementation Roadmap

### Phase 1: Core History Tracking (Week 1)
- Database schema implementation
- Basic history recording for all booking operations
- Simple history API functions

### Phase 2: Basic UI (Week 2)
- History panel component
- Basic filtering and display
- Integration with Gantt view

### Phase 3: Advanced Features (Week 3)
- Timeline visualization
- Export functionality
- Restore deleted bookings
- Performance optimizations

### Phase 4: Polish & Testing (Week 4)
- Mobile optimization
- User preferences
- Comprehensive testing
- Documentation

## 8. Success Metrics

1. **Performance**: History loads in < 500ms
2. **Adoption**: 80% of users view history weekly
3. **Utility**: 50% reduction in "what happened?" queries
4. **Reliability**: 99.9% history capture rate
5. **Satisfaction**: Positive user feedback on transparency