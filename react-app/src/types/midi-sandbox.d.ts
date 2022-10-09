interface NotificationT {
  id: string;
  msg: string;
  severity: 'error' | 'success' | 'info' | 'warning' | undefined;
}

interface StaffSettingsT {
  verticalSpacing: number;
}

interface CircleOfFifthsSettingsT {
  keyPrevalenceShading: boolean;
}

interface SoundfontManager {
  metronomeSF: Soundfont.Player;
  pianoSF: Soundfont.Player;
}

interface ImageSettingsT {
  url: string;
  selectedFile: UploadedFileT | null;
  objectFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
}

interface NotepadSettingsT {
  currentEditorState: string;
  templateEditorState: string;
}

interface UploadedFileT {
  filename: string;
  key: string;
  folder: BucketFolder;
  lastModified: number;
  size: number;
}

interface MidiFilePlayerSettingsT {
  selectedMidiFiles: UploadedFileT[];
  selectedAudioFile: UploadedFileT | null;
  volume: number;
  audioDelay: number;
  controlGlobalPlayback: boolean;
  loopingEnabled: boolean;
}

interface WebMidiInputT {
  eventsSuspended: boolean;
  _octaveOffset: number;
  _midiInput: {
    id: string;
    manufacturer: string;
    name: string;
    connection: string;
    state: string;
    type: string;
    version: string;
  };
  channels: {
    _octaveOffset: number;
    eventsSuspended: boolean;
    _number: number;
  }[];
}

interface MidiInputT {
  id: string;
  manufacturer: string;
  name: string;
  eventsSuspended: boolean;
  octaveOffset: number;
  manualOctaveOffset: number;
  connection: string;
  state: string;
  type: string;
  version: string;
  channelIds: string[];
  pedalOn: boolean;
  reversePedal: boolean;
}

interface MidiChannelT {
  id: string;
  inputId: string;
  number: number;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: string[];
  keyData: KeyData;
  totalNoteCount: number;
  notesOn: number[];
  osmdNotesOn: number[]; // osmd notes only include held notes (w/o pedal) and will be emptied on cursor.next()
  chromaticNoteData: {
    0: { noteOn: boolean; notePressed: boolean };
    1: { noteOn: boolean; notePressed: boolean };
    2: { noteOn: boolean; notePressed: boolean };
    3: { noteOn: boolean; notePressed: boolean };
    4: { noteOn: boolean; notePressed: boolean };
    5: { noteOn: boolean; notePressed: boolean };
    6: { noteOn: boolean; notePressed: boolean };
    7: { noteOn: boolean; notePressed: boolean };
    8: { noteOn: boolean; notePressed: boolean };
    9: { noteOn: boolean; notePressed: boolean };
    10: { noteOn: boolean; notePressed: boolean };
    11: { noteOn: boolean; notePressed: boolean };
  };
}
interface MidiNoteT {
  id: string;
  inputId: string;
  channelId: string;
  name: string;
  noteNumber: number;
  accidental: string | undefined;
  identifier: string;
  octave: number;
  noteOn: boolean; // affected by sustain
  notePressed: boolean; // unaffected by sustain
  count: number;
  attack: number;
  release: number;
  velocity: number;
  timestamp: number;
}
interface AddNewMidiInputsPayload {
  inputs: MidiInputT[];
  channels: MidiChannelT[];
  notes: MidiNoteT[];
}
