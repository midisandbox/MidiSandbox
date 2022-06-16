import React from 'react';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import App from './App';
import { store } from './app/store';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import './assets/fonts/GatterSans-Regular.otf';
import '@aws-amplify/ui-react/styles.css';
import './assets/styles/main.css';

Amplify.configure(awsExports);

function Root() {
  return (
    <React.StrictMode>
      <ReduxProvider store={store}>
        <App />
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
