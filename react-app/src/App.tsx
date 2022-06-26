import { createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { selectGlobalThemeMode } from './app/globalSettingsSlice';
import { useTypedSelector } from './app/store';
import { getCustomTheme } from './assets/styles/customTheme';
import Login from './features/userAuth/Login';
import Home from './pages/Home';
import Sandbox from './pages/Sandbox';

const App = () => {
  const globalThemeMode = useTypedSelector(selectGlobalThemeMode);
  const theme = React.useMemo(
    () => responsiveFontSizes(createTheme(getCustomTheme(globalThemeMode))),
    [globalThemeMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/play/:templateId?" component={Sandbox} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

export default App;
