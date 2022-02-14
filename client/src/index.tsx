import React from 'react';
import ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-resizable/css/styles.css';
import App from './App';
import { store } from './app/store';
import './assets/styles/main.css';
import { upsertManyBlockLayouts } from './features/blockLayout/blockLayoutSlice';
// features
import { upsertManyMidiBlocks } from './features/midiBlock/midiBlockSlice';
import { getNewMidiBlock } from './utils/helpers';

const testData = [1].map((x) => getNewMidiBlock());
const initMidiBlocks = testData.map((x) => x.midiBlock);
const initBlockLayouts = testData.map((x) => x.blockLayout);
store.dispatch(upsertManyMidiBlocks(initMidiBlocks));
store.dispatch(upsertManyBlockLayouts(initBlockLayouts));

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
