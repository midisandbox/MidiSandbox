import { PaletteMode, ThemeOptions } from '@mui/material';

const spacingUnit = 4;
export const fontFamily = 'Lato';
export const getCustomTheme = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode: mode,
    ...(mode === 'light' && lightOne),
    ...(mode === 'dark' && darkTwo),
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
    MuiSelect: {
      defaultProps: {
        variant: 'standard'
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard'
      }
    },
    MuiInputLabel: {
      defaultProps: {
        variant: 'standard'
      }
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


const lightOne = {
  primary: {
    main: '#ADC2A9',
  },
  secondary: {
    main: '#c19174',
  },
  error: {
    main: '#ff6a6a',
  },
  background: {
    paper: '#fff',
    default: '#faf9f8',
  },
}

// https://colorhunt.co/palette/f7f4e3d2e1c8fee4a6f9c4aa
// https://colorhunt.co/palette/cee5d0f3f0d7fed2aaffbf86
// https://colorhunt.co/palette/fef5edd3e4cdadc2a999a799
const darkTwo = {
  primary: {
    main: '#b6ddba',
  },
  secondary: {
    main: '#ffd9c7',
  },
  error: {
    main: '#ff6a6a',
  },
  background: {
    paper: '#212121',
    default: '#181717',
  },
}