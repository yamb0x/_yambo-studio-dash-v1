import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Typography, Grid, Paper, Box, Tabs, Tab, TextField, Avatar, InputAdornment, Card, CardContent, LinearProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { format, isWithinInterval, parseISO, subMonths, subYears, isAfter, isBefore } from 'date-fns';

// Create a custom theme to override default styles
const theme = createTheme({
  palette: {
    primary: {
      main: '#757575', // Use a gray color instead of blue
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          borderRadius: 0,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

function Dashboard() {
  const { projects } = useProjects();
  const { artists } = useArtists();
  const [tabValue, setTabValue] = useState(0);
  const [bookingPeriod, setBookingPeriod] = useState('all');
  const [artistBookings, setArtistBookings] = useState([]);
  const [mostBookedArtists, setMostBookedArtists] = useState([]);
  const [notes, setNotes] = useState('');
  const notesRef = useRef(null);

  const currentDate = new Date();
  const lastQuarterStart = subMonths(currentDate, 3);

  const projectStats = useMemo(() => {
    const inProgressProjects = projects.filter(project => 
      isAfter(currentDate, parseISO(project.startDate)) && 
      isAfter(parseISO(project.endDate), currentDate)
    );
    const completedProjects = projects.filter(project => 
      isAfter(currentDate, parseISO(project.endDate))
    );
    const newProjectsLastQuarter = projects.filter(project => 
      isAfter(parseISO(project.startDate), lastQuarterStart)
    );

    return {
      total: projects.length,
      inProgress: inProgressProjects.length,
      completed: completedProjects.length,
      newLastQuarter: newProjectsLastQuarter.length
    };
  }, [projects, currentDate, lastQuarterStart]);

  const artistStats = useMemo(() => {
    // Assuming artists have a 'joinDate' property. Adjust if needed.
    const newArtistsLastQuarter = artists.filter(artist => 
      artist.joinDate && isAfter(parseISO(artist.joinDate), lastQuarterStart)
    );

    return {
      total: artists.length,
      newLastQuarter: newArtistsLastQuarter.length
    };
  }, [artists, lastQuarterStart]);

  const calculateBookingDays = (booking) => {
    if (!booking?.startDate || !booking?.endDate) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateTotalCosts = (project) => {
    if (!project || !project.bookings || !Array.isArray(project.bookings)) {
      return 0;
    }
    return project.bookings.reduce((total, booking) => {
      const days = calculateBookingDays(booking);
      return total + (booking.dailyRate || 0) * days;
    }, 0);
  };

  const calculateProfit = (project) => {
    const totalCosts = calculateTotalCosts(project);
    return project.budget - totalCosts;
  };

  useEffect(() => {
    console.log('All projects:', projects);
    console.log('All artists:', artists);

    const filterDate = {
      'past3Months': subMonths(currentDate, 3),
      'pastYear': subYears(currentDate, 1),
      'lastYear': subYears(currentDate, 1),
    };

    // Calculate artist bookings
    const bookings = artists.map(artist => {
      const artistProjects = projects.filter(project => {
        const projectStart = parseISO(project.startDate);
        const projectEnd = parseISO(project.endDate);
        
        if (bookingPeriod === 'all') {
          return project.bookings && project.bookings.some(booking => booking.artistId === artist.id);
        } else if (bookingPeriod === 'lastYear') {
          return project.bookings && 
                 project.bookings.some(booking => booking.artistId === artist.id) &&
                 isAfter(projectStart, filterDate.lastYear) &&
                 isBefore(projectEnd, currentDate);
        } else {
          return project.bookings && 
                 project.bookings.some(booking => booking.artistId === artist.id) &&
                 isAfter(projectEnd, filterDate[bookingPeriod]);
        }
      });

      return {
        ...artist,
        bookings: artistProjects.length,
        projectNames: artistProjects.map(project => project.name)
      };
    });

    setArtistBookings(bookings);
    
    // Sort and get top 8 most booked artists
    const topArtists = [...bookings].sort((a, b) => b.bookings - a.bookings).slice(0, 8);
    setMostBookedArtists(topArtists);

    // Load saved notes
    const savedNotes = localStorage.getItem('dashboardNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [projects, artists, bookingPeriod]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBookingPeriodChange = (event) => {
    setBookingPeriod(event.target.value);
  };

  const calculateProgress = (project) => {
    const start = parseISO(project.startDate);
    const end = parseISO(project.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = currentDate.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const handleNotesChange = (event) => {
    const newNotes = event.target.value;
    setNotes(newNotes);
    localStorage.setItem('dashboardNotes', newNotes);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Main content */}
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Dashboard</Typography>
            {/* Commented out search and user icon */}
            {/*
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
              />
              <Avatar><PersonIcon /></Avatar>
            </Box>
            */}
          </Box>

          {/* Overview cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Total Projects</Typography>
                <Typography variant="h4">{projectStats.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  +{projectStats.newLastQuarter} from last quarter
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>In Progress</Typography>
                <Typography variant="h4">{projectStats.inProgress}</Typography>
                <Typography variant="body2" color="text.secondary">
                  +{projectStats.newLastQuarter} from last quarter
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Completed</Typography>
                <Typography variant="h4">{projectStats.completed}</Typography>
                <Typography variant="body2" color="text.secondary">
                  +{projectStats.newLastQuarter} from last quarter
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Total Artists</Typography>
                <Typography variant="h4">{artistStats.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  +{artistStats.newLastQuarter} added in the last quarter
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Projects section */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <Tab label="Active Projects" />
              <Tab label="Completed Projects" />
            </Tabs>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {(tabValue === 0 ? projects.filter(project => 
                  isAfter(currentDate, parseISO(project.startDate)) && 
                  isAfter(parseISO(project.endDate), currentDate)
                ) : projects.filter(project => 
                  isAfter(currentDate, parseISO(project.endDate))
                )).map((project, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{project.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {format(parseISO(project.startDate), 'MMM d, yyyy')} - {format(parseISO(project.endDate), 'MMM d, yyyy')}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateProgress(project)} 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                          Progress: {Math.round(calculateProgress(project))}%
                        </Typography>
                        <Typography variant="body2">Budget: ${project.budget.toLocaleString()}</Typography>
                        <Typography variant="body2">
                          Profit: ${calculateProfit(project).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>

          {/* Most booked artists and Notes */}
          <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Most Booked Artists</Typography>
                  <FormControl variant="outlined" size="small">
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={bookingPeriod}
                      onChange={handleBookingPeriodChange}
                      label="Period"
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="past3Months">Past 3 Months</MenuItem>
                      <MenuItem value="pastYear">Past Year</MenuItem>
                      <MenuItem value="lastYear">Last Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <List>
                  {mostBookedArtists.map((artist, index) => (
                    <React.Fragment key={artist.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>{artist.name.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={artist.name} 
                          secondary={`${artist.bookings} project${artist.bookings !== 1 ? 's' : ''}`}
                        />
                      </ListItem>
                      {index < mostBookedArtists.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Notes</Typography>
                <TextField
                  multiline
                  fullWidth
                  value={notes}
                  onChange={handleNotesChange}
                  variant="outlined"
                  sx={{ 
                    flexGrow: 1, 
                    '& .MuiInputBase-root': { 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      '& textarea': { 
                        flexGrow: 1 
                      } 
                   },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#757575',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#757575',
                    },
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;

