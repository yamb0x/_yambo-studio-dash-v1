import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function Header({ toggleDarkMode, isDarkMode }) {
  const theme = useTheme();

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
