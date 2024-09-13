import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap sx={{ width: '300px', flexShrink: 0 }}>
          Yambo Studio Dashboard
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/gantt">
            Gantt View
          </Button>
          <Button color="inherit" component={RouterLink} to="/database">
            Database View
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
