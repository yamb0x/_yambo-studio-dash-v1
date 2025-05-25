# History Feature Visual Mockups

## Main Gantt View with History Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Yambo Studio Dashboard                                      📊 🔔 👤 Logout   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Gantt Chart                                                                  │
│                                                                              │
│ Project: Summer Campaign 2024 ▼                            [+ Add Booking]   │
│                                                                              │
│ ┌─ 📜 Booking History ─────────────────────────────────────────── [▼]────┐  │
│ │ 12 changes in the last 7 days                                          │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ Artists ─┬─ June 2024 ──────────────────────────────────────────────┐   │
│ │           │ 1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18... │   │
│ ├───────────┼───────────────────────────────────────────────────────────┤   │
│ │ Emma W.   │    ████████████████                                       │   │
│ │ David C.  │          ████████████                                     │   │
│ │ Lisa P.   │                      ████████                             │   │
│ │ Mark J.   │ ████████                      ████████                    │   │
│ └───────────┴───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Expanded History Panel

```
┌─ 📜 Booking History ───────────────────────────────────────────── [▲]────┐
│                                                                           │
│ Filter: [All Changes ▼] [Last 7 days ▼] [All Users ▼]    [Export CSV]   │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                           │
│ Today, June 15                                                           │
│ ┌───┬─────────────────────────────────────────────────────────────────┐ │
│ │ + │ john@studio.com • 14:32                                   [Drag] │ │
│ │   │ Moved booking: June 15-20 → June 17-22                          │ │
│ │   │ Artist: Emma Wilson                                             │ │
│ └───┴─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───┬─────────────────────────────────────────────────────────────────┐ │
│ │ ✎ │ sarah@studio.com • 11:45                                        │ │
│ │   │ Updated daily rate: $500 → $550                                 │ │
│ │   │ Artist: David Chen (June 5-10)                                  │ │
│ └───┴─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───┬─────────────────────────────────────────────────────────────────┐ │
│ │ + │ mike@studio.com • 09:20                                         │ │
│ │   │ Created new booking                                             │ │
│ │   │ Artist: Lisa Park (June 20-25) • $600/day                       │ │
│ └───┴─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ Yesterday, June 14                                                       │
│ ┌───┬─────────────────────────────────────────────────────────────────┐ │
│ │ ✗ │ admin@studio.com • 16:20                                        │ │
│ │   │ Deleted booking                                    [Restore]    │ │
│ │   │ Artist: Mark Johnson (was June 10-12)                           │ │
│ └───┴─────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│                              [Load More]                                  │
└───────────────────────────────────────────────────────────────────────────┘
```

## Booking Hover Tooltip with History

```
┌─────────────────────────────────────┐
│ 👤 Emma Wilson                      │
│ 📅 June 17-22, 2024 (6 days)       │
│ 💰 $500/day • Total: $3,000        │
├─────────────────────────────────────┤
│ Recent History:                     │
│ • 2h ago: Moved by John            │
│   (was June 15-20)                 │
│ • Yesterday: Created by Sarah       │
│ • View full history →              │
└─────────────────────────────────────┘
```

## History Details Modal

```
┌─ Booking History Details ────────────────────────────────────────── ✕ ─┐
│                                                                         │
│ Booking: Emma Wilson - Summer Campaign 2024                            │
│                                                                         │
│ ┌─ Change Details ────────────────────────────────────────────────┐   │
│ │                                                                  │   │
│ │ Changed by: john@studio.com                                     │   │
│ │ Date: June 15, 2024 at 14:32                                    │   │
│ │ Type: Booking dates modified (drag operation)                   │   │
│ │                                                                  │   │
│ │ Before:                    After:                                │   │
│ │ • Start: June 15          • Start: June 17                     │   │
│ │ • End: June 20            • End: June 22                       │   │
│ │ • Duration: 6 days        • Duration: 6 days                   │   │
│ │ • Daily Rate: $500        • Daily Rate: $500                   │   │
│ │                                                                  │   │
│ │ Reason: Client requested later start date                        │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Related Changes:                                                        │
│ • Mark Johnson booking was adjusted to avoid overlap                   │
│ • Project timeline extended by 2 days                                  │
│                                                                         │
│                                              [Close]  [Export]         │
└─────────────────────────────────────────────────────────────────────────┘
```

## History Timeline Visualization

```
┌─ History Timeline - June 2024 ─────────────────────────────────────────┐
│                                                                         │
│ Activity Heat Map:                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Week 1  ████████░░ 32 changes  ↑ 15% from last month            │   │
│ │ Week 2  ██████░░░░ 24 changes  → Same as last month             │   │
│ │ Week 3  ████░░░░░░ 16 changes  ↓ 20% from last month            │   │
│ │ Week 4  ███████░░░ 28 changes  ↑ 40% from last month            │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Most Active Users:              Most Modified Artists:                  │
│ 1. John (45 changes)           1. Emma Wilson (12 bookings)           │
│ 2. Sarah (38 changes)          2. David Chen (10 bookings)            │
│ 3. Mike (22 changes)           3. Lisa Park (8 bookings)              │
│                                                                         │
│ Change Types:                                                           │
│ • Created: 35%  ████████                                               │
│ • Updated: 55%  ████████████                                           │
│ • Deleted: 10%  ██                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Mobile View - Simplified History

```
┌─────────────────────┐
│ 📜 History     [▼]  │
├─────────────────────┤
│ Today (3 changes)   │
│                     │
│ 14:32 • John       │
│ Moved Emma W.      │
│ Jun 15-20→17-22    │
│ ─────────────────  │
│ 11:45 • Sarah      │
│ Rate: $500→$550    │
│ David C.           │
│ ─────────────────  │
│ 09:20 • Mike       │
│ + New booking      │
│ Lisa P. Jun 20-25  │
│                     │
│ [View All]         │
└─────────────────────┘
```

## History Export Preview

```
┌─ Export History ──────────────────────────────────────────────────── ✕ ─┐
│                                                                          │
│ Export Options:                                                          │
│                                                                          │
│ Format:     ( ) CSV  (•) Excel  ( ) PDF                                │
│                                                                          │
│ Date Range: [Last 30 days ▼]                                           │
│                                                                          │
│ Include:    ☑ All changes                                              │
│             ☑ User information                                          │
│             ☑ Detailed change data                                      │
│             ☐ Calculated costs                                          │
│                                                                          │
│ Preview:                                                                 │
│ ┌────────────────────────────────────────────────────────────────┐    │
│ │ Date       Time   User          Action   Artist      Changes   │    │
│ │ 2024-06-15 14:32  john@studio  Updated  Emma W.     Dates...  │    │
│ │ 2024-06-15 11:45  sarah@studio Updated  David C.    Rate...   │    │
│ │ 2024-06-15 09:20  mike@studio  Created  Lisa P.     New...    │    │
│ │ ...                                                             │    │
│ └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│ File will be saved as: SummerCampaign_history_2024-06-15.csv           │
│                                                                          │
│                                        [Cancel]  [Export]               │
└──────────────────────────────────────────────────────────────────────────┘
```

## History Settings

```
┌─ History Settings ─────────────────────────────────────────────────────┐
│                                                                         │
│ Display Options:                                                        │
│ ☑ Show history panel by default                                        │
│ ☑ Include drag operations in history                                   │
│ ☐ Show anonymous changes (hide user emails)                           │
│ ☑ Group similar changes together                                       │
│                                                                         │
│ Retention Policy:                                                       │
│ Keep history for: [12 months ▼]                                       │
│ Archive older entries: (•) Yes  ( ) No                                 │
│                                                                         │
│ Notifications:                                                          │
│ ☑ Email me when my bookings are changed                               │
│ ☐ Daily summary of all changes                                        │
│ ☑ Alert on booking deletions                                          │
│                                                                         │
│                                              [Cancel]  [Save]          │
└─────────────────────────────────────────────────────────────────────────┘
```