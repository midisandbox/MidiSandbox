import {
  Authenticator,
  ThemeProvider,
  Theme as AmplifyTheme,
  useTheme as useAmplifyTheme,
} from '@aws-amplify/ui-react';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';

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
            value: 'transparent',
          },
          secondary: {
            value: 'transparent',
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
        background:
          'linear-gradient(45deg, #1B292C 0%, rgba(225, 5, 34, 0) 70%) repeat scroll 0% 0%, linear-gradient(135deg, #222E2D 10%, rgba(49, 5, 209, 0) 80%) repeat scroll 0% 0%, linear-gradient(225deg, #2F2E23 10%, rgba(10, 219, 216, 0) 80%) repeat scroll 0% 0%, rgba(0, 0, 0, 0) linear-gradient(315deg, #332A38 100%, rgba(9, 245, 5, 0) 70%) repeat scroll 0% 0%',
      }}
    >
      <ThemeProvider theme={amplifyTheme}>
        <Authenticator>{() => <Redirect to="/play" />}</Authenticator>
      </ThemeProvider>
    </Box>
  );
}

export default Login;
