import {
  Authenticator,
  ThemeProvider,
  Theme as AmplifyTheme,
  useTheme as useAmplifyTheme,
} from '@aws-amplify/ui-react';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import ms_background_2 from '../assets/imgs/ms_background_2.jpeg';

function Login() {
  const theme = useTheme();
  const { tokens } = useAmplifyTheme();
  const placeholderColor = '#cacaca';
  const primaryColorGradients = {
    '10': `${theme.palette.primary.main}3b`,
    '20': `${theme.palette.primary.main}4f`,
    '40': `${theme.palette.primary.main}63`,
    '60': `${theme.palette.primary.main}82`,
    '80': `${theme.palette.primary.main}a6`,
    '90': `${theme.palette.primary.main}c9`,
    '100': `${theme.palette.primary.main}`,
  };
  const amplifyTheme: AmplifyTheme = {
    name: 'Midi Sandbox Theme',
    tokens: {
      colors: {
        background: {
          primary: {
            value: theme.palette.background.default,
          },
          secondary: {
            value: theme.palette.background.paper,
          },
        },
        font: {
          interactive: {
            value: tokens.colors.white.value,
          },
        },
        brand: {
          primary: {
            '10': { value: primaryColorGradients['90'] },
            '80': { value: primaryColorGradients['80'] },
            '90': { value: primaryColorGradients['60'] },
            '100': { value: primaryColorGradients['60'] },
          },
        },
      },
      components: {
        heading: {
          color: { value: theme.palette.text.primary },
        },
        authenticator: {
          router: {
            boxShadow: { value: 'none' },
            borderStyle: { value: 'border: none' },
          },
        },
        text: {
          color: {
            value: theme.palette.text.primary,
          },
          error: {
            color: { value: theme.palette.error.main },
          },
        },
        button: {
          color: { value: primaryColorGradients['100'] },
          _hover: {
            color: { value: primaryColorGradients['80'] },
            backgroundColor: { value: 'transparent' },
            borderColor: { value: primaryColorGradients['80'] },
          },
          _focus: {
            color: { value: primaryColorGradients['100'] },
            backgroundColor: { value: 'transparent' },
          },
          _active: {
            color: { value: primaryColorGradients['100'] },
            backgroundColor: { value: 'transparent' },
          },
          link: {
            color: { value: primaryColorGradients['100'] },
            _hover: {
              color: { value: primaryColorGradients['80'] },
              backgroundColor: { value: 'transparent' },
            },
            _focus: {
              color: { value: primaryColorGradients['100'] },
              backgroundColor: { value: 'transparent' },
            },
            _active: {
              color: { value: primaryColorGradients['100'] },
              backgroundColor: { value: 'transparent' },
            },
          },
        },
        fieldcontrol: {
          color: { value: theme.palette.text.primary },
          borderColor: { value: placeholderColor },
        },
        tabs: {
          borderStyle: { value: 'border: none' },
          item: {
            color: { value: placeholderColor },
            borderColor: { value: 'transparent' },
            borderStyle: { value: 'border: none' },
            // borderWidth: { value: '0px' },
            _focus: {
              color: {
                value: theme.palette.primary.main,
              },
            },
            _hover: {
              color: {
                value: primaryColorGradients['80'],
              },
            },
            _active: {
              color: {
                value: theme.palette.primary.main,
              },
            },
          },
        },
      },
    },
  };
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${ms_background_2})`,
        backgroundSize: 'cover',
      }}
    >
      <ThemeProvider theme={amplifyTheme}>
        <Authenticator>{() => <Navigate to="/play" replace />}</Authenticator>
      </ThemeProvider>
    </Box>
  );
}

export default Login;
