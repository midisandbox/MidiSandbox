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
import { selectGlobalThemeMode } from './redux/slices/globalSettingsSlice';
import { useTypedSelector } from './redux/store';
import { getCustomTheme } from './styles/customTheme';
import useAuth from './utils/amplifyUtils';
import Login from './pages/Login';
import RouterAnalytics from './components/utilComponents/RouterAnalytics';
import Sandbox from './pages/Sandbox';

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
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
