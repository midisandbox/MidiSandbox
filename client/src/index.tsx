import React from 'react';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import App from './App';
import { store } from './app/store';
import { getTestData } from './app/testData';
import './assets/styles/main.css';
import { upsertManyBlockLayouts } from './features/blockLayout/blockLayoutSlice';
// features
import { upsertManyMidiBlocks } from './features/midiBlock/midiBlockSlice';


const testData = getTestData(6);
store.dispatch(upsertManyMidiBlocks(testData.midiBlocks));
store.dispatch(upsertManyBlockLayouts(testData.blockLayouts));

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
