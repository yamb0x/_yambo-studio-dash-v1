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
      const before = changes.before;
      const after = changes.after;
      
      // Check what changed
      const dateChanged = before.startDate !== after.startDate || before.endDate !== after.endDate;
      const rateChanged = before.dailyRate !== after.dailyRate;
      
      if (dateChanged) {
        try {
          const beforeStart = format(parseISO(before.startDate), 'MMM d');
          const beforeEnd = format(parseISO(before.endDate), 'MMM d');
          const afterStart = format(parseISO(after.startDate), 'MMM d');
          const afterEnd = format(parseISO(after.endDate), 'MMM d');
          return `Moved booking: ${beforeStart} - ${beforeEnd} → ${afterStart} - ${afterEnd}`;
        } catch (e) {
          return 'Updated booking dates';
        }
      } else if (rateChanged) {
        return `Updated daily rate: $${before.dailyRate} → $${after.dailyRate}`;
      }
      return 'Updated booking details';
    }
    return 'Made changes';
  };

  const filteredHistory = projectHistory.filter(entry => {
    if (filter === 'all') return true;
    return entry.action === filter;
  });

  const groupHistoryByDate = (entries) => {
    const groups = {};
    entries.forEach(entry => {
      const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

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
            Object.entries(groupedHistory).map(([date, entries]) => (
              <Box key={date}>
                <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    {isToday(parseISO(date + 'T00:00:00')) ? 'Today' : 
                     isYesterday(parseISO(date + 'T00:00:00')) ? 'Yesterday' :
                     format(parseISO(date + 'T00:00:00'), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
                <List sx={{ py: 0 }}>
                  {entries.map((entry, index) => (
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
                                {format(parseISO(entry.timestamp), 'HH:mm')}
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
                      {index < entries.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))
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