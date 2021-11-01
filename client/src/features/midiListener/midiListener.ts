import { Utilities, WebMidi } from 'webmidi/dist/webmidi.esm';
import { AppDispatch } from '../../app/store';
import { MidiChannelType } from './midiChannelSlice';
import { addNewMidiInputs, MidiInputType } from './midiInputSlice';
import { MidiNoteType } from './midiNoteSlice';

export class MidiListener {
  constructor(
    private dispatch: AppDispatch,
    private getState: Function,
    public webMidiInputs: any[] = [],
    public webMidiOutputs: any[] = []
  ) {}

  initialize(): void {
    WebMidi.enable()
      .then(() => {
        console.log(WebMidi.inputs);
        console.log(WebMidi.outputs);
        this.webMidiInputs = WebMidi.inputs;
        this.webMidiOutputs = WebMidi.outputs;
        this.initializeInputs();
      })
      .catch((err) => alert(err));
  }

  private initializeInputs(): void {
    let inputs: MidiInputType[] = [];
    let channels: MidiChannelType[] = [];
    let notes: MidiNoteType[] = [];
    this.webMidiInputs.forEach((input) => {
      let mappedInput: MidiInputType = {
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
        let mappedChannel: MidiChannelType = {
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
          let mappedNote: MidiNoteType = {
            id: `${mappedChannel.id}__${noteVal}`,
            inputId: mappedInput.id,
            channelId: mappedChannel.id,
            name,
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
    this.dispatch(addNewMidiInputs({ inputs, channels, notes }));
  }
}

// const example = {
//   inputs: {
//       entities: {
//         "-1959455090": {
//           id: "-1959455090",
//           manufacturer: "AKAI",
//           name: "MPK Mini Mk II",
//           eventsSuspended: false,
//           octaveOffset: 0,
//           connection: "open",
//           state: "connected",
//           type: "input",
//           version: "",
//           channels: ['-1959455090__1']
//         }
//       }
//     },
//   channels: {
//     entities: {
//       '-1959455090__1': {
//         input: '-1959455090__1',
//         eventsSuspended: false,
//         octaveOffset: 0,
//         notes: ['-1959455090__1__0', '-1959455090__1__1']
//       }
//     }
//   },
//   notes: {
//     entities: {
//       '-1959455090__1__0': {
//         input: '-1959455090',
//         channel: '-1959455090__1',
//         name: 'C',
//         octave: 0,
//         noteon: true,
//         count: 0,
//         attack: 0,
//         release: 0,
//         velocity: 0,
//         timestamp: 0,
//       }
//     }
//   }
// }

