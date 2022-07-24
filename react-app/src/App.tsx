import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { selectGlobalThemeMode } from './app/globalSettingsSlice';
import { useTypedSelector } from './app/store';
import { getCustomTheme } from './assets/styles/customTheme';
import Login from './features/userAuth/Login';
import RouterAnalytics from './features/utilComponents/RouterAnalytics';
import Home from './pages/Home';
import Sandbox from './pages/Sandbox';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import useAuth from './features/userAuth/amplifyUtils';

const App = () => {
  const { gaUserId } = useAuth();
  const globalThemeMode = useTypedSelector(selectGlobalThemeMode);
  const theme = React.useMemo(
    () => responsiveFontSizes(createTheme(getCustomTheme(globalThemeMode))),
    [globalThemeMode]
  );

  useEffect(() => {
    console.log('gaUserId: ', gaUserId);
    ReactGA.initialize([
      {
        trackingId: 'G-MWHCMGX96T',
        gaOptions: {
          userId: gaUserId,
        },
        // gtagOptions: {},
      },
    ]);
  }, [gaUserId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <RouterAnalytics />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="play" element={<Sandbox />}>
            <Route path=":templateId" element={<Sandbox />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
