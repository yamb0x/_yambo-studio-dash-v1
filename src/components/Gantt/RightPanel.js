import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import moment from 'moment'; // Add this import

function RightPanel({ project, onAddDelivery }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const calculateTotalExpenses = () => {
    if (!project || !project.bookings || !Array.isArray(project.bookings)) {
      return 0; // Return 0 if project or bookings are not properly defined
    }
    return project.bookings.reduce((total, booking) => {
      const days = moment(booking.endDate).diff(moment(booking.startDate), 'days') + 1;
      return total + (days * (booking.dailyRate || 0));
    }, 0);
  };

  const handleAddDelivery = () => {
    onAddDelivery({ name: deliveryName, date: deliveryDate });
    setOpenDialog(false);
    setDeliveryName('');
    setDeliveryDate('');
  };

  return (
    <Box sx={{ width: '300px', borderLeft: '1px solid #e0e0e0', p: 2 }}>
      <Typography variant="h6" gutterBottom>Project Summary</Typography>
      <Typography>Total Expenses: ${calculateTotalExpenses().toFixed(2)}</Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Deliveries</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Add Delivery</Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Delivery</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDelivery}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RightPanel;
