import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Divider, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Slider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { COLORS } from '../../constants';
import moment from 'moment-timezone';

const countryToTimezone = {
  'US': 'America/New_York',
  'GB': 'Europe/London',
  'FR': 'Europe/Paris',
  // Add more countries and their representative timezones as needed
};

function RightPanel({ project, onAddDelivery, onEditDelivery, onDeleteDelivery, onUpdateBudget, onUpdateRevenue, artistColors = {} }) {
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [revenue, setRevenue] = useState(() => {
    const savedRevenue = localStorage.getItem(`project_${project.id}_revenue`);
    console.log('Initial revenue from localStorage:', savedRevenue);
    return savedRevenue ? parseFloat(savedRevenue) : (project.revenue || 0);
  });

  const [revenuePercentage, setRevenuePercentage] = useState(() => {
    const savedPercentage = localStorage.getItem(`project_${project.id}_revenue_percentage`);
    console.log('Initial percentage from localStorage:', savedPercentage);
    return savedPercentage ? parseFloat(savedPercentage) : 20; // Default to 20%
  });

  const calculateBookingDays = useCallback((booking) => {
    if (!booking?.startDate || !booking?.endDate) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  const totalArtistsCosts = useMemo(() => {
    if (!project || !project.bookings || !Array.isArray(project.bookings)) {
      return 0;
    }
    return project.bookings.reduce((total, booking) => {
      const days = calculateBookingDays(booking);
      return total + (booking.dailyRate || 0) * days;
    }, 0);
  }, [project, calculateBookingDays]);

  const totalCosts = useMemo(() => {
    return totalArtistsCosts + revenue;
  }, [totalArtistsCosts, revenue]);

  const [openDialog, setOpenDialog] = useState(false);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const groupedBookings = useMemo(() => {
    if (!project || !project.bookings || !Array.isArray(project.bookings)) {
      return {};
    }
    const grouped = {};
    project.bookings.forEach(booking => {
      if (!grouped[booking.artistName]) {
        grouped[booking.artistName] = {
          bookings: [],
          totalCost: 0,
          skills: new Set(),
          country: booking.artistCountry,
        };
      }
      grouped[booking.artistName].bookings.push(booking);
      const days = calculateBookingDays(booking);
      grouped[booking.artistName].totalCost += (booking.dailyRate || 0) * days;
      if (booking.skills) {
        booking.skills.split(',').forEach(skill => grouped[booking.artistName].skills.add(skill.trim()));
      }
    });
    return grouped;
  }, [project, calculateBookingDays]);

  const sortedArtists = useMemo(() => {
    return Object.entries(groupedBookings)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost);
  }, [groupedBookings]);

  const getArtistLocalTime = useCallback((country) => {
    const timezone = countryToTimezone[country];
    if (!timezone) return null;
    return moment().tz(timezone);
  }, []);

  const handleRevenueEdit = () => setIsEditingRevenue(true);

  const handleRevenueChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= 0) {
      setRevenue(newValue);
      localStorage.setItem(`project_${project.id}_revenue`, newValue.toString());
      console.log('Saving revenue to localStorage:', newValue);
      onUpdateRevenue(project.id, newValue);
    }
  };

  const handleRevenueBlur = () => {
    setIsEditingRevenue(false);
  };

  const handleRevenuePercentageChange = (event, newValue) => {
    setRevenuePercentage(newValue);
    localStorage.setItem(`project_${project.id}_revenue_percentage`, newValue.toString());
    console.log('Saving percentage to localStorage:', newValue);
    
    const newRevenue = Math.round((project?.budget || 0) * (newValue / 100));
    setRevenue(newRevenue);
    localStorage.setItem(`project_${project.id}_revenue`, newRevenue.toString());
    console.log('Saving calculated revenue to localStorage:', newRevenue);
    
    onUpdateRevenue(project.id, newRevenue);
  };

  const handleAddDelivery = () => {
    onAddDelivery({ name: deliveryName, date: deliveryDate });
    setOpenDialog(false);
    setDeliveryName('');
    setDeliveryDate('');
  };

  useEffect(() => {
    const savedRevenue = localStorage.getItem(`project_${project.id}_revenue`);
    const savedPercentage = localStorage.getItem(`project_${project.id}_revenue_percentage`);
    console.log('Effect: Saved revenue:', savedRevenue, 'Saved percentage:', savedPercentage);
    
    if (savedRevenue) {
      setRevenue(parseFloat(savedRevenue));
    }
    if (savedPercentage) {
      setRevenuePercentage(parseFloat(savedPercentage));
    }
  }, [project.id]);

  const marks = [
    { value: 5, label: '5%' },
    { value: 10, label: '10%' },
    { value: 15, label: '15%' },
    { value: 20, label: '20%' },
    { value: 25, label: '25%' },
    { value: 30, label: '30%' },
    { value: 35, label: '35%' },
    { value: 40, label: '40%' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2 }}>
      {/* Project Data */}
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 200 }}>Project Data</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Project Budget</Typography>
                  <Typography variant="body2">${project?.budget || 0}</Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2">
                  Total project budget from database
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Total Costs</Typography>
                  <Typography variant="body2">${totalCosts.toFixed(2)}</Typography>
                </Box>
              }
              secondary={
                <Typography variant="body2">
                  Total amount spent on artists booking + Revenue
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Revenue</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={handleRevenueEdit} sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {isEditingRevenue ? (
                      <TextField
                        value={revenue}
                        onChange={handleRevenueChange}
                        onBlur={handleRevenueBlur}
                        size="small"
                        sx={{ width: '100px' }}
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                      />
                    ) : (
                      <Typography variant="body2">${revenue}</Typography>
                    )}
                  </Box>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2">
                    Additional project revenue ({revenuePercentage.toFixed(1)}% of total budget)
                  </Typography>
                  <Box sx={{ mt: 3, position: 'relative' }}>
                    <Slider
                      value={revenuePercentage}
                      onChange={handleRevenuePercentageChange}
                      aria-labelledby="revenue-percentage-slider"
                      valueLabelDisplay="off"  // This line removes the tooltip
                      step={5}
                      marks={marks}
                      min={5}
                      max={40}
                      sx={{
                        color: 'primary.main',
                        height: 1,
                        padding: '1px 0 !important',
                        '& .MuiSlider-thumb': {
                          height: 0,
                          width: 1,
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: 'none',
                          },
                          '&.Mui-active': {
                            boxShadow: 'none',
                          },
                        },
                        '& .MuiSlider-rail': {
                          height: 1,
                          opacity: 0.3,
                        },
                        '& .MuiSlider-track': {
                          height: 0,
                        },
                        '& .MuiSlider-mark': {
                          backgroundColor: 'primary.main',
                          height: 3,
                          width: 3,
                          borderRadius: '00%',
                          marginTop: -2.5,
                        },
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.65rem',
                          marginTop: -2,
                        },
                      }}
                    />
                  </Box>
                </Box>
              }
            />
          </ListItem>
        </List>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Artists Booked */}
      <Box sx={{ flex: 1, ml: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 400 }}>Artists Booked</Typography>
        <List>
          {sortedArtists.map(([artistName, data]) => {
            const artistLocalTime = getArtistLocalTime(data.country);
            return (
              <ListItem key={artistName}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">{artistName}</Typography>
                      <Typography variant="body2">${data.totalCost.toFixed(2)}</Typography>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 0.5 }}>
                        {Array.from(data.skills).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                      {artistLocalTime && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {artistLocalTime.format('HH:mm')} ({data.country} Local Time)
                        </Typography>
                      )}
                      {data.bookings.map((booking, index) => {
                        const days = calculateBookingDays(booking);
                        return (
                          <Typography key={index} variant="body2">
                            {booking.startDate} - {booking.endDate} ({days} days)
                          </Typography>
                        );
                      })}
                    </React.Fragment>
                  }
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
