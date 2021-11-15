import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import blockLayoutReducer from '../features/blockLayout/blockLayoutSlice';
import midiInputReducer from '../features/midiListener/midiInputSlice';
import midiChannelReducer from '../features/midiListener/midiChannelSlice';
import midiNoteReducer from '../features/midiListener/midiNoteSlice';
import modalContainerReducer from '../features/modalContainer/modalContainerSlice';
import drawerContainerReducer from '../features/drawerContainer/drawerContainerSlice';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: {
    midiBlock: midiBlockReducer,
    blockLayout: blockLayoutReducer,
    midiInput: midiInputReducer,
    midiChannel: midiChannelReducer,
    midiNote: midiNoteReducer,
    modalContainer: modalContainerReducer,
    drawerContainer: drawerContainerReducer,
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
