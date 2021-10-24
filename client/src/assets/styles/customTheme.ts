import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const spacingUnit = 4;

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#93f1ff',
    },
    secondary: {
      main: '#ffe46e',
    },
    error: {
      main: '#f68be3',
    },
    background: {
      paper: '#292929',
      default: '#212121',
    },
  },
  typography: {
    fontFamily: 'Lato',
  },
  spacing: spacingUnit,
  shape: {
    borderRadius: 0,
  },
  custom: {
    spacingUnit: spacingUnit,
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      spacingUnit: number;
    };
  }
  interface ThemeOptions {
    custom?: {
      spacingUnit?: number;
    };
  }
}

theme = responsiveFontSizes(theme);

export { theme };
