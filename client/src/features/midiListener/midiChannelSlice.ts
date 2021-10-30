import { createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';

export interface MidiChannelType {
  id: EntityId;
  inputId: EntityId;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: EntityId[];
}

const midiChannelAdapter = createEntityAdapter<MidiChannelType>({
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

export default midiChannelSlice.reducer;