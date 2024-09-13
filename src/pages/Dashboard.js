import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, Tabs, Tab, TextField, Avatar, InputAdornment, Card, CardContent, LinearProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { format, isWithinInterval, parseISO, subMonths, subYears, isAfter, isBefore } from 'date-fns';

function Dashboard() {
  const { projects } = useProjects();
  const { artists } = useArtists();
  const [tabValue, setTabValue] = useState(0);
  const [bookingPeriod, setBookingPeriod] = useState('all');
  const [artistBookings, setArtistBookings] = useState([]);
  const [mostBookedArtists, setMostBookedArtists] = useState([]);

  useEffect(() => {
    console.log('All projects:', projects);
    console.log('All artists:', artists);

    const currentDate = new Date();
    console.log('Current date:', currentDate);

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

    console.log('Artist bookings:', bookings);

    setArtistBookings(bookings);
    
    // Sort and get top 5 most booked artists
    const topArtists = [...bookings].sort((a, b) => b.bookings - a.bookings).slice(0, 5);
    console.log('Top 5 most booked artists:', topArtists);
    
    setMostBookedArtists(topArtists);
  }, [projects, artists, bookingPeriod]);

  const currentDate = new Date();
  console.log('Current date:', currentDate);

  const inProgressProjects = projects.filter(project => {
    try {
      const startDate = parseISO(project.startDate);
      const endDate = parseISO(project.endDate);
      console.log(`Project: ${project.name}, Start: ${startDate}, End: ${endDate}`);
      return isWithinInterval(currentDate, { start: startDate, end: endDate });
    } catch (error) {
      console.error(`Error processing project ${project.name}:`, error);
      return false;
    }
  });

  console.log('In progress projects:', inProgressProjects);

  const completedProjects = projects.filter(project => {
    try {
      return parseISO(project.endDate) < currentDate;
    } catch (error) {
      console.error(`Error processing completed project ${project.name}:`, error);
      return false;
    }
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBookingPeriodChange = (event) => {
    setBookingPeriod(event.target.value);
  };

  // Calculate project progress
  const calculateProgress = (project) => {
    try {
      const start = parseISO(project.startDate);
      const end = parseISO(project.endDate);
      const total = end.getTime() - start.getTime();
      const elapsed = currentDate.getTime() - start.getTime();
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    } catch (error) {
      console.error(`Error calculating progress for project ${project.name}:`, error);
      return 0;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: 240, borderRight: '1px solid #e0e0e0', p: 2 }}>
        <Typography variant="h6" gutterBottom>Navigation</Typography>
        <List>
          {['Overview', 'Projects', 'Artists', 'Reports'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Dashboard</Typography>
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
        </Box>

        {/* Overview cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { title: 'Total Projects', value: projects.length },
            { title: 'In Progress', value: inProgressProjects.length },
            { title: 'Completed', value: completedProjects.length },
            { title: 'Total Artists', value: artists.length },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{item.title}</Typography>
                  <Typography variant="h4">{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Projects section */}
        <Paper sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Tab label="Active Projects" />
            <Tab label="Completed Projects" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {(tabValue === 0 ? inProgressProjects : completedProjects).map((project, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ border: '1px solid #e0e0e0' }}>
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
                      <Typography variant="body2">Budget: ${project.budget}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Most booked artists */}
        <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
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
                    secondary={
                      <>
                        {`${artist.bookings} project${artist.bookings !== 1 ? 's' : ''}`}
                        {artist.projectNames.length > 0 && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}({artist.projectNames.join(', ')})
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < mostBookedArtists.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;

