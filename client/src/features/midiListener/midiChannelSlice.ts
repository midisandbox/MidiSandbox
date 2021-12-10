import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';
import { addNewMidiInputs } from './midiInputSlice';
import { handleMidiNoteEvent } from './midiNoteSlice';
import { MidiNoteEvent } from '../../app/sagas';
import { KeyData, getInitialKeyData } from '../../utils/helpers';
import {
  ChromaticNoteNumber,
  noteToKeyMap,
  chromaticNoteNumbers,
} from '../../utils/helpers';

export interface MidiChannelT {
  id: string;
  inputId: string;
  number: number;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: string[];
  keyData: KeyData;
  totalNoteCount: number;
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
    resetKeyData(state, action: PayloadAction<{channelId: string}>) {
      const {channelId} = action.payload;
      const existingChannel = state.entities[channelId];
      if(existingChannel){
        existingChannel.keyData = getInitialKeyData();
        existingChannel.totalNoteCount = 0;
      }
    }
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
          if (eventType === 'noteon' && existingChannel) {
            const chromaticNoteNum = (eventData[1] % 12) as ChromaticNoteNumber;
            existingChannel.totalNoteCount += 1;
            noteToKeyMap[chromaticNoteNum].forEach((keyNum) => {
              if (existingChannel.keyData[keyNum]) {
                existingChannel.keyData[keyNum].noteCount += 1;
              }
            });
          }
        }
      );
  },
});

export const { upsertManyMidiChannels, resetKeyData } = midiChannelSlice.actions;

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

export default midiChannelSlice.reducer;
