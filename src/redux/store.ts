import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import blockLayoutReducer from './slices/blockLayoutSlice';
import drawerContainerReducer from '../features/drawerContainer/drawerContainerSlice';
import fileUploadReducer from './slices/fileUploadSlice';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import midiListenerReducer from '../features/midiListener/midiListenerSlice';
import modalContainerReducer from '../features/modalContainer/modalContainerSlice';
import notificationReducer from '../features/notification/notificationSlice';
import globalSettingsReducer from './slices/globalSettingsSlice';
import joyrideTourReducer from '../features/joyrideTour/joyrideTourSlice';
import userActivityReducer from './slices/userActivitySlice';
import { persistStore, persistReducer } from 'redux-persist';
import rootSaga from './sagas';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const rootReducer = combineReducers({
  midiBlock: midiBlockReducer,
  blockLayout: blockLayoutReducer,
  midiListener: midiListenerReducer,
  modalContainer: modalContainerReducer,
  drawerContainer: drawerContainerReducer,
  globalSettings: globalSettingsReducer,
  joyrideTour: joyrideTourReducer,
  userActivity: userActivityReducer,
  fileUpload: fileUploadReducer,
  notification: notificationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userActivity'], // only these slices will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(sagaMiddleware),
});
let persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

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
