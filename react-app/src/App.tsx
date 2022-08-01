import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { selectGlobalThemeMode } from './app/globalSettingsSlice';
import { useTypedSelector } from './app/store';
import { getCustomTheme } from './assets/styles/customTheme';
import useAuth from './features/userAuth/amplifyUtils';
import Login from './features/userAuth/Login';
import RouterAnalytics from './features/utilComponents/RouterAnalytics';
import SearchDemo from './features/utilComponents/SearchDemo';
import Sandbox from './pages/Sandbox';

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
          <Route path="/" element={<Navigate to="/play" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="play" element={<Sandbox />}>
            <Route path=":templateId" element={<Sandbox />} />
          </Route>
          <Route path="search-demo" element={<SearchDemo />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
