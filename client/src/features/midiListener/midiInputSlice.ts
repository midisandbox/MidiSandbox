import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
// import { WebMidi } from 'webmidi/dist/webmidi.esm';
import { RootState } from '../../app/store';

export interface MidiInputData {
  connection: string;
  id: string;
  manufacturer: string;
  name: string;
  state: string;
  type: string;
  version: string;
}

const midiInputAdapter = createEntityAdapter<MidiInputData>({
  selectId: (input) => input.id,
});

const initialState = midiInputAdapter.getInitialState();

const midiInputSlice = createSlice({
  name: 'midiInputs',
  initialState,
  reducers: {
    upsertManyMidiInputs: midiInputAdapter.upsertMany,
  },
});

export const { upsertManyMidiInputs } = midiInputSlice.actions;

export const { selectAll: selectAllMidiInputs } =
  midiInputAdapter.getSelectors<RootState>((state) => state.midiInput);

export default midiInputSlice.reducer;

// TODO: normalize this data into different entities
const metadata = {
  input1: {
    channel1: {
      C0: {
        name: 'C',
        octave: 0,
        noteon: true,
        count: 0,
        attack: 0,
        release: 0,
        velocity: 0,
        timestamp: 0,
      },
      C1: {
        name: 'C',
        octave: 1,
        noteon: true,
        count: 0,
        attack: 0,
        release: 0,
        velocity: 0,
        timestamp: 0,
      },
    },
  },
};
