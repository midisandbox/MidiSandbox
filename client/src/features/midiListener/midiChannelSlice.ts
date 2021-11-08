import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';
import { createSelector } from 'reselect';

export interface MidiChannelT {
  id: string;
  inputId: string;
  number: number;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: string[];
}

const midiChannelAdapter = createEntityAdapter<MidiChannelT>({
  selectId: (channel) => channel.id,
});

const initialState = midiChannelAdapter.getInitialState();

const midiChannelSlice = createSlice({
  name: 'midiChannels',
  initialState,
  reducers: {
    upsertManyMidiChannels: midiChannelAdapter.upsertMany,
  },
  extraReducers: (builder) => {
    builder.addCase(addNewMidiInputs,(state, action) => {
      midiChannelAdapter.upsertMany(state, action.payload.channels);
    })
  }
});

export const { upsertManyMidiChannels } = midiChannelSlice.actions;

export const { selectAll: selectAllMidiChannels } =
midiChannelAdapter.getSelectors<RootState>((state) => state.midiChannel);

export const selectChannelsByInputId = createSelector(
  [selectAllMidiChannels, (state: RootState, inputId: (undefined | null | string)) => inputId],
  (channels, inputId) => channels.filter((channel: MidiChannelT) => channel.inputId === inputId)
);

export default midiChannelSlice.reducer;