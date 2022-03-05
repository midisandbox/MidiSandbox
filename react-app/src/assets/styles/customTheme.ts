import { PaletteMode, ThemeOptions } from '@mui/material';

const spacingUnit = 4;
export const fontFamily = 'Lato';
export const getCustomTheme = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode: mode,
    ...(mode === 'light' && {
      primary: {
        main: '#16e1ff',
      },
      secondary: {
        main: '#ffea90',
      },
      error: {
        main: '#ff6a6a',
      },
      background: {
        paper: '#ffffff',
        default: '#ebebeb',
      },
    }),
    ...(mode === 'dark' && {
      primary: {
        main: '#93f1ff',
      },
      secondary: {
        main: '#ffea90',
      },
      error: {
        main: '#ff6a6a',
      },
      background: {
        paper: '#292929',
        default: '#212121',
      },
    }),
  },
  custom: {
    ...(mode === 'light' && {
      spacingUnit: spacingUnit,
      loadingOverlayBackground: '#ffffff8a',
    }),
    ...(mode === 'dark' && {
      spacingUnit: spacingUnit,
      loadingOverlayBackground: '#4e4e4e94',
    }),
  },
  typography: {
    fontFamily: fontFamily,
  },
  spacing: spacingUnit,
  shape: {
    borderRadius: 0,
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '1em',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      spacingUnit: number;
      loadingOverlayBackground: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      spacingUnit?: number;
      loadingOverlayBackground?: string;
    };
  }
}
