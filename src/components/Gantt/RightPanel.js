import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Divider, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../constants';

function RightPanel({ project, onAddDelivery, onEditDelivery, onDeleteDelivery, onUpdateBudget, onUpdateRevenue, artistColors = {} }) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [totalBudget, setTotalBudget] = useState(() => {
    const saved = localStorage.getItem('totalBudget');
    return saved !== null ? parseInt(saved, 10) : (project?.budget || 0);
  });
  const [revenue, setRevenue] = useState(() => {
    const saved = localStorage.getItem('revenue');
    return saved !== null ? parseInt(saved, 10) : (project?.revenue || 0);
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    localStorage.setItem('totalBudget', totalBudget.toString());
    localStorage.setItem('revenue', revenue.toString());
  }, [totalBudget, revenue]);

  const calculateBookingDays = useCallback((booking) => {
    if (!booking?.startDate || !booking?.endDate) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const budgetSpent = useMemo(() => {
    if (!project?.bookings) return 0;
    return project.bookings.reduce((total, booking) => {
      const days = calculateBookingDays(booking);
      return total + (booking.dailyRate || 0) * days;
    }, 0);
  }, [project, calculateBookingDays]);

  const remainingBudget = Math.max(totalBudget - budgetSpent, 0);

  const budgetChartData = useMemo(() => [
    { name: 'Budget Spent', value: budgetSpent },
    { name: 'Remaining Budget', value: remainingBudget },
    { name: 'Revenue', value: revenue },
  ], [budgetSpent, remainingBudget, revenue]);

  const artistCostsChartData = useMemo(() => {
    if (!project?.bookings) return [];
    return project.bookings.reduce((acc, booking) => {
      const artist = booking.artistName;
      const days = calculateBookingDays(booking);
      const cost = days * (booking.dailyRate || 0);
      const existingArtist = acc.find(item => item.name === artist);
      if (existingArtist) {
        existingArtist.value += cost;
      } else {
        acc.push({ name: artist, value: cost });
      }
      return acc;
    }, []);
  }, [project?.bookings, calculateBookingDays]);

  const handleBudgetEdit = () => setIsEditingBudget(true);
  const handleRevenueEdit = () => setIsEditingRevenue(true);

  const handleBudgetChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setTotalBudget(newValue);
    }
  };

  const handleRevenueChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setRevenue(newValue);
    }
  };

  const handleBudgetBlur = () => {
    onUpdateBudget(project.id, totalBudget);
    setIsEditingBudget(false);
  };

  const handleRevenueBlur = () => {
    onUpdateRevenue(project.id, revenue);
    setIsEditingRevenue(false);
  };

  const handleAddDelivery = () => {
    onAddDelivery({ name: deliveryName, date: deliveryDate });
    setOpenDialog(false);
    setDeliveryName('');
    setDeliveryDate('');
  };

  const CustomTooltip = ({ active, payload }) => {
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

  if (!project) {
    return <Typography>No project selected</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2 }}>
      {/* Project Data */}
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography variant="h6" gutterBottom>Project Data</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>Total Budget: $</Typography>
          {isEditingBudget ? (
            <TextField
              value={totalBudget}
              onChange={handleBudgetChange}
              onBlur={handleBudgetBlur}
              size="small"
              sx={{ width: '150px' }}
              type="number"
              inputProps={{ min: 0, step: 1 }}
            />
          ) : (
            <>
              <Typography variant="body1" sx={{ mr: 1 }}>{totalBudget}</Typography>
              <IconButton size="small" onClick={handleBudgetEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Budget Spent: ${budgetSpent}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>Revenue: $</Typography>
          {isEditingRevenue ? (
            <TextField
              value={revenue}
              onChange={handleRevenueChange}
              onBlur={handleRevenueBlur}
              size="small"
              sx={{ width: '150px' }}
              type="number"
              inputProps={{ min: 0, step: 1 }}
            />
          ) : (
            <>
              <Typography variant="body1" sx={{ mr: 1 }}>{revenue}</Typography>
              <IconButton size="small" onClick={handleRevenueEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Pie Charts */}
      <Box sx={{ flex: 1, mx: 2 }}>
        <Typography variant="h6" gutterBottom>Budget Overview</Typography>
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
              {budgetChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={renderColorfulLegendText} />
          </PieChart>
        </ResponsiveContainer>
        <Typography variant="h6" gutterBottom>Artist Costs</Typography>
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
                <Cell key={`cell-${index}`} fill={artistColors[entry.name] || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={renderColorfulLegendText} />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Deliverables */}
      <Box sx={{ flex: 1, mx: 2 }}>
        <Typography variant="h6" gutterBottom>Deliverables</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Add Delivery</Button>
        <List>
          {project.deliveries && project.deliveries.map((delivery) => (
            <ListItem key={delivery.id}>
              <ListItemText primary={delivery.name} secondary={delivery.date} />
              <IconButton onClick={() => onEditDelivery(delivery)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeleteDelivery(delivery.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Artists Booked */}
      <Box sx={{ flex: 1, ml: 2 }}>
        <Typography variant="h6" gutterBottom>Artists Booked</Typography>
        <List>
          {project.bookings && project.bookings.map((booking) => {
            const days = calculateBookingDays(booking);
            const totalCost = days * (booking.dailyRate || 0);
            const currentTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jerusalem' });
            return (
              <ListItem key={booking.id}>
                <ListItemText
                  primary={booking.artistName}
                  secondary={`
                    Daily Rate: $${(booking.dailyRate || 0).toFixed(2)}
                    Total Days: ${days}
                    Skills: ${booking.skills || 'N/A'}
                    Current Time in Israel: ${currentTime}
                  `}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Add Delivery Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Delivery</DialogTitle>
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
