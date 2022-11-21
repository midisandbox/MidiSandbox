import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import {
  chromaticNoteToMajorKeyMap,
  chromaticNoteNumbers,
} from '../../utils/utils';
import { MidiNoteEvent, PedalEvent } from '../../app/sagas';
import { Midi as TonalMidi, Chord as TonalChord } from '@tonaljs/tonal';
import { addUniqueNumToSortedArr } from '../../utils/utils';
import { defaultChromaticNoteData, getInitialKeyData } from './webMidiUtils';

const midiInputAdapter = createEntityAdapter<MidiInputT>({
  selectId: (input) => input.id,
});
const midiChannelAdapter = createEntityAdapter<MidiChannelT>({
  selectId: (channel) => channel.id,
});
const midiNoteAdapter = createEntityAdapter<MidiNoteT>({
  selectId: (note) => note.id,
});

const initialState = {
  inputs: midiInputAdapter.getInitialState(),
  channels: midiChannelAdapter.getInitialState(),
  notes: midiNoteAdapter.getInitialState(),
  initialInputsLoaded: false,
};

const midiListenerSlice = createSlice({
  name: 'midiListener',
  initialState,
  reducers: {
    addNewMidiInputs: (
      state,
      action: PayloadAction<AddNewMidiInputsPayload>
    ) => {
      midiInputAdapter.upsertMany(state.inputs, action.payload.inputs);
      midiChannelAdapter.upsertMany(state.channels, action.payload.channels);
      midiNoteAdapter.upsertMany(state.notes, action.payload.notes);
      state.initialInputsLoaded = true;
    },
    deleteMidiInputs: (state, action: PayloadAction<string[]>) => {
      // remove all inputs/channels/notes related to given input IDs
      const removeInputIds = action.payload;
      midiInputAdapter.removeMany(state.inputs, removeInputIds);
      midiChannelAdapter.removeMany(
        state.channels,
        state.channels.ids.filter((channelId) => {
          for (const inputId of removeInputIds) {
            if ((channelId as string).includes(inputId)) return true;
          }
          return false;
        })
      );
      midiNoteAdapter.removeMany(
        state.notes,
        state.notes.ids.filter((noteId) => {
          for (const inputId of removeInputIds) {
            if ((noteId as string).includes(inputId)) return true;
          }
          return false;
        })
      );
    },
    // channel reducers
    updateOneMidiChannel: (
      state,
      action: PayloadAction<Update<MidiChannelT>>
    ) => {
      midiChannelAdapter.updateOne(state.channels, action.payload);
    },
    resetKeyData(state, action: PayloadAction<{ channelId: string }>) {
      const { channelId } = action.payload;
      const existingChannel = state.channels.entities[channelId];
      if (existingChannel) {
        existingChannel.keyData = getInitialKeyData();
        existingChannel.totalNoteCount = 0;
      }
    },
    // input reducers
    updateOneMidiInput: (state, action: PayloadAction<Update<MidiInputT>>) => {
      midiInputAdapter.updateOne(state.inputs, action.payload);
    },
    handleMidiNoteEvent(state, action: PayloadAction<MidiNoteEvent>) {
      let noteEvents: MidiNoteEvent[] = [];
      // handle this special eventType by turning off all active notes for the given input/channel
      if (action.payload.eventType === 'TURN_OFF_ACTIVE_NOTES') {
        const targetChannel =
          state.channels.entities[
            `${action.payload.inputId}__${action.payload.channel}`
          ];
        if (targetChannel) {
          targetChannel.notesOn.forEach((note) =>
            noteEvents.push({
              eventHandler: 'note',
              inputId: targetChannel.inputId,
              eventType: 'noteoff',
              eventData: [0, note, 0],
              channel: targetChannel.number,
              timestamp: 0,
              velocity: 0,
              attack: 0,
              release: 0,
            })
          );
        }
      } else {
        noteEvents = [action.payload];
      }
      for (const noteEvent of noteEvents) {
        const {
          inputId,
          eventType,
          eventData,
          channel,
          timestamp,
          velocity,
          attack,
          release,
        } = noteEvent;
        const existingInput = state.inputs.entities[`${inputId}`];
        // update channel
        const existingChannel =
          state.channels.entities[`${inputId}__${channel}`];
        if (existingInput && existingChannel) {
          const eventNoteNum =
            eventData[1] + 12 * existingInput.manualOctaveOffset;
          const chromaticNoteNum = (eventNoteNum % 12) as ChromaticNoteNumber;
          if (eventType === 'noteon') {
            // increment totalNoteCount
            existingChannel.totalNoteCount += 1;

            // add noteNum to notesOn and osmdNotesOn in numerical order if it does not already exist in array
            addUniqueNumToSortedArr(eventNoteNum, existingChannel.notesOn);
            addUniqueNumToSortedArr(eventNoteNum, existingChannel.notesPressed);
            addUniqueNumToSortedArr(eventNoteNum, existingChannel.osmdNotesOn);
            existingChannel.chromaticNoteData[chromaticNoteNum].noteOn = true;
            existingChannel.chromaticNoteData[chromaticNoteNum].notePressed =
              true;

            // update keyData
            chromaticNoteToMajorKeyMap[chromaticNoteNum].forEach((keyNum) => {
              if (existingChannel.keyData[keyNum]) {
                existingChannel.keyData[keyNum].noteCount += 1;
              }
            });
          } else if (eventType === 'noteoff') {
            // always update osmdNotesOn, regardless of pedal
            const osmdNoteIndex =
              existingChannel.osmdNotesOn.indexOf(eventNoteNum);
            if (osmdNoteIndex > -1) {
              existingChannel.osmdNotesOn.splice(osmdNoteIndex, 1);
            }
            existingChannel.chromaticNoteData[chromaticNoteNum].notePressed =
              false;

            // remove note from notesPressed
            const notePressedIndex =
              existingChannel.notesPressed.indexOf(eventNoteNum);
            if (notePressedIndex > -1) {
              existingChannel.notesPressed.splice(notePressedIndex, 1);
            }
            // only update channel notesOn if pedal is off
            if (!existingInput.pedalOn) {
              const noteOnIndex = existingChannel.notesOn.indexOf(eventNoteNum);
              if (noteOnIndex > -1) {
                existingChannel.notesOn.splice(noteOnIndex, 1);
              }
              existingChannel.chromaticNoteData[chromaticNoteNum].noteOn =
                false;
            }
          }

          // update note
          const existingNote =
            state.notes.entities[`${inputId}__${channel}__${eventNoteNum}`];
          if (existingNote) {
            if (eventType === 'noteon') {
              existingNote.noteOn = true;
              existingNote.notePressed = true;
              existingNote.count++;
            } else if (eventType === 'noteoff') {
              existingNote.notePressed = false;
              // only set noteOn to false if sustain is not held
              if (!existingInput.pedalOn) existingNote.noteOn = false;
            }
            existingNote.timestamp = timestamp;
            existingNote.velocity = velocity;
            existingNote.attack = attack;
            existingNote.release = release;
          }
        }
      }
    },
    handlePedalEvent(state, action: PayloadAction<PedalEvent>) {
      const { inputId, channel, notesOnState, pedalOn } = action.payload;
      const existingInput = state.inputs.entities[`${inputId}`];
      const existingChannel = state.channels.entities[`${inputId}__${channel}`];
      let currentNotesOn = notesOnState;
      if (existingInput && existingChannel) {
        existingInput.pedalOn = existingInput.reversePedal ? pedalOn : !pedalOn;

        // remove all notes from channel.notesOn if they are no longer on after pedal release
        if (!existingInput.pedalOn) {
          let updatedNotesOn: number[] = [];
          existingChannel.notesOn.forEach((noteNum) => {
            const chromaticNoteNum = (noteNum % 12) as ChromaticNoteNumber;
            // if notesOnState is not provided, then construct it from the channel's note.notePressed
            if (currentNotesOn.length === 0) {
              currentNotesOn = Array(128).fill(false);
              existingChannel.notesOn.forEach((num) => {
                const note =
                  state.notes.entities[`${existingChannel.id}__${num}`];
                currentNotesOn[num] = note ? note.notePressed : false;
              });
            }
            // manual offset is used to calculate noteNum during noteon events, so it must be reversed when comparing with WebMidi note values
            const noteOn =
              currentNotesOn[noteNum - 12 * existingInput.manualOctaveOffset];
            // update channel.notesOn
            if (noteOn) updatedNotesOn.push(noteNum);
            // update note.noteOn
            const existingNote =
              state.notes.entities[`${inputId}__${channel}__${noteNum}`];
            if (existingNote) existingNote.noteOn = noteOn;
            // update chromaticNoteData for channel
            existingChannel.chromaticNoteData[chromaticNoteNum].noteOn = noteOn;
          });
          existingChannel.notesOn = updatedNotesOn;
        }
      }
    },
  },
});

export const {
  addNewMidiInputs,
  deleteMidiInputs,
  resetKeyData,
  updateOneMidiInput,
  updateOneMidiChannel,
  handleMidiNoteEvent,
  handlePedalEvent,
} = midiListenerSlice.actions;

// input selectors
export const {
  selectAll: selectAllMidiInputs,
  selectEntities: selectMidiInputEntities,
  selectById: selectMidiInputById,
} = midiInputAdapter.getSelectors<RootState>(
  (state) => state.midiListener.inputs
);

// channel selectors
export const { selectAll: selectAllMidiChannels } =
  midiChannelAdapter.getSelectors<RootState>(
    (state) => state.midiListener.channels
  );

const getChannelKeyDataById = (
  state: RootState,
  channelId: string,
  keyPrevalenceShading: boolean
): null | KeyData => {
  const channel = state.midiListener.channels.entities[channelId];
  if (channel && keyPrevalenceShading) return channel.keyData;
  return null;
};
const getChannelTotalNoteCountById = (
  state: RootState,
  channelId: string,
  keyPrevalenceShading: boolean
): number => {
  const channel = state.midiListener.channels.entities[channelId];
  if (channel && keyPrevalenceShading) return channel.totalNoteCount;
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

export const selectEstimateChordData = createSelector(
  [
    (state: RootState, channelId: string, useSharps: boolean): string => {
      const channel = state.midiListener.channels.entities[channelId];
      if (channel) {
        // use tonaljs to estimated chords
        const estimatedChords = TonalChord.detect(
          channel.notesOn.map((noteNum) =>
            TonalMidi.midiToNoteName(noteNum, {
              sharps: useSharps,
            })
          )
        );
        return JSON.stringify(estimatedChords);
      }
      return JSON.stringify([]);
    },
  ],
  (chords) => JSON.parse(chords) as string[]
);

export const selectOSMDNotesOnStr = createSelector(
  [
    (state: RootState, channelId: string, enabled: boolean): string => {
      const channel = state.midiListener.channels.entities[channelId];
      if (channel && enabled) {
        return JSON.stringify(channel.osmdNotesOn);
      }
      return '[]';
    },
  ],
  (osmdNotesOnStr) => osmdNotesOnStr
);

// note selectors
export const { selectAll: selectAllMidiNotes, selectById: selectMidiNoteById } =
  midiNoteAdapter.getSelectors<RootState>((state) => state.midiListener.notes);

const getNotesPressedByChannelId = (
  state: RootState,
  channelId: string,
  noteNums: number[]
) => {
  for (let x of noteNums) {
    const note = selectMidiNoteById(state, `${channelId}__${x}`);
    if (note?.notePressed === false) return false;
  }
  return true;
};
export const selectNotesPressedByChannelId = createSelector(
  [getNotesPressedByChannelId],
  (notesPressed) => notesPressed
);

const getNotesOnByChannelId = (
  state: RootState,
  channelId: string,
  noteNums: number[]
) => {
  for (let x of noteNums) {
    const note = selectMidiNoteById(state, `${channelId}__${x}`);
    if (note?.noteOn === false) return false;
  }
  return true;
};
export const selectNotesOnByChannelId = createSelector(
  [getNotesOnByChannelId],
  (noteOn) => noteOn
);

const getChromaticNotesOn = (
  state: RootState,
  channelId: string,
  chromaticNoteNums: ChromaticNoteNumber[]
) => {
  const channel = state.midiListener.channels.entities[channelId];
  if (!channel) return false;
  for (let x of chromaticNoteNums) {
    if (channel.chromaticNoteData[x].noteOn === false) return false;
  }
  return true;
};
export const selectChromaticNotesOn = createSelector(
  [getChromaticNotesOn],
  (noteOn) => noteOn
);

const getChromaticNotesPressed = (
  state: RootState,
  channelId: string,
  chromaticNoteNums: ChromaticNoteNumber[]
) => {
  const channel = state.midiListener.channels.entities[channelId];
  if (!channel) return false;
  for (let x of chromaticNoteNums) {
    if (channel.chromaticNoteData[x].notePressed === false) return false;
  }
  return true;
};
export const selectChromaticNotesPressed = createSelector(
  [getChromaticNotesPressed],
  (notePressed) => notePressed
);

const getChannelNotesOn = (state: RootState, channelId: string) => {
  const channel = state.midiListener.channels.entities[channelId];
  let notesOn = channel ? channel.notesOn : [];
  return JSON.stringify(notesOn);
};
export const selectChannelNotesOn = createSelector(
  [getChannelNotesOn],
  (notesOnStr) => JSON.parse(notesOnStr)
);

const getChannelNotesPressed = (state: RootState, channelId: string) => {
  const channel = state.midiListener.channels.entities[channelId];
  let notesPressed = channel ? channel.notesPressed : [];
  return JSON.stringify(notesPressed);
};
export const selectChannelNotesPressed = createSelector(
  [getChannelNotesPressed],
  (notesPressedStr) => JSON.parse(notesPressedStr)
);

const getChannelChromaticNoteData = (state: RootState, channelId: string) => {
  const channel = state.midiListener.channels.entities[channelId];
  let chromaticNoteData = channel
    ? channel.chromaticNoteData
    : defaultChromaticNoteData;
  return chromaticNoteData;
};
export const selectChannelChromaticNoteData = createSelector(
  [getChannelChromaticNoteData],
  (chromaticNoteData) => chromaticNoteData
);

const getNoteEntity = (
  state: RootState,
  channelId: string,
  noteNum: number
) => {
  const note = selectMidiNoteById(state, `${channelId}__${noteNum}`);
  return note;
};
export const selectChannelNote = createSelector(
  [getNoteEntity],
  (note) => note
);

export const selectInitialInputsLoaded = createSelector(
  [(state: RootState) => state.midiListener.initialInputsLoaded],
  (initialInputsLoaded) => initialInputsLoaded
);

export default midiListenerSlice.reducer;
