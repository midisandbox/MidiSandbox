import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';
import { handleMidiNoteEvent, handlePedalOffEvent } from './midiNoteSlice';
import { MidiNoteEvent, PedalOffEvent } from '../../app/sagas';
import { KeyData, getInitialKeyData, KeyOption } from '../../utils/helpers';
import {
  ChromaticNoteNumber,
  noteToKeyMap,
  chromaticNoteNumbers,
} from '../../utils/helpers';
import { Midi as TonalMidi, Chord as TonalChord } from "@tonaljs/tonal";

export interface MidiChannelT {
  id: string;
  inputId: string;
  number: number;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: string[];
  selectedKey: KeyOption;
  selectedKeyUsesSharps: boolean;
  keyData: KeyData;
  totalNoteCount: number;
  notesOn: number[];
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
    updateOneMidiChannel: midiChannelAdapter.updateOne,
    resetKeyData(state, action: PayloadAction<{ channelId: string }>) {
      const { channelId } = action.payload;
      const existingChannel = state.entities[channelId];
      if (existingChannel) {
        existingChannel.keyData = getInitialKeyData();
        existingChannel.totalNoteCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewMidiInputs, (state, action) => {
        midiChannelAdapter.upsertMany(state, action.payload.channels);
      })
      .addCase(
        handleMidiNoteEvent,
        (state, action: PayloadAction<MidiNoteEvent>) => {
          const { inputId, channel, eventType, eventData } = action.payload;
          const existingChannel = state.entities[`${inputId}__${channel}`];
          if (existingChannel) {
            const eventNoteNum = eventData[1];
            const chromaticNoteNum = (eventNoteNum % 12) as ChromaticNoteNumber;
            if (eventType === 'noteon') {
              // increment totalNoteCount
              existingChannel.totalNoteCount += 1;

              // add noteNum to notesOn in numerical order if it does not already exist in array
              let insertIndex = 0;
              for (let i = 0; i < existingChannel.notesOn.length; i++){
                const noteNumOn = existingChannel.notesOn[i];
                if(noteNumOn === eventNoteNum){
                  insertIndex = -1;
                  break;
                } else if(eventNoteNum > noteNumOn){
                  insertIndex = i+1;
                }
              }
              if(insertIndex > -1) existingChannel.notesOn.splice(insertIndex, 0, eventNoteNum);

              // update keyData
              noteToKeyMap[chromaticNoteNum].forEach((keyNum) => {
                if (existingChannel.keyData[keyNum]) {
                  existingChannel.keyData[keyNum].noteCount += 1;
                }
              });
            } else if (eventType === 'noteoff') {
              // update notesOn
              const noteIndex =
                existingChannel.notesOn.indexOf(eventNoteNum);
              if (noteIndex > -1) {
                existingChannel.notesOn.splice(noteIndex, 1);
              }
            }
          }
        }
      ).addCase(
        handlePedalOffEvent,
        (state, action: PayloadAction<PedalOffEvent>) => {
          const { inputId, channel, values } = action.payload;
          const existingChannel = state.entities[`${inputId}__${channel}`];
          if (existingChannel) {
            // remove all notes from channel.notesOn if they are no longer on after pedal release
            existingChannel.notesOn = existingChannel.notesOn.filter(noteNum => values[noteNum])
          }
      });
  },
});

export const { upsertManyMidiChannels, resetKeyData, updateOneMidiChannel } =
  midiChannelSlice.actions;

export const { selectAll: selectAllMidiChannels } =
  midiChannelAdapter.getSelectors<RootState>((state) => state.midiChannel);

const getChannelKeyDataById = (
  state: RootState,
  channelId: string
): null | KeyData => {
  const channel = state.midiChannel.entities[channelId];
  if (channel) return channel.keyData;
  return null;
};
const getChannelTotalNoteCountById = (
  state: RootState,
  channelId: string
): number => {
  const channel = state.midiChannel.entities[channelId];
  if (channel) return channel.totalNoteCount;
  return 0;
};
// return an array of 12 floats between 0-1 (where each index represents a key, 0 = C, 1 = C#, ...)
// indicating the percentage of notes played found in each key
export const selectKeyPrevalenceById = createSelector(
  [getChannelKeyDataById, getChannelTotalNoteCountById],
  (keyData, totalNoteCount) => {
    return chromaticNoteNumbers.map((chromaticNum) => {
      if (keyData && totalNoteCount > 0) {
        return keyData[chromaticNum].noteCount / totalNoteCount;
      }
      return 1;
    });
  }
);

export const selectChannelKey = createSelector(
  [
    (state: RootState, channelId: string) => {
      const channel = state.midiChannel.entities[channelId];
      if (channel) return channel.selectedKey;
      return 'C';
    },
  ],
  (key) => key
);

export const selectChordEstimate = createSelector(
  [
    (state: RootState, channelId: string): string => {
      const channel = state.midiChannel.entities[channelId];
      if(channel){
        // use tonaljs to estimated chords
        const estimatedChords = TonalChord.detect(channel.notesOn.map(noteNum => TonalMidi.midiToNoteName(noteNum, { sharps: channel.selectedKeyUsesSharps })));
        return estimatedChords.join('__');
      }
      return '';
    },
  ],
  (chords) => chords
);

export default midiChannelSlice.reducer;
