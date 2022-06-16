import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { apiSlice } from '../features/api/apiSlice';
import blockLayoutReducer from '../features/blockLayout/blockLayoutSlice';
import drawerContainerReducer from '../features/drawerContainer/drawerContainerSlice';
import fileUploadReducer from '../features/fileUpload/fileUploadSlice';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import midiListenerReducer from '../features/midiListener/midiListenerSlice';
import modalContainerReducer from '../features/modalContainer/modalContainerSlice';
import notificationReducer from '../features/notification/notificationSlice';
import globalSettingsReducer from './globalSettingsSlice';
import rootSaga from './sagas';

const rootReducer = combineReducers({
  midiBlock: midiBlockReducer,
  blockLayout: blockLayoutReducer,
  midiListener: midiListenerReducer,
  modalContainer: modalContainerReducer,
  drawerContainer: drawerContainerReducer,
  globalSettings: globalSettingsReducer,
  fileUpload: fileUploadReducer,
  notification: notificationReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
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

export { store };

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
