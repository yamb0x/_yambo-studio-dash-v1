import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
    },
    action: {
      active: '#000000',
      hover: '#e0e0e0',
    },
  },
  // ... rest of the existing theme configuration
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: '#8a8a8a',
    },
    action: {
      active: '#ffffff',
      hover: '#1f1f1f',
    },
  },
  // ... rest of the existing theme configuration (typography, etc.)
});

export { lightTheme, darkTheme };
