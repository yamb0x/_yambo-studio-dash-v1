import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Studio Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/gantt">
          Gantt
        </Button>
        <Button color="inherit" component={Link} to="/database">
          Database
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
