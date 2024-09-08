import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import moment from 'moment';

function RightPanel({ project, onAddDelivery, onEditDelivery, onDeleteDelivery, onUpdateBudget }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(project?.budget || 0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  const calculateBudgetSpent = useCallback(() => {
    return (project?.bookings || []).reduce((total, booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const days = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
      return total + (booking.dailyRate * days);
    }, 0);
  }, [project?.bookings]);

  const budgetSpent = calculateBudgetSpent();
  const totalBudget = project?.budget || 0;
  const isOverBudget = budgetSpent > totalBudget;

  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
  };

  const handleBudgetSave = () => {
    const newBudget = parseFloat(tempBudget);
    if (!isNaN(newBudget)) {
      onUpdateBudget(newBudget);
      setIsEditingBudget(false);
    }
  };

  const chartData = useMemo(() => {
    const remaining = Math.max(totalBudget - budgetSpent, 0);
    return [
      { name: 'Spent', value: budgetSpent },
      { name: 'Remaining', value: remaining },
    ];
  }, [totalBudget, budgetSpent]);

  const handleAddOrEditDelivery = () => {
    const delivery = {
      id: editingDelivery ? editingDelivery.id : Date.now(),
      name: deliveryName,
      date: deliveryDate,
      notes: deliveryNotes,
    };

    if (editingDelivery) {
      onEditDelivery(delivery);
    } else {
      onAddDelivery(delivery);
    }

    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setDeliveryName('');
    setDeliveryDate('');
    setDeliveryNotes('');
    setEditingDelivery(null);
  };

  const handleEditClick = (delivery) => {
    setEditingDelivery(delivery);
    setDeliveryName(delivery.name);
    setDeliveryDate(delivery.date);
    setDeliveryNotes(delivery.notes || '');
    setOpenDialog(true);
  };

  const handleDeleteClick = (deliveryId) => {
    onDeleteDelivery(deliveryId);
  };

  const toggleExpand = (deliveryId) => {
    setExpandedDelivery(expandedDelivery === deliveryId ? null : deliveryId);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', p: 2 }}>
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography variant="h6" gutterBottom>Project Data</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Total Budget: $
          </Typography>
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
              <Typography variant="body1" sx={{ mr: 1 }}>
                {totalBudget.toFixed(2)}
              </Typography>
              <IconButton size="small" onClick={handleBudgetEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        <Typography 
          variant="body1" 
          sx={{ mb: 2, color: isOverBudget ? 'error.main' : 'inherit' }}
        >
          Budget Spent: ${budgetSpent.toFixed(2)}
        </Typography>

        <Box sx={{ height: 150, width: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
              >
                <Cell fill="#000000" />
                <Cell fill="#CCCCCC" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box sx={{ flex: 2 }}>
        <Typography variant="h6" gutterBottom>Deliveries</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
          Add Delivery
        </Button>
        <List>
          {project.deliveries && project.deliveries.map((delivery) => (
            <ListItem key={delivery.id}>
              <ListItemText
                primary={delivery.name}
                secondary={delivery.date}
              />
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(delivery)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(delivery.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }}>
        <DialogTitle>{editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Delivery Name"
            fullWidth
            value={deliveryName}
            onChange={(e) => setDeliveryName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Delivery Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleAddOrEditDelivery}>{editingDelivery ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RightPanel;
