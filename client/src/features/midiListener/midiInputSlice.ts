import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MidiChannelT } from './midiChannelSlice';
import { MidiNoteT } from './midiNoteSlice';

export interface MidiInputT {
  id: string;
  manufacturer: string;
  name: string;
  eventsSuspended: boolean;
  octaveOffset: number;
  connection: string;
  state: string;
  type: string;
  version: string;
  channelIds: string[];
}

export interface AddNewMidiInputsPayload {
  inputs: MidiInputT[];
  channels: MidiChannelT[];
  notes: MidiNoteT[];
}

const midiInputAdapter = createEntityAdapter<MidiInputT>({
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

export const { selectAll: selectAllMidiInputs, selectEntities: selectMidiInputEntities } =
  midiInputAdapter.getSelectors<RootState>((state) => state.midiInput);

export default midiInputSlice.reducer;

