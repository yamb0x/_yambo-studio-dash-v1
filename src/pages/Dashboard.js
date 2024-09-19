import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Grid, Paper, Box, Tabs, Tab, TextField, Avatar, InputAdornment, Card, CardContent, LinearProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Select, MenuItem, FormControl, InputLabel, Collapse, IconButton, useTheme } from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { format, isWithinInterval, parseISO, subMonths, subYears, isAfter, isBefore, startOfDay, endOfDay, addDays, isWeekend } from 'date-fns';
import { Link } from 'react-router-dom';
import Calculator from '../components/Calculator';
import CurrencyExchange from '../components/CurrencyExchange';

const paperStyle = {
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
  borderRadius: '4px'
};

function ProjectCard({ project, calculateProgress, calculateTotalCosts }) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const toggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const totalCosts = calculateTotalCosts(project);
  const additionalExpenses = project.additionalExpenses || 0;
  const totalExpenses = totalCosts + additionalExpenses;
  const profit = project.budget - totalExpenses;
  const isProfitable = profit >= 0;

  return (
    <Card sx={{ ...paperStyle, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
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
            backgroundColor: isDarkMode ? theme.palette.grey[800] : '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: isDarkMode ? theme.palette.primary.main : '#000000',
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
  const [involvementPeriod, setInvolvementPeriod] = useState('all');
  const [mostInvolvedArtists, setMostInvolvedArtists] = useState([]);
  const [notes, setNotes] = useState('');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentlyBookedArtists, setCurrentlyBookedArtists] = useState([]);

  const currentDate = useMemo(() => {
    const now = new Date();
    let validDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    while (validDate.getDay() === 0 || validDate.getDay() === 6) {
      validDate = addDays(validDate, 1);
    }
    return validDate;
  }, []);

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

  const excludedArtists = ['Yambo', 'Clem Shepherd'];

  const calculateCurrentlyBookedArtists = useCallback(() => {
    console.log('Calculating currently booked artists for:', format(currentDate, 'yyyy-MM-dd'));
    
    return artists.filter(artist => {
      if (excludedArtists.includes(artist.name)) return false;

      for (const project of projects) {
        if (project.bookings) {
          for (const booking of project.bookings) {
            if (booking.artistId === artist.id) {
              const bookingStart = startOfDay(parseISO(booking.startDate));
              const bookingEnd = endOfDay(parseISO(booking.endDate));
              const isBooked = isWithinInterval(currentDate, { start: bookingStart, end: bookingEnd });
              console.log(`Artist: ${artist.name}, Project: ${project.name}, Booking: ${format(bookingStart, 'yyyy-MM-dd')} to ${format(bookingEnd, 'yyyy-MM-dd')}, Is booked: ${isBooked}`);
              if (isBooked) return true;
            }
          }
        }
      }
      return false;
    });
  }, [artists, projects, currentDate, excludedArtists]);

  useEffect(() => {
    const bookedArtists = calculateCurrentlyBookedArtists();
    console.log('Booked artists:', bookedArtists.map(artist => artist.name));
    setCurrentlyBookedArtists(bookedArtists);

    const filterDate = {
      'past3Months': subMonths(currentDate, 3),
      'pastYear': subYears(currentDate, 1),
      'lastYear': subYears(currentDate, 1),
    };

    // Calculate artist involvement
    const artistInvolvement = artists
      .filter(artist => !excludedArtists.includes(artist.name))
      .map(artist => {
        const involvedProjects = projects.filter(project => {
          const projectStart = parseISO(project.startDate);
          const projectEnd = parseISO(project.endDate);
          
          if (involvementPeriod === 'all') {
            return project.bookings && project.bookings.some(booking => booking.artistId === artist.id);
          } else if (involvementPeriod === 'lastYear') {
            return project.bookings && 
                   project.bookings.some(booking => booking.artistId === artist.id) &&
                   isAfter(projectStart, filterDate.lastYear) &&
                   isBefore(projectEnd, currentDate);
          } else {
            return project.bookings && 
                   project.bookings.some(booking => booking.artistId === artist.id) &&
                   isAfter(projectEnd, filterDate[involvementPeriod]);
          }
        });

        return {
          ...artist,
          projectCount: involvedProjects.length,
          projectNames: involvedProjects.map(project => project.name)
        };
      });

    // Sort and get top 8 most involved artists
    const topArtists = [...artistInvolvement]
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 8);
    setMostInvolvedArtists(topArtists);

    // Load saved notes
    const savedNotes = localStorage.getItem('dashboardNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [projects, artists, currentDate, involvementPeriod, excludedArtists, calculateCurrentlyBookedArtists]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInvolvementPeriodChange = (event) => {
    setInvolvementPeriod(event.target.value);
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

  const renderProjectDeliveries = (project) => {
    if (!project.deliveries || project.deliveries.length === 0) {
      return <Typography>No deliveries scheduled</Typography>;
    }
    return (
      <List>
        {project.deliveries.map((delivery) => (
          <ListItem key={delivery.id}>
            <ListItemText primary={delivery.name} secondary={delivery.date} />
          </ListItem>
        ))}
      </List>
    );
  };

  const handleExportData = () => {
    const htmlContent = generateHTMLContent(projects, artists);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const generateHTMLContent = (projects, artists) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Management Dashboard Export</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          h1, h2 { color: #2c3e50; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Project Management Dashboard Export</h1>
        
        <h2>Projects</h2>
        <table>
          <tr>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Budget</th>
          </tr>
          ${projects.map(project => `
            <tr>
              <td>${project.name}</td>
              <td>${project.startDate}</td>
              <td>${project.endDate}</td>
              <td>$${project.budget.toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>

        <h2>Artists</h2>
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialty</th>
          </tr>
          ${artists.map(artist => `
            <tr>
              <td>${artist.name}</td>
              <td>${artist.email}</td>
              <td>${artist.specialty || 'N/A'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
  };

  // You can adjust this value to change the height of the Notes component
  const notesHeight = '100%'; // Changed from fixed pixel value to percentage

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: isDarkMode ? theme.palette.background.default : 'white' }}>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Overview cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
              <Typography variant="h6" gutterBottom>Total Projects</Typography>
              <Typography variant="h4">{projectStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
              <Typography variant="h6" gutterBottom>In Progress</Typography>
              <Typography variant="h4">{projectStats.inProgress}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
              <Typography variant="h6" gutterBottom>Completed</Typography>
              <Typography variant="h4">{projectStats.completed}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{projectStats.newLastQuarter} from last quarter
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ ...paperStyle, p: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
              <Typography variant="h6" gutterBottom>Total Artists</Typography>
              <Typography variant="h4">{artistStats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                +{artistStats.newLastQuarter} added in the last quarter
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Projects section */}
        <Paper sx={{ ...paperStyle, mb: 3, p: 2, backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
          <Typography variant="h6" gutterBottom>
            Projects
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTabs-indicator': {
                backgroundColor: isDarkMode ? theme.palette.primary.main : '#000000',
              },
            }}
          >
            <Tab 
              label="Active Projects" 
              sx={{ 
                color: theme.palette.text.primary,
                '&.Mui-selected': {
                  color: isDarkMode ? theme.palette.primary.main : '#000000',
                },
              }} 
            />
            <Tab 
              label="Completed Projects" 
              sx={{ 
                color: theme.palette.text.primary,
                '&.Mui-selected': {
                  color: isDarkMode ? theme.palette.primary.main : '#000000',
                },
              }} 
            />
            <Tab 
              label="Upcoming Projects" 
              sx={{ 
                color: theme.palette.text.primary,
                '&.Mui-selected': {
                  color: isDarkMode ? theme.palette.primary.main : '#000000',
                },
              }} 
            />
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

        {/* Most involved artists and Notes */}
        <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ ...paperStyle, p: 2, height: '100%', backgroundColor: isDarkMode ? theme.palette.background.paper : 'white', display: 'flex', flexDirection: 'column' }}>
              {/* Currently Booked Artists */}
              <Box sx={{ flex: '0 0 40%', overflow: 'auto', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Currently Booked Artists ({format(currentDate, 'yyyy-MM-dd')})
                </Typography>
                <List>
                  {currentlyBookedArtists.map((artist) => (
                    <ListItem key={artist.id}>
                      <ListItemAvatar>
                        <Avatar src={getArtistImage(artist.name)[0]} alt={artist.name}>
                          {artist.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={artist.name} />
                    </ListItem>
                  ))}
                </List>
                {currentlyBookedArtists.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No artists currently booked
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Most Involved Artists */}
              <Box sx={{ flex: '1 1 60%', overflow: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Most Involved Artists
                  </Typography>
                  <FormControl variant="outlined" size="small">
                    <Select
                      value={involvementPeriod}
                      onChange={handleInvolvementPeriodChange}
                      displayEmpty
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderRadius: 0,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDarkMode ? theme.palette.primary.main : '#000000',
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
                  {mostInvolvedArtists.map((artist, index) => (
                    <React.Fragment key={artist.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar src={getArtistImage(artist.name)[0]} alt={artist.name}>
                            {artist.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={artist.name} 
                          secondary={`${artist.projectCount} projects`} 
                        />
                      </ListItem>
                      {index < mostInvolvedArtists.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: theme.palette.divider }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={6}>
                <Paper sx={{ 
                  ...paperStyle, 
                  p: 2, 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' 
                }}>
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
                          borderColor: isDarkMode ? theme.palette.primary.main : '#000000',
                        },
                      },
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Grid container direction="column" spacing={2} sx={{ height: '100%' }}>
                  <Grid item xs={4}>
                    <Paper sx={{ ...paperStyle, p: 2, height: '100%', backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' }}>
                      <CurrencyExchange />
                    </Paper>
                  </Grid>
                  <Grid item xs={8}>
                    <Paper sx={{ 
                      ...paperStyle, 
                      p: 2, 
                      height: '100%',
                      backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' 
                    }}>
                      <Calculator />
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;

