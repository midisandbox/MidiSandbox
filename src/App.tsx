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
import Home from './pages/Home';
import Sandbox from './pages/Sandbox';
import SearchDemo from './pages/SearchDemo';

const App = () => {
  const { gaUserId } = useAuth();
  const globalThemeMode = useTypedSelector(selectGlobalThemeMode);
  const theme = React.useMemo(
    () => responsiveFontSizes(createTheme(getCustomTheme(globalThemeMode))),
    [globalThemeMode]
  );

  useEffect(() => {
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

  // const sandboxElement = BROWSER_COMPATIBLE ? <Sandbox /> : <BrowserWarning />;

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
          <Route path="home-demo" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
