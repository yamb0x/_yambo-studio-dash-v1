import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

function RightPanel({ 
  project, 
  onAddDelivery, 
  onEditDelivery, 
  onDeleteDelivery, 
  onUpdateBudget, 
  onUpdateRevenue = () => {}, 
  artistColors = {} 
}) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [tempBudget, setTempBudget] = useState(project?.budget || 0);
  const [tempRevenue, setTempRevenue] = useState(project?.revenue || 0);

  const budgetSpent = useMemo(() => {
    if (!project || !project.bookings) return 0;
    return project.bookings.reduce((total, booking) => {
      const days = (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24) + 1;
      return total + (booking.dailyRate || 0) * days;
    }, 0);
  }, [project]);

  const isOverBudget = budgetSpent > (project?.budget || 0);

  const handleBudgetEdit = () => setIsEditingBudget(true);
  const handleRevenueEdit = () => setIsEditingRevenue(true);

  const handleBudgetSave = () => {
    onUpdateBudget(project.id, parseFloat(tempBudget));
    setIsEditingBudget(false);
  };

  const handleRevenueSave = () => {
    onUpdateRevenue(project.id, parseFloat(tempRevenue));
    setIsEditingRevenue(false);
  };

  if (!project) {
    return <Typography>No project selected</Typography>;
  }

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom>Project Details</Typography>
      
      {/* Total Budget */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>Total Budget: $</Typography>
        {isEditingBudget ? (
          <TextField
            value={tempBudget}
            onChange={(e) => setTempBudget(e.target.value)}
            onBlur={handleBudgetSave}
            size="small"
            sx={{ width: '100px' }}
          />
        ) : (
          <>
            <Typography variant="body1" sx={{ mr: 1 }}>{(project.budget || 0).toFixed(2)}</Typography>
            <IconButton size="small" onClick={handleBudgetEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* Budget Spent */}
      <Typography 
        variant="body1" 
        sx={{ mb: 1, color: isOverBudget ? 'error.main' : 'inherit' }}
      >
        Budget Spent: ${budgetSpent.toFixed(2)}
      </Typography>

      {/* Revenue */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body1" sx={{ mr: 1 }}>Revenue: $</Typography>
        {isEditingRevenue ? (
          <TextField
            value={tempRevenue}
            onChange={(e) => setTempRevenue(e.target.value)}
            onBlur={handleRevenueSave}
            size="small"
            sx={{ width: '100px' }}
          />
        ) : (
          <>
            <Typography variant="body1" sx={{ mr: 1 }}>{tempRevenue.toFixed(2)}</Typography>
            <IconButton size="small" onClick={handleRevenueEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
}

export default RightPanel;
