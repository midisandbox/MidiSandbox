import { PaletteMode, ThemeOptions } from '@mui/material';

const spacingUnit = 4;
export const fontFamily = 'Inter';
export const getCustomTheme = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode: mode,
    ...(mode === 'light' && lightOne.palette),
    ...(mode === 'dark' && darkTwo.palette),
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
    allVariants: {
      color:
        mode === 'light'
          ? lightOne.palette.text.primary
          : darkTwo.palette.text.primary,
    },
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
      styleOverrides: {
        select: {
          background: 'transparent',
        },
      },
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        variant: 'standard',
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

const lightOne = {
  palette: {
    primary: {
      main: '#3CA191',
    },
    secondary: {
      main: '#8744C9',
    },
    error: {
      main: '#ff6a6a',
    },
    background: {
      paper: '#fff',
      default: '#faf9f8',
    },
    text: {
      primary: '#0C0C0C',
      // secondary: TODO,
      // disabled: TODO,
      // hint: TODO,
    },
    divider: '#484848',
  },
};

// https://colorhunt.co/palette/f7f4e3d2e1c8fee4a6f9c4aa
// https://colorhunt.co/palette/cee5d0f3f0d7fed2aaffbf86
// https://colorhunt.co/palette/fef5edd3e4cdadc2a999a799
const darkTwo = {
  palette: {
    primary: {
      main: '#3CA191',
    },
    secondary: {
      main: '#9982DA',
    },
    error: {
      main: '#CB3D2F',
    },
    background: {
      paper: '#141414',
      default: '#070707',
    },
    text: {
      primary: '#ffffff',
      // secondary: TODO,
      // disabled: TODO,
      // hint: TODO,
    },
    divider: '#2c2c2c',
  },
};
