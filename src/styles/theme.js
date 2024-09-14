import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
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
  typography: {
    fontFamily: '"Basis Grotesque Regular", sans-serif',
    h1: {
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    h2: {
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    h3: {
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    h4: {
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    h5: {
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    h6: {
      textTransform: 'uppercase',
      fontFamily: '"Basis Grotesque Light", sans-serif',
      fontWeight: 300,
    },
    body1: {
      fontFamily: '"Basis Grotesque Regular", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Basis Grotesque Regular", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Basis Grotesque Regular", sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Basis Grotesque Regular';
          src: url('/fonts/basis-grotesque-regular/web/pro/basis-grotesque-regular-pro.woff2') format('woff2'),
               url('/fonts/basis-grotesque-regular/web/pro/basis-grotesque-regular-pro.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'Basis Grotesque Light';
          src: url('/fonts/basis-grotesque-light/web/pro/basis-grotesque-light-pro.woff2') format('woff2'),
               url('/fonts/basis-grotesque-light/web/pro/basis-grotesque-light-pro.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `,
    },
  },
});

export default theme;
