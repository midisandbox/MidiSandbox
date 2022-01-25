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
    lightBackground: '#ffffff',
    lightText: '#000000',
    darkBackground: '#292929',
    darkText: '#ffffff',
    darkSubText: '#ffffffb3',
  },
  components: {
    // Name of the component
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0,
          marginRight: spacingUnit * 2,
        },
      },
    },
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      spacingUnit: number;
      lightBackground: string;
      lightText: string;
      darkBackground: string;
      darkText: string;
      darkSubText: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      spacingUnit?: number;
      lightBackground?: string;
      lightText?: string;
      darkBackground?: string;
      darkText?: string;
      darkSubText?: string;
    };
  }
}

theme = responsiveFontSizes(theme);

export { theme };
