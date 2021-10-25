import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

export interface MidiWidgetData {
  id: string;
  midiBlockId: string;
}

const midiWidgetAdapter = createEntityAdapter<MidiWidgetData>({
  selectId: (block) => block.id,
});

const initialState = midiWidgetAdapter.getInitialState();

const midiWidgetSlice = createSlice({
  name: 'midiWidgets',
  initialState,
  reducers: {
    addMidiWidget: midiWidgetAdapter.addOne,
    updateManyMidiWidgets: midiWidgetAdapter.updateMany,
    upsertManyMidiWidgets: midiWidgetAdapter.upsertMany,
  },
});

export const { addMidiWidget, updateManyMidiWidgets, upsertManyMidiWidgets } =
  midiWidgetSlice.actions;

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
