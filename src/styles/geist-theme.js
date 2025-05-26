// Geist Design System Theme Configuration
// Based on Vercel's Geist design system

export const geistColors = {
  // Background colors
  background: {
    100: '#FFFFFF', // Default background
    200: '#FAFAFA', // Secondary background
  },
  
  // Gray scale
  gray: {
    100: '#FAFAFA', // Component background
    200: '#F5F5F5', // Hover background
    300: '#EBEBEB', // Active background
    400: '#E1E1E1', // Default border
    500: '#C6C6C6', // Hover border
    600: '#A8A8A8', // Active border
    700: '#666666', // High contrast background
    800: '#444444', // Hover high contrast
    900: '#888888', // Secondary text/icons
    1000: '#000000', // Primary text/icons
  },
  
  // Dark theme colors
  dark: {
    background: {
      100: '#000000', // Default background
      200: '#0A0A0A', // Secondary background
    },
    gray: {
      100: '#0A0A0A', // Component background
      200: '#171717', // Hover background
      300: '#1A1A1A', // Active background
      400: '#262626', // Default border
      500: '#3A3A3A', // Hover border
      600: '#525252', // Active border
      700: '#A1A1A1', // High contrast background
      800: '#C5C5C5', // Hover high contrast
      900: '#888888', // Secondary text/icons
      1000: '#FFFFFF', // Primary text/icons
    },
  },
  
  // Accent colors
  blue: {
    light: '#0070F3',
    dark: '#0070F3',
  },
  green: {
    light: '#00D924',
    dark: '#00D924',
  },
  red: {
    light: '#E00',
    dark: '#E00',
  },
  amber: {
    light: '#F5A623',
    dark: '#F5A623',
  },
  purple: {
    light: '#7928CA',
    dark: '#7928CA',
  },
};

export const geistSpacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

export const geistRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const geistShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const geistTransitions = {
  all: 'all 0.2s ease',
  colors: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  transform: 'transform 0.2s ease',
  opacity: 'opacity 0.2s ease',
};

// Typography configuration
export const geistTypography = {
  fonts: {
    sans: '"Basis Grotesque Regular", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    light: '"Basis Grotesque Light", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Fira Mono", "Roboto Mono", "Courier New", monospace',
  },
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Component styles
export const geistComponents = {
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: geistRadius.md,
      fontWeight: geistTypography.weights.medium,
      transition: geistTransitions.all,
      cursor: 'pointer',
      border: '1px solid transparent',
      outline: 'none',
      userSelect: 'none',
    },
    sizes: {
      small: {
        height: '32px',
        padding: '0 12px',
        fontSize: geistTypography.sizes.sm,
      },
      medium: {
        height: '40px',
        padding: '0 16px',
        fontSize: geistTypography.sizes.base,
      },
      large: {
        height: '48px',
        padding: '0 24px',
        fontSize: geistTypography.sizes.lg,
      },
    },
    variants: {
      primary: {
        backgroundColor: geistColors.gray[1000],
        color: geistColors.background[100],
        '&:hover': {
          backgroundColor: geistColors.gray[800],
        },
      },
      secondary: {
        backgroundColor: 'transparent',
        color: geistColors.gray[1000],
        border: `1px solid ${geistColors.gray[400]}`,
        '&:hover': {
          backgroundColor: geistColors.gray[100],
          borderColor: geistColors.gray[500],
        },
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: geistColors.gray[900],
        '&:hover': {
          backgroundColor: geistColors.gray[100],
        },
      },
    },
  },
  card: {
    base: {
      backgroundColor: geistColors.background[100],
      border: `1px solid ${geistColors.gray[400]}`,
      borderRadius: geistRadius.lg,
      padding: geistSpacing[6],
      transition: geistTransitions.all,
    },
    hover: {
      borderColor: geistColors.gray[500],
      transform: 'translateY(-2px)',
      boxShadow: geistShadows.md,
    },
  },
  input: {
    base: {
      width: '100%',
      height: '40px',
      padding: `0 ${geistSpacing[3]}`,
      fontSize: geistTypography.sizes.base,
      backgroundColor: geistColors.background[100],
      border: `1px solid ${geistColors.gray[400]}`,
      borderRadius: geistRadius.md,
      transition: geistTransitions.colors,
      outline: 'none',
      '&:hover': {
        borderColor: geistColors.gray[500],
      },
      '&:focus': {
        borderColor: geistColors.gray[1000],
      },
    },
  },
};

// Create theme function
export const createGeistTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  const colors = isDark ? geistColors.dark : geistColors;
  
  return {
    mode,
    colors: {
      ...colors,
      primary: colors.gray[1000],
      secondary: colors.gray[900],
      border: colors.gray[400],
      borderHover: colors.gray[500],
      borderActive: colors.gray[600],
    },
    spacing: geistSpacing,
    radius: geistRadius,
    shadows: geistShadows,
    transitions: geistTransitions,
    typography: geistTypography,
    components: geistComponents,
  };
};

export default createGeistTheme;