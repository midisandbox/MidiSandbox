import { EventChannel } from '@redux-saga/core';
import { eventChannel } from 'redux-saga';
import { all, call, put, take } from 'redux-saga/effects';
import { WebMidi } from 'webmidi';
import {
  addNewMidiInputs,
  handleMidiNoteEvent,
  handlePedalEvent,
} from './slices/midiListenerSlice';
import { mapWebMidiInputs } from '../utils/webMidiUtils';
import { MIDI_DEVICES_SUPPORTED } from '../utils/utils';

export default function* rootSaga() {
  if (MIDI_DEVICES_SUPPORTED) {
    yield all([watchWebMidi()]);
  }
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
          if (['holdpedal', 'allnotesoff'].includes(e.subtype)) {
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
