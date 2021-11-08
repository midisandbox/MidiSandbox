import { EventChannel } from '@redux-saga/core';
import { eventChannel } from 'redux-saga';
import {
  all, call, put, take
} from 'redux-saga/effects';
import { Utilities, WebMidi, } from 'webmidi/dist/webmidi.esm';
import { MidiChannelT } from '../features/midiListener/midiChannelSlice';
import { addNewMidiInputs, MidiInputT } from '../features/midiListener/midiInputSlice';
import { handleMidiNoteEvent, MidiNoteEvent, MidiNoteT } from '../features/midiListener/midiNoteSlice';

export default function* rootSaga() {
  yield all([watchWebMidi()]);
}

interface WebMidiInstance {
  inputs: any[];
}
function* watchWebMidi() {
  // create a webMidi instance, dispatch an action to upsert inputs, channels and notes to redux store
  const webMidi: WebMidiInstance = yield WebMidi.enable();
  const { inputs, channels, notes } = mapWebMidiInputs(webMidi.inputs);
  yield put(addNewMidiInputs({ inputs, channels, notes }))

  // create an EventChannel to listen to webMidi events and dispatch them to redux
  const webMidiChannel: EventChannel<MidiNoteEvent> = yield call(
    createWebMidiSagaChannel,
    webMidi
  );
  while (true) {
    try {
      const payload: MidiNoteEvent = yield take(webMidiChannel)
      yield put(handleMidiNoteEvent(payload));
    } catch(err) {
      console.error('socket error:', err);
    }
  }
}

function createWebMidiSagaChannel(webMidi: WebMidiInstance) {
  return eventChannel<MidiNoteEvent>((emit) => {
    const midiInputChannels = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ];

    webMidi.inputs.forEach((input, i) => {
      input.addListener(
        'noteon',
        (e: any) => {
          emit({
            inputId: input.id,
            eventType: e.type,
            eventData: e.data,
            channel: e.message.channel,
            timestamp: e.timestamp,
            velocity: e.velocity,
            accidental: e.note.accidental,
            attack: e.note.attack,
            duration: e.note.duration,
            name: e.note.name,
            octave: e.note.octave,
            release: e.note.release,
          });
        },
        { channels: midiInputChannels }
      );

      input.addListener(
        'noteoff',
        (e: any) => {
          emit({
            inputId: input.id,
            eventType: e.type,
            eventData: e.data,
            channel: e.message.channel,
            timestamp: e.timestamp,
            velocity: e.velocity,
            accidental: e.note.accidental,
            attack: e.note.attack,
            duration: e.note.duration,
            name: e.note.name,
            octave: e.note.octave,
            release: e.note.release,
          });
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

function mapWebMidiInputs (webMidiInputs: any[]) {
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
          noteon: false,
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
