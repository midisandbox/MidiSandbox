import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const spacingUnit = 4;
export const fontFamily = 'Lato';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#93f1ff',
    },
    secondary: {
      main: '#ffea90',
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
    fontFamily: fontFamily,
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
