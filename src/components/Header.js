import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Studio Dashboard
        </Typography>
        <Box>
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
