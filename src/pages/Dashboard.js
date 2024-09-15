import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Grid, Paper, Box, Tabs, Tab, TextField, Avatar, InputAdornment, Card, CardContent, LinearProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Select, MenuItem, FormControl, InputLabel, Collapse, IconButton } from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { format, isWithinInterval, parseISO, subMonths, subYears, isAfter, isBefore } from 'date-fns';
import { Link } from 'react-router-dom';

const paperStyle = {
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
  borderRadius: '4px'
};

function ProjectCard({ project, calculateProgress, calculateTotalCosts }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const totalCosts = calculateTotalCosts(project);
  const additionalExpenses = project.additionalExpenses || 0;
  const totalExpenses = totalCosts + additionalExpenses;
  const profit = project.budget - totalExpenses;
  const isProfitable = profit >= 0;

  return (
    <Card sx={{ ...paperStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Link to={`/gantt/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" gutterBottom>{project.name}</Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {format(parseISO(project.startDate), 'MMM d, yyyy')} - {format(parseISO(project.endDate), 'MMM d, yyyy')}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress(project)} 
          sx={{ 
            mb: 1, 
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#000000',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2">
            Progress: {Math.round(calculateProgress(project))}%
          </Typography>
          <IconButton 
            onClick={toggleExpand} 
            size="small" 
            sx={{ p: 0 }}
          >
            {expanded ? <RemoveIcon /> : <AddIcon />}
            <Typography variant="body2" sx={{ ml: 0.5 }}>Details</Typography>
          </IconButton>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, opacity: expanded ? 1 : 0, transition: 'opacity 0.3s' }}>
            <Typography variant="body2">Budget: ${project.budget.toLocaleString()}</Typography>
            <Typography variant="body2">Total Expenses: ${totalExpenses.toLocaleString()}</Typography>
            <Typography 
              variant="body2"
              sx={{ 
                fontWeight: 'bold',
                color: isProfitable ? 'green' : 'red'
              }}
            >
              {isProfitable 
                ? `Profit: $${profit.toLocaleString()}` 
                : `Loss: $${Math.abs(profit).toLocaleString()}`
              }
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { projects } = useProjects();
  const { artists } = useArtists();
  const [tabValue, setTabValue] = useState(0);
  const [bookingPeriod, setBookingPeriod] = useState('all');
  const [artistBookings, setArtistBookings] = useState([]);
  const [mostBookedArtists, setMostBookedArtists] = useState([]);
  const [notes, setNotes] = useState('');

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

  const activeProjects = projects.filter(project => 
    isAfter(currentDate, parseISO(project.startDate)) && 
    isAfter(parseISO(project.endDate), currentDate)
  );

  const completedProjects = projects.filter(project => 
    isAfter(currentDate, parseISO(project.endDate))
  );

  const upcomingProjects = projects.filter(project => 
    isAfter(parseISO(project.startDate), currentDate)
  );

  const getArtistImage = (artistName) => {
    const imageName = artistName.toLowerCase().replace(/\s+/g, '');
    const extensions = ['png', 'jpg', 'jpeg'];
    
    // Create an array of possible image URLs
    const imageUrls = extensions.map(ext => `/assets/artists/${imageName}.${ext}`);
    
    return imageUrls;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Overview cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2 }}>
              <Typography variant="h6" gutterBottom>Total Projects</Typography>
              <Typography variant="h4">{projectStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2 }}>
              <Typography variant="h6" gutterBottom>In Progress</Typography>
              <Typography variant="h4">{projectStats.inProgress}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2 }}>
              <Typography variant="h6" gutterBottom>Completed</Typography>
              <Typography variant="h4">{projectStats.completed}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2 }}>
              <Typography variant="h6" gutterBottom>Total Artists</Typography>
              <Typography variant="h4">{artistStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{artistStats.newLastQuarter} added in the last quarter
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Projects section */}
        <Paper sx={{ ...paperStyle, mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Projects
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTabs-indicator': {
                backgroundColor: '#000000',
              },
            }}
          >
            <Tab label="Active Projects" sx={{ color: '#000000' }} />
            <Tab label="Completed Projects" sx={{ color: '#000000' }} />
            <Tab label="Upcoming Projects" sx={{ color: '#000000' }} />
          </Tabs>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {tabValue === 0 && activeProjects.map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ProjectCard 
                    project={project}
                    calculateProgress={calculateProgress}
                    calculateTotalCosts={calculateTotalCosts}
                  />
                </Grid>
              ))}
              {tabValue === 1 && completedProjects.map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ProjectCard 
                    project={project}
                    calculateProgress={calculateProgress}
                    calculateTotalCosts={calculateTotalCosts}
                  />
                </Grid>
              ))}
              {tabValue === 2 && upcomingProjects.map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ProjectCard 
                    project={project}
                    calculateProgress={calculateProgress}
                    calculateTotalCosts={calculateTotalCosts}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Most booked artists and Notes */}
        <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ ...paperStyle, p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Most Booked Artists
                </Typography>
                <FormControl variant="outlined" size="small">
                  <Select
                    value={bookingPeriod}
                    onChange={handleBookingPeriodChange}
                    displayEmpty
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: 0,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000000',
                      },
                      minWidth: 120,
                    }}
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
                        <Avatar src={getArtistImage(artist.name)[0]} alt={artist.name}>
                          {artist.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={artist.name} 
                        secondary={`${artist.bookings} bookings`} 
                      />
                    </ListItem>
                    {index < mostBookedArtists.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ ...paperStyle, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <TextField
                multiline
                value={notes}
                onChange={handleNotesChange}
                fullWidth
                variant="outlined"
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    '& textarea': {
                      height: '100% !important',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#000000',
                    },
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;

