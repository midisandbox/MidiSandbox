import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import midiWidgetReducer from '../features/midiWidget/midiWidgetSlice';
import blockLayoutReducer from '../features/blockLayout/blockLayoutSlice';
import widgetLayoutReducer from '../features/widgetLayout/widgetLayoutSlice';
import midiInputReducer from '../features/midiListener/midiInputSlice';
import midiChannelReducer from '../features/midiListener/midiChannelSlice';
import midiNoteReducer from '../features/midiListener/midiNoteSlice';
import {MidiListener} from '../features/midiListener/midiListener';

const store = configureStore({
  reducer: {
    midiBlock: midiBlockReducer,
    midiWidget: midiWidgetReducer,
    blockLayout: blockLayoutReducer,
    widgetLayout: widgetLayoutReducer,
    midiInput: midiInputReducer,
    midiChannel: midiChannelReducer,
    midiNote: midiNoteReducer,
  },
});

const midiListener = new MidiListener(store.dispatch, store.getState);
midiListener.initialize();

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
