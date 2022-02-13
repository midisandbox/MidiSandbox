import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import blockLayoutReducer from '../features/blockLayout/blockLayoutSlice';
import blockTemplateReducer from '../features/blockTemplate/blockTemplateSlice';
import midiListenerReducer from '../features/midiListener/midiListenerSlice';
import modalContainerReducer from '../features/modalContainer/modalContainerSlice';
import drawerContainerReducer from '../features/drawerContainer/drawerContainerSlice';
import globalSettingsReducer from './globalSettingsSlice';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: {
    midiBlock: midiBlockReducer,
    blockLayout: blockLayoutReducer,
    blockTemplate: blockTemplateReducer,
    midiListener: midiListenerReducer,
    modalContainer: modalContainerReducer,
    drawerContainer: drawerContainerReducer,
    globalSettings: globalSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
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
