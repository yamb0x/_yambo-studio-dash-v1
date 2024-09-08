import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Slider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { COLORS } from '../../constants';

function RightPanel({ project, onAddDelivery, onEditDelivery, onDeleteDelivery, onUpdateBudget, onUpdateRevenue, artistColors = {} }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [tempBudget, setTempBudget] = useState(project?.budget || 0);
  const [tempRevenue, setTempRevenue] = useState(project?.revenue || 0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryAmount, setDeliveryAmount] = useState('');
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  const calculateBookingDays = useCallback((booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const budgetSpent = useMemo(() => {
    if (!project || !project.bookings) return 0;
    return project.bookings.reduce((total, booking) => {
      const days = calculateBookingDays(booking);
      return total + (booking.dailyRate || 0) * days;
    }, 0);
  }, [project, calculateBookingDays]);

  const totalBudget = project?.budget || 0;
  const isOverBudget = budgetSpent > totalBudget;

  const budgetChartData = useMemo(() => {
    const remaining = Math.max(totalBudget - budgetSpent, 0);
    return [
      { name: 'Spent', value: budgetSpent },
      { name: 'Remaining', value: remaining },
    ];
  }, [budgetSpent, totalBudget]);

  const artistCostsChartData = useMemo(() => {
    if (!project || !project.bookings) return [];
    return project.bookings.reduce((acc, booking) => {
      const artist = booking.artistName;
      const days = calculateBookingDays(booking);
      const cost = days * booking.dailyRate;
      const existingArtist = acc.find(item => item.name === artist);
      if (existingArtist) {
        existingArtist.value += cost;
      } else {
        acc.push({ name: artist, value: cost });
      }
      return acc;
    }, []);
  }, [project?.bookings, calculateBookingDays]);

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

  const handleRevenueEdit = () => {
    setIsEditingRevenue(true);
  };

  const handleRevenueSave = () => {
    const newRevenue = parseFloat(tempRevenue);
    if (!isNaN(newRevenue)) {
      onUpdateRevenue(project.id, newRevenue);
      setIsEditingRevenue(false);
    }
  };

  const handleAddOrEditDelivery = () => {
    const delivery = {
      id: editingDelivery ? editingDelivery.id : Date.now(),
      name: deliveryName,
      amount: parseFloat(deliveryAmount),
    };

    if (editingDelivery) {
      onEditDelivery(delivery);
    } else {
      onAddDelivery(delivery);
    }

    setOpenDialog(false);
    setEditingDelivery(null);
    setDeliveryName('');
    setDeliveryAmount('');
  };

  const handleDeleteDelivery = (deliveryId) => {
    onDeleteDelivery(deliveryId);
  };

  const handleOpenDialog = (delivery = null) => {
    if (delivery) {
      setEditingDelivery(delivery);
      setDeliveryName(delivery.name);
      setDeliveryAmount(delivery.amount.toString());
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDelivery(null);
    setDeliveryName('');
    setDeliveryAmount('');
  };

  const toggleDeliveryExpansion = (deliveryId) => {
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

  const currentlyBookedArtists = useMemo(() => {
    if (!project || !project.bookings) return [];
    const now = new Date();
    return project.bookings.filter(booking => 
      new Date(booking.startDate) <= now && new Date(booking.endDate) >= now
    ).map(booking => booking.artistName);
  }, [project]);

  if (!project) {
    return <Typography>No project selected</Typography>;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      height: '100%', 
      p: 2, 
      gap: 2, 
      overflow: 'auto'
    }}>
      {/* Project Data */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>Project Data</Typography>
          {/* Budget editing */}
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
                <Typography variant="body1" sx={{ mr: 1 }}>{totalBudget.toFixed(2)}</Typography>
                <IconButton size="small" onClick={handleBudgetEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
          <Typography variant="body1" sx={{ mb: 1, color: isOverBudget ? 'error.main' : 'inherit' }}>
            Budget Spent: ${budgetSpent.toFixed(2)}
          </Typography>
          {/* Revenue editing */}
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

        {/* Budget Pie Chart */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom align="center">Budget Overview</Typography>
          <ResponsiveContainer width="100%" height={200}>
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
      </Box>

      {/* Artist Costs Pie Chart */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom align="center">Artist Costs</Typography>
        <ResponsiveContainer width="100%" height={200}>
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

      {/* Revenue Slider */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography gutterBottom>Adjust Revenue</Typography>
        <Slider
          value={parseFloat(tempRevenue)}
          onChange={(_, newValue) => setTempRevenue(newValue)}
          onChangeCommitted={(_, newValue) => onUpdateRevenue(project.id, newValue)}
          min={0}
          max={project.budget * 2}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `$${value}`}
        />
      </Box>

      {/* Currently Booked Artists */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>Currently Booked Artists</Typography>
        {currentlyBookedArtists.length > 0 ? (
          <List>
            {currentlyBookedArtists.map((artist, index) => (
              <ListItem key={index}>
                <ListItemText primary={artist} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No artists currently booked</Typography>
        )}
      </Box>

      {/* Deliveries Section */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>Deliveries</Typography>
        {project.deliveries && project.deliveries.length > 0 ? (
          <List>
            {project.deliveries.map((delivery) => (
              <ListItem key={delivery.id} disablePadding>
                <ListItemText 
                  primary={delivery.name} 
                  secondary={`$${delivery.amount}`} 
                  onClick={() => toggleDeliveryExpansion(delivery.id)}
                />
                <IconButton onClick={() => handleOpenDialog(delivery)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteDelivery(delivery.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No deliveries added yet</Typography>
        )}
        <Button variant="contained" onClick={() => handleOpenDialog()}>Add Delivery</Button>
      </Box>

      {/* Delivery Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingDelivery ? 'Edit Delivery' : 'Add Delivery'}</DialogTitle>
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
            label="Amount"
            type="number"
            fullWidth
            value={deliveryAmount}
            onChange={(e) => setDeliveryAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddOrEditDelivery}>{editingDelivery ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RightPanel;
