import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function Header({ toggleDarkMode, isDarkMode }) {
  const theme = useTheme();
  const { logout } = useAuth(); // Get the logout function from AuthContext

  const handleLogout = async () => {
    try {
      await logout();
      // You might want to redirect to the login page or refresh the app state here
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{
        borderBottom: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'baseline', marginRight: 'auto' }}>
          <Typography variant="h6" component="div">
            YAMBO STUDIO
          </Typography>
          <Typography 
            variant="subtitle2" 
            component="div" 
            sx={{ 
              marginLeft: 1, 
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            dashboard v1.2.6
          </Typography>
          <Typography 
            variant="subtitle2" 
            component="button" 
            onClick={handleLogout}
            sx={{ 
              marginLeft: 2, 
              color: isDarkMode ? 'white' : 'text.secondary',
              fontSize: '0.8rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Log out
          </Typography>
        </Box>
        <Button color="inherit" component={RouterLink} to="/">
          Dashboard
        </Button>
        <Button color="inherit" component={RouterLink} to="/gantt">
          Gantt
        </Button>
        <Button color="inherit" component={RouterLink} to="/database">
          Database
        </Button>
        <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
