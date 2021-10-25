import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import midiBlockReducer from '../features/midiBlock/midiBlockSlice';
import midiWidgetReducer from '../features/midiWidget/midiWidgetSlice';
import blockLayoutReducer from '../features/blockLayout/blockLayoutSlice';
import widgetLayoutReducer from '../features/widgetLayout/widgetLayoutSlice';

export const store = configureStore({
  reducer: {
    midiBlock: midiBlockReducer,
    midiWidget: midiWidgetReducer,
    blockLayout: blockLayoutReducer,
    widgetLayout: widgetLayoutReducer,
  },
});

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
