import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { store } from './app/store';
import { theme } from './assets/styles/customTheme';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './assets/styles/main.css';
// features
import { upsertManyMidiBlocks } from './features/midiBlock/midiBlockSlice';
import { upsertManyBlockLayouts } from './features/blockLayout/blockLayoutSlice';
import App from './App';

import { getTestData } from './app/testData';

const testData = getTestData(6);
store.dispatch(upsertManyMidiBlocks(testData.midiBlocks));
store.dispatch(upsertManyBlockLayouts(testData.blockLayouts));

function Root() {
  return (
    <React.StrictMode>
      <ReduxProvider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Switch>
              <Route path="/" component={App} />
            </Switch>
          </Router>
        </ThemeProvider>
      </ReduxProvider>
    </React.StrictMode>
  );
}

// replace console.* to disable logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

ReactDOM.render(<Root />, document.getElementById('root'));
