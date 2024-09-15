import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Divider, List, ListItem, ListItemText, Chip, Slider, Button, Dialog, DialogTitle, DialogContent, DialogActions, ListItemSecondaryAction } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../../constants';
import moment from 'moment-timezone';
import { useProjects } from '../../contexts/ProjectContext';

const countryToTimezone = {
  'US': 'America/New_York',
  'GB': 'Europe/London',
  'FR': 'Europe/Paris',
  // Add more countries and their representative timezones as needed
};

function RightPanel({ project, onUpdateBudget, onUpdateRevenue, onTotalCostsCalculated, artistColors = {} }) {
  const { addDelivery, removeDelivery, updateDelivery } = useProjects();
  const [isEditingRevenue, setIsEditingRevenue] = useState(false);
  const [revenue, setRevenue] = useState(() => {
    const savedRevenue = localStorage.getItem(`project_${project.id}_revenue`);
    return savedRevenue ? parseFloat(savedRevenue) : (project.revenue || 0);
  });

  const [revenuePercentage, setRevenuePercentage] = useState(() => {
    const savedPercentage = localStorage.getItem(`project_${project.id}_revenue_percentage`);
    return savedPercentage ? parseFloat(savedPercentage) : 20; // Default to 20%
  });

  const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);
  const [newDelivery, setNewDelivery] = useState({ name: '', date: '' });
  const [editingDelivery, setEditingDelivery] = useState(null);

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
      onUpdateRevenue(project.id, newValue);
    }
  };

  const handleRevenueBlur = () => {
    setIsEditingRevenue(false);
  };

  const handleRevenuePercentageChange = (event, newValue) => {
    setRevenuePercentage(newValue);
    localStorage.setItem(`project_${project.id}_revenue_percentage`, newValue.toString());
    
    const newRevenue = Math.round(project.budget * (newValue / 100));
    setRevenue(newRevenue);
    localStorage.setItem(`project_${project.id}_revenue`, newRevenue.toString());
    
    onUpdateRevenue(project.id, newRevenue);
  };

  const handleAddDelivery = () => {
    setEditingDelivery(null);
    setNewDelivery({ name: '', date: '' });
    setOpenDeliveryDialog(true);
  };

  const handleEditDelivery = (delivery) => {
    setEditingDelivery(delivery);
    setNewDelivery({ name: delivery.name, date: delivery.date });
    setOpenDeliveryDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDeliveryDialog(false);
    setNewDelivery({ name: '', date: '' });
    setEditingDelivery(null);
  };

  const handleDeliverySubmit = () => {
    if (editingDelivery) {
      updateDelivery(project.id, editingDelivery.id, newDelivery);
    } else {
      addDelivery(project.id, {
        id: Date.now().toString(),
        ...newDelivery
      });
    }
    handleCloseDialog();
  };

  const handleDeleteDelivery = (deliveryId) => {
    removeDelivery(project.id, deliveryId);
  };

  useEffect(() => {
    const savedRevenue = localStorage.getItem(`project_${project.id}_revenue`);
    const savedPercentage = localStorage.getItem(`project_${project.id}_revenue_percentage`);
    
    if (savedRevenue) {
      setRevenue(parseFloat(savedRevenue));
    }
    if (savedPercentage) {
      setRevenuePercentage(parseFloat(savedPercentage));
    }
  }, [project.id]);

  useEffect(() => {
    if (typeof onTotalCostsCalculated === 'function') {
      onTotalCostsCalculated(project.id, totalCosts);
    }
  }, [project.id, totalCosts, onTotalCostsCalculated]);

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

  const getAdjustedDate = (date) => {
    const projectStart = moment(project.startDate);
    const daysSinceStart = date.diff(projectStart, 'days');
    const weeksOnGantt = Math.floor(daysSinceStart / 5);
    const daysInWeek = daysSinceStart % 5;
    
    return projectStart.clone()
      .add(weeksOnGantt * 7, 'days')
      .add(daysInWeek, 'days');
  };

  const renderBooking = (booking) => {
    const adjustedStartDate = getAdjustedDate(moment(booking.startDate));
    const adjustedEndDate = getAdjustedDate(moment(booking.endDate));
    
    // Use the booking's own duration calculation
    const duration = booking.duration || calculateBookingDays(booking);

    return (
      <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.2, fontWeight: 300 }}>
        {adjustedStartDate.format('MMM D')} - {adjustedEndDate.format('MMM D')} ({duration} days)
      </Typography>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', flex: 1, mb: 2 }}>
        {/* Project Data */}
        <Box sx={{ flex: 1, mr: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 300 }}>Project Data</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 400 }}>Project Budget</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>${project?.budget || 0}</Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.secondary' }}>
                    Total project budget from database
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 400 }}>Total Costs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>${totalCosts.toFixed(2)}</Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.secondary' }}>
                    Total amount spent on artists booking + Revenue
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 400 }}>Additional Expenses</Typography>
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
                        <Typography variant="body2" sx={{ fontWeight: 300 }}>${revenue}</Typography>
                      )}
                    </Box>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      Expected project expenses ({revenuePercentage.toFixed(1)}% of project budget)
                    </Typography>
                    <Box sx={{ mt: 3, position: 'relative' }}>
                      <Slider
                        value={revenuePercentage}
                        onChange={handleRevenuePercentageChange}
                        aria-labelledby="revenue-percentage-slider"
                        valueLabelDisplay="off"
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
          <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 300 }}>Artists Booked</Typography>
          <List sx={{ pt: 0 }}>
            {sortedArtists.map(([artistName, data], index) => (
              <ListItem key={artistName} sx={{ py: index === 0 ? '12px' : 0.5, pl: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 400 }}>{artistName}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 300 }}>${data.totalCost.toFixed(2)}</Typography>
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      {data.bookings.map((booking, bookingIndex) => (
                        <Box key={bookingIndex} sx={{ mt: bookingIndex === 0 ? 0.5 : 0.25 }}>
                          {renderBooking(booking)}
                        </Box>
                      ))}
                    </React.Fragment>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Box sx={{ flex: 1, mr: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 300 }}>Project Deliverables</Typography>
          <Button
            variant="outlined"
            onClick={handleAddDelivery}
            sx={{ ml: 2, mb: 2 }}
          >
            Add Delivery
          </Button>
          <List>
            {project.deliveries && project.deliveries.map((delivery) => (
              <ListItem key={delivery.id}>
                <ListItemText 
                  primary={delivery.name} 
                  secondary={delivery.date} 
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={() => handleEditDelivery(delivery)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon sx={{ color: 'text.secondary' }} />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteDelivery(delivery.id)}
                  >
                    <DeleteIcon sx={{ color: 'text.secondary' }} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ flex: 1, ml: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ pl: 2, fontWeight: 300 }}>Export Data</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => console.log('Export data functionality to be implemented')}
              sx={{ ml: 2, mb: 2 }}
            >
              Export Project Data
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={openDeliveryDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Delivery Name"
            fullWidth
            value={newDelivery.name}
            onChange={(e) => setNewDelivery({ ...newDelivery, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Delivery Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newDelivery.date}
            onChange={(e) => setNewDelivery({ ...newDelivery, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeliverySubmit}>{editingDelivery ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RightPanel;
