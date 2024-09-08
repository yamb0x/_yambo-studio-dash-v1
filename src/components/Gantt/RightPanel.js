import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Divider,
  Slider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../../constants';

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
  const [revenuePercentage, setRevenuePercentage] = useState(25); // Default to 25%
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  const calculateBookingDays = useCallback((booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const calculateBudgetSpent = useCallback(() => {
    return (project?.bookings || []).reduce((total, booking) => {
      const days = calculateBookingDays(booking);
      return total + (booking.dailyRate * days);
    }, 0);
  }, [project?.bookings, calculateBookingDays]);

  const budgetSpent = calculateBudgetSpent();
  const totalBudget = project?.budget || 0;
  const revenue = project?.revenue || 0;
  const isOverBudget = budgetSpent > totalBudget;

  const budgetChartData = useMemo(() => {
    const spent = Math.min(budgetSpent, totalBudget);
    const remaining = Math.max(totalBudget - budgetSpent, 0);
    return [
      { name: 'Spent', value: spent },
      { name: 'Remaining', value: remaining },
      { name: 'Revenue', value: revenue },
    ];
  }, [totalBudget, budgetSpent, revenue]);

  const artistCostsChartData = useMemo(() => {
    return project?.bookings.reduce((acc, booking) => {
      const cost = booking.dailyRate * calculateBookingDays(booking);
      const existingArtist = acc.find(item => item.name === booking.artistName);
      if (existingArtist) {
        existingArtist.value += cost;
      } else {
        acc.push({ name: booking.artistName, value: cost });
      }
      return acc;
    }, []);
  }, [project?.bookings, calculateBookingDays]);

  const handleBudgetEdit = () => setIsEditingBudget(true);
  const handleRevenueEdit = () => setIsEditingRevenue(true);

  const handleBudgetSave = () => {
    const newBudget = parseFloat(tempBudget);
    if (!isNaN(newBudget)) {
      onUpdateBudget(newBudget);
      setIsEditingBudget(false);
    }
  };

  const handleRevenuePercentageChange = (event, newValue) => {
    setRevenuePercentage(newValue);
    const newRevenue = (project?.budget || 0) * (newValue / 100);
    setTempRevenue(newRevenue);
    onUpdateRevenue(newRevenue);
  };

  const handleRevenueSave = () => {
    const newRevenue = parseFloat(tempRevenue);
    if (!isNaN(newRevenue)) {
      onUpdateRevenue(newRevenue);
      setIsEditingRevenue(false);
    }
  };

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

  const getArtistColor = useCallback((artistName) => {
    return artistColors[artistName] || COLORS[Object.keys(artistColors).length % COLORS.length];
  }, [artistColors]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <Typography>{`${payload[0].name}: $${payload[0].value.toFixed(2)}`}</Typography>
          <Typography>{`${(payload[0].percent * 100).toFixed(2)}%`}</Typography>
        </Box>
      );
    }
    return null;
  };

  const renderColorfulLegendText = (value, entry) => {
    return <span style={{ color: entry.color, fontWeight: 'bold' }}>{value}</span>;
  };

  const deliveriesData = useMemo(() => {
    if (!project || !project.deliveries || !Array.isArray(project.deliveries)) {
      return [];
    }

    return project.deliveries.reduce((acc, delivery) => {
      // ... existing reduction logic
    }, []);
  }, [project]);

  return (
    <Box sx={{ display: 'flex', width: '100%', p: 2, gap: 2, paddingTop: 4 }}>
      {/* Project Data */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Project Data</Typography>
        
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
              <Typography variant="body1" sx={{ mr: 1 }}>{(project?.budget || 0).toFixed(2)}</Typography>
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

        {/* Revenue Percentage Slider */}
        <Box sx={{ width: '60%', mt: 2 }}>
          <Typography id="revenue-percentage-slider" gutterBottom>
            Revenue Percentage: {revenuePercentage}%
          </Typography>
          <Slider
            value={revenuePercentage}
            onChange={handleRevenuePercentageChange}
            aria-labelledby="revenue-percentage-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={10}
            max={40}
            sx={{ width: '100%' }}
          />
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Budget Pie Chart */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle1" gutterBottom>Budget Overview</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={budgetChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              <Cell fill="#000000" />
              <Cell fill="#CCCCCC" />
              <Cell fill="#888888" /> {/* Revenue color */}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={renderColorfulLegendText} 
              iconSize={10} 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Artist Costs Pie Chart */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle1" gutterBottom>Artist Costs</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={artistCostsChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {artistCostsChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getArtistColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={renderColorfulLegendText} 
              iconSize={10} 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Deliveries */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>Deliveries</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 1 }}>
          Add Delivery
        </Button>
        <List dense>
          {deliveriesData.map((delivery) => (
            <ListItem key={delivery.id} secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(delivery)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(delivery.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }>
              <ListItemText
                primary={delivery.name}
                secondary={delivery.date}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Booked Artists */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>Booked Artists</Typography>
        <List dense>
          {project.bookings && project.bookings.map((booking) => (
            <ListItem key={booking.id}>
              <ListItemText
                primary={booking.artistName}
                secondary={`Daily Rate: $${booking.dailyRate} | Skills: ${booking.skills || 'N/A'}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Keep the Dialog for adding/editing deliveries */}
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
