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
      main: '#b6ddba',
    },
    secondary: {
      main: '#ffe7c8',
    },
    error: {
      main: '#ff6a6a',
    },
    background: {
      paper: '#fff',
      default: '#faf9f8',
    },
    text: {
      primary: '#262626',
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
      main: '#b6ddba',
    },
    secondary: {
      main: '#ffe7c8',
    },
    error: {
      main: '#ff6a6a',
    },
    background: {
      paper: '#1e1e1e',
      default: '#181717',
    },
    text: {
      primary: '#fffce7',
      // secondary: TODO,
      // disabled: TODO,
      // hint: TODO,
    },
    divider: '#3b3b3b',
  },
};
