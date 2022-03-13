import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import createSagaMiddleware from 'redux-saga';
import blockLayoutReducer, {
  setAllBlockLayouts,
} from '../features/blockLayout/blockLayoutSlice';
import blockTemplateReducer from '../features/blockTemplate/blockTemplateSlice';
import drawerContainerReducer from '../features/drawerContainer/drawerContainerSlice';
import midiBlockReducer, {
  setAllMidiBlocks,
  setDefaultInputChannel,
} from '../features/midiBlock/midiBlockSlice';
import midiListenerReducer from '../features/midiListener/midiListenerSlice';
import modalContainerReducer from '../features/modalContainer/modalContainerSlice';
import { getNewMidiBlock } from '../utils/helpers';
import globalSettingsReducer, {
  setAllGlobalSettings,
} from './globalSettingsSlice';
import rootSaga from './sagas';
import { apiSlice } from '../features/api/apiSlice';

const reducers = combineReducers({
  midiBlock: midiBlockReducer,
  blockLayout: blockLayoutReducer,
  blockTemplate: blockTemplateReducer,
  midiListener: midiListenerReducer,
  modalContainer: modalContainerReducer,
  drawerContainer: drawerContainerReducer,
  globalSettings: globalSettingsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['blockTemplate', 'drawerContainer'],
  },
  reducers
);

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
      .concat(sagaMiddleware)
      .concat(apiSlice.middleware),
});

sagaMiddleware.run(rootSaga);

const persistor = persistStore(store, {}, () => {
  const storeState = store.getState();
  const activeTemplate =
    storeState.blockTemplate.entities[
      storeState.blockTemplate.activeTemplateId
    ];
  if (activeTemplate) {
    store.dispatch(setAllMidiBlocks(activeTemplate.midiBlocks));
    store.dispatch(setAllBlockLayouts(activeTemplate.blockLayout));
    store.dispatch(setAllGlobalSettings(activeTemplate.globalSettings));
    store.dispatch(
      setDefaultInputChannel({
        defaultInputId: activeTemplate.defaultInputId,
        defaultChannelId: activeTemplate.defaultChannelId,
      })
    );
  } else {
    const testData = [1].map((x) => getNewMidiBlock());
    const initMidiBlocks = testData.map((x) => x.midiBlock);
    const initBlockLayouts = testData.map((x) => x.blockLayout);
    store.dispatch(setAllMidiBlocks(initMidiBlocks));
    store.dispatch(setAllBlockLayouts(initBlockLayouts));
  }
});

export { store, persistor };

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
