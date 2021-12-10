import { EventChannel } from '@redux-saga/core';
import { eventChannel } from 'redux-saga';
import { all, call, put, take } from 'redux-saga/effects';
import { Utilities, WebMidi } from 'webmidi/dist/esm/webmidi.esm';
import { MidiChannelT } from '../features/midiListener/midiChannelSlice';
import { getInitialKeyData } from '../utils/helpers';
import {
  addNewMidiInputs,
  MidiInputT,
} from '../features/midiListener/midiInputSlice';
import {
  handleMidiNoteEvent,
  handleNotesOnStateEvent,
  MidiNoteT,
} from '../features/midiListener/midiNoteSlice';

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

export interface NotesOnStateEvent {
  eventHandler: 'notesOnState';
  inputId: string;
  channel: number;
  values: boolean[];
}

type WebMidiEvent = MidiNoteEvent | NotesOnStateEvent;

interface WebMidiInstance {
  inputs: any[];
}
function* watchWebMidi() {
  // create a webMidi instance, dispatch an action to upsert inputs, channels and notes to redux store
  const webMidi: WebMidiInstance = yield WebMidi.enable();
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
      } else if (payload.eventHandler === 'notesOnState') {
        yield put(handleNotesOnStateEvent(payload));
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
      let holdPedal = false;
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
          if (!holdPedal) {
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
          }
        },
        { channels: midiInputChannels }
      );

      input.addListener(
        'controlchange',
        (e: any) => {
          if (e.subtype === 'holdpedal') {
            holdPedal = e.value !== 0;
            // if pedal is released then send event to update all channel notes noteOn value
            if (!holdPedal) {
              emit({
                eventHandler: 'notesOnState',
                inputId: input.id,
                channel: e.message.channel,
                values: input.channels[e.message.channel].notesState,
              });
            }
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
      connection: input._midiInput.connection,
      state: input._midiInput.state,
      type: input._midiInput.type,
      version: input._midiInput.version,
      channelIds: [],
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
