import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';

export interface MidiNoteType {
  id: string;
  inputId: string;
  channelId: string;
  name: string;
  accidental: string | undefined;
  identifier: string;
  octave: number;
  noteon: boolean;
  count: number;
  attack: number;
  release: number;
  velocity: number;
  timestamp: number;
}

const midiNoteAdapter = createEntityAdapter<MidiNoteType>({
  selectId: (note) => note.id,
});

const initialState = midiNoteAdapter.getInitialState();

const midiNoteSlice = createSlice({
  name: 'midiNotes',
  initialState,
  reducers: {
    upsertManyMidiNotes: midiNoteAdapter.upsertMany,
  },
  extraReducers: (builder) => {
    builder.addCase(addNewMidiInputs,(state, action) => {
      midiNoteAdapter.upsertMany(state, action.payload.notes);
    })
  }
});

export const { upsertManyMidiNotes } = midiNoteSlice.actions;

export const { selectAll: selectAllMidiNotes } =
midiNoteAdapter.getSelectors<RootState>((state) => state.midiNote);

export default midiNoteSlice.reducer;