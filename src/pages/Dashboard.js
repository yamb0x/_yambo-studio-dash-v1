import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Grid, Paper, Box, Tabs, Tab, TextField, Avatar, InputAdornment, Card, CardContent, LinearProgress, Divider, List, ListItem, ListItemText, ListItemAvatar, Select, MenuItem, FormControl, InputLabel, Collapse, IconButton, useTheme, keyframes } from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { format, isWithinInterval, parseISO, subMonths, subYears, isAfter, isBefore, startOfDay, endOfDay, addDays, isWeekend, addHours, subHours, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import Calculator from '../components/Calculator';
import CurrencyExchange from '../components/CurrencyExchange';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

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

  const nextDelivery = useMemo(() => {
    if (!project.deliveries || project.deliveries.length === 0) return null;
    const currentDate = new Date();
    return project.deliveries
      .filter(delivery => new Date(delivery.date) > currentDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [project.deliveries]);

  const getDeliveryColor = useCallback((deliveryDate) => {
    const daysUntilDelivery = differenceInDays(new Date(deliveryDate), new Date());
    if (daysUntilDelivery >= 7) return theme.palette.info.main; // Blue
    if (daysUntilDelivery <= 1) return theme.palette.error.main; // Red
    
    // Interpolate between blue and red
    const blueComponent = Math.round((daysUntilDelivery - 1) * 255 / 6);
    const redComponent = 255 - blueComponent;
    return `rgb(${redComponent}, 0, ${blueComponent})`;
  }, [theme]);

  return (
    <Card sx={{ 
      ...paperStyle, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: isDarkMode ? theme.palette.background.paper : 'white',
    }}>
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
        {nextDelivery && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              color: getDeliveryColor(nextDelivery.date),
              fontWeight: 'regular'
            }}
          >
            Next Delivery is "{nextDelivery.name}" at {format(parseISO(nextDelivery.date), 'MMM d, yyyy')}
          </Typography>
        )}
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
  console.log('Dashboard render');

  const { projects } = useProjects();
  const { artists } = useArtists();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute instead of every second
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('Current time changed:', currentTime);
  }, [currentTime]);

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
    return artists.filter(artist => {
      if (excludedArtists.includes(artist.name)) return false;

      for (const project of projects) {
        if (project.bookings) {
          for (const booking of project.bookings) {
            if (booking.artistId === artist.id) {
              const bookingStart = startOfDay(parseISO(booking.startDate));
              const bookingEnd = endOfDay(parseISO(booking.endDate));
              const isBooked = isWithinInterval(currentDate, { start: bookingStart, end: bookingEnd });
              if (isBooked) return true;
            }
          }
        }
      }
      return false;
    });
  }, [artists, projects, currentDate, excludedArtists]);

  const [tabValue, setTabValue] = useState(0);
  const [involvementPeriod, setInvolvementPeriod] = useState('all');
  const [mostInvolvedArtists, setMostInvolvedArtists] = useState([]);
  const [notes, setNotes] = useState('');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentlyBookedArtists, setCurrentlyBookedArtists] = useState([]);

  useEffect(() => {
    const bookedArtists = calculateCurrentlyBookedArtists();
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

  const isWorkingHours = (country) => {
    const artistTime = getArtistTime(country);
    const hours = artistTime.getHours();
    return hours >= 9 && hours < 18;
  };

  const getArtistTime = (country) => {
    const timeOffsetMap = {
      'USA': -4, // EDT (UTC-4)
      'UK': 1,   // BST (UTC+1)
      'Canada': -4, // EDT (UTC-4)
      'Australia': 10, // AEST (UTC+10)
      'Japan': 9, // JST (UTC+9)
      'Germany': 2, // CEST (UTC+2)
      'France': 2, // CEST (UTC+2)
      'Italy': 2, // CEST (UTC+2)
      'Spain': 2, // CEST (UTC+2)
      'Russia': 3, // MSK (UTC+3)
      'China': 8, // CST (UTC+8)
      'India': 5.5, // IST (UTC+5:30)
      'Brazil': -3, // BRT (UTC-3)
      'Mexico': -5, // CDT (UTC-5)
      'South Africa': 2, // SAST (UTC+2)
      'New Zealand': 12, // NZST (UTC+12)
      'Argentina': -3, // ART (UTC-3)
      'Sweden': 2, // CEST (UTC+2)
      'Netherlands': 2, // CEST (UTC+2)
      'Switzerland': 2, // CEST (UTC+2)
      'South Korea': 9, // KST (UTC+9)
      'Singapore': 8, // SGT (UTC+8)
      'Norway': 2, // CEST (UTC+2)
      'Denmark': 2, // CEST (UTC+2)
      'Finland': 3, // EEST (UTC+3)
      'Belgium': 2, // CEST (UTC+2)
      'Austria': 2, // CEST (UTC+2)
      'Portugal': 1, // WEST (UTC+1)
      'Greece': 3, // EEST (UTC+3)
      'Ireland': 1, // IST (UTC+1)
      'Poland': 2, // CEST (UTC+2)
      'Turkey': 3, // TRT (UTC+3)
      'Israel': 3, // IDT (UTC+3)
      'United Arab Emirates': 4, // GST (UTC+4)
      'Thailand': 7, // ICT (UTC+7)
      'Indonesia': 7, // WIB (UTC+7)
      'Malaysia': 8, // MYT (UTC+8)
      'Philippines': 8, // PHT (UTC+8)
      'Vietnam': 7, // ICT (UTC+7)
      'Saudi Arabia': 3, // AST (UTC+3)
      'Egypt': 2, // EET (UTC+2)
      'South Africa': 2, // SAST (UTC+2)
      'Nigeria': 1, // WAT (UTC+1)
      'Kenya': 3, // EAT (UTC+3)
      'Morocco': 1, // WEST (UTC+1)
      'Chile': -4, // CLT (UTC-4)
      'Colombia': -5, // COT (UTC-5)
      'Peru': -5, // PET (UTC-5)
      'Venezuela': -4, // VET (UTC-4)
    };

    const userOffset = -currentTime.getTimezoneOffset() / 60; // Convert to hours and invert
    const artistOffset = timeOffsetMap[country] || 0;
    const timeDifference = artistOffset - userOffset;

    const artistTime = addHours(currentTime, timeDifference);

    return artistTime;
  };

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

  // You can adjust these values to change the heights of the components
  const currentlyBookedArtistsHeight = '585px'; // Adjust this value
  const notesHeight = '585px'; // Adjust this value
  const currencyExchangeHeight = '150px'; // Adjust this value
  const calculatorHeight = '420px'; // Adjust this value

  const blinkAnimation = keyframes`
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  `;

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

        {/* Currently Booked Artists and Notes */}
        <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              ...paperStyle, 
              p: 2, 
              height: currentlyBookedArtistsHeight, 
              backgroundColor: isDarkMode ? theme.palette.background.paper : 'white', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <Typography variant="h6" gutterBottom>
                Currently Booked Artists ({format(currentDate, 'yyyy-MM-dd')})
              </Typography>
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {currentlyBookedArtists.map((artist) => {
                  const artistTime = getArtistTime(artist.country);
                  const workingHours = isWorkingHours(artist.country);
                  return (
                    <ListItem key={artist.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FiberManualRecordIcon
                          sx={{
                            color: workingHours ? 'green' : 'red',
                            mr: 2,
                            animation: workingHours ? `${blinkAnimation} 2s ease-in-out infinite` : 'none',
                          }}
                        />
                        <ListItemText primary={artist.name} />
                      </Box>
                      <Typography variant="body2">
                        {format(artistTime, 'HH:mm')} ({artist.country})
                      </Typography>
                    </ListItem>
                  );
                })}
              </List>
              {currentlyBookedArtists.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No artists currently booked
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={6}>
                <Paper sx={{ 
                  ...paperStyle, 
                  p: 2, 
                  height: notesHeight,
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
                  <Grid item>
                    <Paper sx={{ 
                      ...paperStyle, 
                      p: 2, 
                      height: currencyExchangeHeight, 
                      backgroundColor: isDarkMode ? theme.palette.background.paper : 'white' 
                    }}>
                      <CurrencyExchange />
                    </Paper>
                  </Grid>
                  <Grid item>
                    <Paper sx={{ 
                      ...paperStyle, 
                      p: 2, 
                      height: calculatorHeight,
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

