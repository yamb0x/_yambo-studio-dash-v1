import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'baseline', marginRight: 'auto' }}>
          <Typography variant="h6" component="div">
            YAMBO STUDIO
          </Typography>
          <Typography 
            variant="subtitle2" 
            component="div" 
            sx={{ 
              marginLeft: 2, 
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
      </Toolbar>
    </AppBar>
  );
}

export default Header;
