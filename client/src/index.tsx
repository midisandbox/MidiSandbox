import React from 'react';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import { persistor, store } from './app/store';
import './assets/styles/main.css';

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

// replace console.* to disable logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

ReactDOM.render(<Root />, document.getElementById('root'));
