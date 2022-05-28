import { EventChannel } from '@redux-saga/core';
import { eventChannel } from 'redux-saga';
import { all, call, put, take } from 'redux-saga/effects';
import { Utilities, WebMidi } from 'webmidi/dist/esm/webmidi.esm';
import { MidiChannelT, MidiInputT, MidiNoteT } from '../utils/types';
import { getInitialKeyData } from '../utils/helpers';
import {
  addNewMidiInputs,
  handleMidiNoteEvent,
  handlePedalEvent,
} from '../features/midiListener/midiListenerSlice';

export default function* rootSaga() {
  yield all([watchWebMidi()]);
}

export interface MidiNoteEvent {
  eventHandler: 'note';
  inputId: string;
  eventType: string;
  eventData: number[];
  channel: number;
  timestamp: number;
  velocity: number;
  attack: number;
  release: number;
}

export interface PedalEvent {
  eventHandler: 'pedalEvent';
  inputId: string;
  channel: number;
  notesOnState: boolean[];
  pedalOn: boolean;
}

type WebMidiEvent = MidiNoteEvent | PedalEvent;

interface WebMidiInstance {
  inputs: any[];
}
function* watchWebMidi() {
  // create a webMidi instance, dispatch an action to upsert inputs, channels and notes to redux store
  const webMidi: WebMidiInstance = yield WebMidi.enable().catch((err) =>
    alert(err)
  );
  const { inputs, channels, notes } = mapWebMidiInputs(webMidi.inputs);
  yield put(addNewMidiInputs({ inputs, channels, notes }));

  // create an EventChannel to listen to webMidi events and dispatch them to redux
  const webMidiChannel: EventChannel<WebMidiEvent> = yield call(
    createWebMidiSagaChannel,
    webMidi
  );
  while (true) {
    try {
      const payload: WebMidiEvent = yield take(webMidiChannel);
      if (payload.eventHandler === 'note') {
        yield put(handleMidiNoteEvent(payload));
      } else if (payload.eventHandler === 'pedalEvent') {
        yield put(handlePedalEvent(payload));
      }
    } catch (err) {
      console.error('socket error:', err);
    }
  }
}

function createWebMidiSagaChannel(webMidi: WebMidiInstance) {
  return eventChannel<WebMidiEvent>((emit) => {
    const midiInputChannels = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ];

    webMidi.inputs.forEach((input, i) => {
      input.addListener(
        'noteon',
        (e: any) => {
          emit({
            eventHandler: 'note',
            inputId: input.id,
            eventType: e.type,
            eventData: e.data,
            channel: e.message.channel,
            timestamp: e.timestamp,
            velocity: e.velocity,
            attack: e.note.attack,
            release: e.note.release,
          });
        },
        { channels: midiInputChannels }
      );

      input.addListener(
        'noteoff',
        (e: any) => {
          // only emit noteoff event if sustain pedal is not held down for this input
          emit({
            eventHandler: 'note',
            inputId: input.id,
            eventType: e.type,
            eventData: e.data,
            channel: e.message.channel,
            timestamp: e.timestamp,
            velocity: e.velocity,
            attack: e.note.attack,
            release: e.note.release,
          });
        },
        { channels: midiInputChannels }
      );

      input.addListener(
        'controlchange',
        (e: any) => {
          if (e.subtype === 'holdpedal') {
            emit({
              eventHandler: 'pedalEvent',
              inputId: input.id,
              channel: e.message.channel,
              notesOnState: input.channels[e.message.channel].notesState,
              pedalOn: e.value === 0,
            });
          }
        },
        { channels: midiInputChannels }
      );
    });

    const unsubscribe = () => {
      webMidi.inputs.forEach((input, i) => {
        midiInputChannels.forEach((channelNumber) => {
          input[channelNumber].removeListener();
        });
      });
    };

    return unsubscribe;
  });
}

function mapWebMidiInputs(webMidiInputs: any[]) {
  let inputs: MidiInputT[] = [];
  let channels: MidiChannelT[] = [];
  let notes: MidiNoteT[] = [];
  webMidiInputs.forEach((input) => {
    let mappedInput: MidiInputT = {
      id: input._midiInput.id,
      manufacturer: input._midiInput.manufacturer,
      name: input._midiInput.name,
      eventsSuspended: input.eventsSuspended,
      octaveOffset: input._octaveOffset,
      manualOctaveOffset: 0,
      connection: input._midiInput.connection,
      state: input._midiInput.state,
      type: input._midiInput.type,
      version: input._midiInput.version,
      channelIds: [],
      pedalOn: false,
      reversePedal: false,
    };

    input.channels.forEach((channel: any) => {
      let mappedChannel: MidiChannelT = {
        id: `${mappedInput.id}__${channel._number}`,
        inputId: mappedInput.id,
        number: channel._number,
        eventsSuspended: channel.eventsSuspended,
        octaveOffset: channel._octaveOffset,
        noteIds: [],
        totalNoteCount: 0,
        keyData: getInitialKeyData(),
        notesOn: [],
        osmdNotesOn: [],
        chromaticNoteData: {
          0: { noteOn: false, notePressed: false },
          1: { noteOn: false, notePressed: false },
          2: { noteOn: false, notePressed: false },
          3: { noteOn: false, notePressed: false },
          4: { noteOn: false, notePressed: false },
          5: { noteOn: false, notePressed: false },
          6: { noteOn: false, notePressed: false },
          7: { noteOn: false, notePressed: false },
          8: { noteOn: false, notePressed: false },
          9: { noteOn: false, notePressed: false },
          10: { noteOn: false, notePressed: false },
          11: { noteOn: false, notePressed: false },
        },
      };
      for (let noteVal = 0; noteVal <= 127; noteVal++) {
        const { accidental, identifier, name, octave } =
          Utilities.getNoteDetails(noteVal) as any;
        let mappedNote: MidiNoteT = {
          id: `${mappedChannel.id}__${noteVal}`,
          inputId: mappedInput.id,
          channelId: mappedChannel.id,
          name,
          noteNumber: noteVal,
          accidental,
          identifier,
          octave,
          noteOn: false,
          notePressed: false,
          count: 0,
          attack: 0,
          release: 0,
          velocity: 0,
          timestamp: 0,
        };
        notes.push(mappedNote);
        mappedChannel.noteIds.push(mappedNote.id);
      }
      mappedInput.channelIds.push(mappedChannel.id);
      channels.push(mappedChannel);
    });
    inputs.push(mappedInput);
  });
  return { inputs, channels, notes };
}
