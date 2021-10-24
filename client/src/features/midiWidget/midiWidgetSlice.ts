import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';
import { UpdateLayoutPayload } from '../midiBlock/midiBlockSlice';

export interface MidiWidgetData {
  id: string;
  layout: Layout;
  midiBlockId: string;
}

const midiWidgetAdapter = createEntityAdapter<MidiWidgetData>({
  selectId: (block) => block.id,
});

const initialState = midiWidgetAdapter.getInitialState();

const midiWidgetSlice = createSlice({
  name: 'midiWidget',
  initialState,
  reducers: {
    addMidiWidget: midiWidgetAdapter.addOne,
    updateManyMidiWidgets: midiWidgetAdapter.updateMany,
    upsertManyMidiWidgets: midiWidgetAdapter.upsertMany,
    updateMidiWidgetsLayout: (
      state,
      action: PayloadAction<UpdateLayoutPayload>
    ) => {
      for (const key in action.payload) {
        const midiWidget = state.entities[key];
        if (midiWidget) {
          midiWidget.layout = JSON.parse(JSON.stringify(action.payload[key]));
        }
      }
    },
  },
});

export const {
  addMidiWidget,
  updateManyMidiWidgets,
  upsertManyMidiWidgets,
  updateMidiWidgetsLayout,
} = midiWidgetSlice.actions;

export const {
  selectAll: selectAllMidiWidgets,
  selectById: selectMidiWidgetById,
  selectEntities: selectMidiWidgetEntities,
} = midiWidgetAdapter.getSelectors<RootState>((state) => state.midiWidget);

export const selectWidgetsByBlockId = createSelector(
  [selectAllMidiWidgets, (state: RootState, blockId: string) => blockId],
  (midiWidgets, blockId) =>
    midiWidgets.filter(
      (midiWidget: MidiWidgetData) => midiWidget.midiBlockId === blockId
    )
);

export default midiWidgetSlice.reducer;
