import { getInitialKeyData, BROWSER_COMPATIBLE } from '../../utils/helpers';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';

function mapWebMidiInputs(
  webMidiInputs: WebMidiInputT[],
  options?: {
    input?: Partial<MidiInputT>;
    channel?: Partial<MidiChannelT>;
    note?: Partial<MidiNoteT>;
  }
) {
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
    if (options?.input) mappedInput = { ...mappedInput, ...options.input };

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
      if (options?.channel)
        mappedChannel = { ...mappedChannel, ...options.channel };
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
        if (options?.note) mappedNote = { ...mappedNote, ...options.note };
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

const mapWebMidiOutputs = (webMidiOutputs: WebMidiOutputT[]) => {
  const outputs = webMidiOutputs.map((x) => ({
    id: x._midiOutput.id,
    name: x._midiOutput.name,
    octaveOffset: x._octaveOffset,
    eventsSuspended: x.eventsSuspended,
  }));
  return { outputs };
};

export const useWebMidiManager = () => {
  const [webMidiManager, setWebMidiManager] = useState<{
    instance?: WebMidiInstance;
    inputs: MidiInputT[];
    outputs: MidiOutputT[];
  }>({ inputs: [], outputs: [] });
  useEffect(() => {
    if (BROWSER_COMPATIBLE) {
      WebMidi.enable()
        .then(() => {
          const instance: WebMidiInstance = WebMidi;
          const { inputs } = mapWebMidiInputs(instance.inputs);
          const { outputs } = mapWebMidiOutputs(instance.outputs);
          setWebMidiManager({
            instance,
            inputs,
            outputs,
          });
        })
        .catch((err) => alert(err));
    }
  }, []);
  return webMidiManager;
};

export { mapWebMidiInputs, mapWebMidiOutputs };
