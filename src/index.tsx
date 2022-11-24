import React from 'react';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import App from './App';
import { persistor, store } from './redux/store';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { PersistGate } from 'redux-persist/integration/react';

import '@aws-amplify/ui-react/styles.css';
import './styles/main.css';

Amplify.configure(awsExports);

function Root() {
  return (
    <React.StrictMode>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </ReduxProvider>
    </React.StrictMode>
  );
}

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

ReactDOM.render(<Root />, document.getElementById('root'));
