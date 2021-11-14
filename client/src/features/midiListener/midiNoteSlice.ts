import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';
import { createSelector } from 'reselect';
import { selectMidiBlockById } from '../midiBlock/midiBlockSlice';

export interface MidiNoteT{
  id: string;
  inputId: string;
  channelId: string;
  name: string;
  noteNumber: number;
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

export interface MidiNoteEvent {
  inputId: string;
  eventType: string;
  eventData: number[];
  channel: number;
  timestamp: number;
  velocity: number;
  attack: number;
  release: number;
}

const midiNoteAdapter = createEntityAdapter<MidiNoteT>({
  selectId: (note) => note.id,
});

const initialState = midiNoteAdapter.getInitialState();

const midiNoteSlice = createSlice({
  name: 'midiNotes',
  initialState,
  reducers: {
    upsertManyMidiNotes: midiNoteAdapter.upsertMany,
    updateManyMidiNotes: midiNoteAdapter.updateMany,
    updateMidiNote: midiNoteAdapter.updateOne,
    handleMidiNoteEvent(state, action: PayloadAction<MidiNoteEvent>) {
      const {
        inputId,
        eventType,
        eventData,
        channel,
        timestamp,
        velocity,
        attack,
        release,
      } = action.payload;
      const noteNumber = eventData[1];
      const existingNote =
        state.entities[`${inputId}__${channel}__${noteNumber}`];
      if (existingNote) {
        if (eventType === 'noteon') {
          existingNote.noteon = true;
          existingNote.count++;
        } else if (eventType === 'noteoff') {
          existingNote.noteon = false;
        }
        existingNote.timestamp = timestamp;
        existingNote.velocity = velocity;
        existingNote.attack = attack;
        existingNote.release = release;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNewMidiInputs, (state, action) => {
      midiNoteAdapter.upsertMany(state, action.payload.notes);
    });
  },
});

export const {
  upsertManyMidiNotes,
  updateManyMidiNotes,
  updateMidiNote,
  handleMidiNoteEvent,
} = midiNoteSlice.actions;

export const { selectAll: selectAllMidiNotes, selectById: selectMidiNoteById } =
  midiNoteAdapter.getSelectors<RootState>((state) => state.midiNote);

export const selectNotesByBlockId = createSelector(
  [
    selectAllMidiNotes,
    (state: RootState, blockId: string) => selectMidiBlockById(state, blockId),
  ],
  (notes, block) => {
    let noteData: { [key: string]: MidiNoteT } = {};
    if (block) {
      notes
        .filter(
          (note: MidiNoteT) =>
            note.inputId === block.inputId && note.channelId === block.channelId
        )
        .forEach((blockNote) => {
          noteData[blockNote.noteNumber] = blockNote;
        });
    }
    return noteData;
  }
);


const getMidiNote = (state: RootState, blockId: string, noteNum: number) => {
  const block = selectMidiBlockById(state, blockId);
  if (block){
    return selectMidiNoteById(state, `${block.channelId}__${noteNum}`)
  }
  return null;
}
export const selectNoteByBlockId = createSelector(
  [
    getMidiNote
  ],
  (note) => note
);

export default midiNoteSlice.reducer;
