import { createEntityAdapter, createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MidiChannelType } from './midiChannelSlice';
import { MidiNoteType } from './midiNoteSlice';

export interface MidiInputType {
  id: string;
  manufacturer: string;
  name: string;
  eventsSuspended: boolean;
  octaveOffset: number;
  connection: string;
  state: string;
  type: string;
  version: string;
  channelIds: EntityId[];
}

export interface AddNewMidiInputsPayload {
  inputs: MidiInputType[];
  channels: MidiChannelType[];
  notes: MidiNoteType[];
}

const midiInputAdapter = createEntityAdapter<MidiInputType>({
  selectId: (input) => input.id,
});

const initialState = midiInputAdapter.getInitialState();

const midiInputSlice = createSlice({
  name: 'midiInputs',
  initialState,
  reducers: {
    addNewMidiInputs: (state, action: PayloadAction<AddNewMidiInputsPayload>) => {
      midiInputAdapter.upsertMany(state, action.payload.inputs);
    },
  },
});

export const { addNewMidiInputs } = midiInputSlice.actions;

export const { selectAll: selectAllMidiInputs } =
  midiInputAdapter.getSelectors<RootState>((state) => state.midiInput);

export default midiInputSlice.reducer;

