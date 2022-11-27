/// <reference types="react-scripts" />

/// <reference types="redux-persist" />

declare module '*.mxl' {
  const value: any; // Add better type definitions here if desired.
  export default value;
}

declare module '*.xml' {
  const value: any; // Add better type definitions here if desired.
  export default value;
}

interface MidiNoteEvent {
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

interface MidiPedalEvent {
  eventHandler: 'pedalEvent';
  inputId: string;
  channel: number;
  notesOnState: boolean[];
  pedalOn: boolean;
}

type WebMidiEvent = MidiNoteEvent | MidiPedalEvent;

interface NotificationT {
  id: string;
  msg: string;
  severity: 'error' | 'success' | 'info' | 'warning' | undefined;
}

interface PianoSettingsT {
  startNote: number;
  keyWidth: number;
}

interface NoteColorPalettes {
  Gradient: {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
    11: number;
  };
  'Color of Sound': {
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
    11: number;
  };
}
type ColorPaletteType = keyof NoteColorPalettes;
type NoteColorSettingStyle = 'Monochrome' | 'Color Palette';
// define the color settings that may apply to different widgets like Piano and Circle Of Fifths
interface ColorSettingsT {
  style: NoteColorSettingStyle;
  monoChromeColor: number;
  colorPalette: ColorPaletteType;
}

type CursorMatchOption = 'All' | 'Treble' | 'Bass';
interface OSMDSettingsT {
  zoom: number;
  drawTitle: boolean;
  showCursor: boolean;
  iterateCursorOnInput: boolean;
  cursorMatchClefs: CursorMatchOption;
  drawFromMeasureNumber: number;
  drawUpToMeasureNumber: number;
  colorNotes: boolean;
  selectedFile: UploadedFileT | null;
  playbackVolume: number;
  metronomeVolume: number;
  metronomeCountInBeats: number;
  rerenderId: string; // rerenders osmd whenever this ID changes
  listenGlobalPlayback: boolean;
  midiOutputId: string;
  midiOutputChannel: string;
}

interface TonnetzSettingsT {
  zoom: number;
}

interface YoutubePlayerSettingsT {
  url: string;
  videoFit: 'contain' | 'cover';
  verticalScroll: number;
  listenGlobalPlayback: boolean;
  volume: number;
  globalPlaybackStartOffset: number;
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
  notesPressed: number[];
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

type KeyData = {
  [key: number]: {
    noteCount: number;
  };
};

interface AddNewMidiInputsPayload {
  inputs: MidiInputT[];
  channels: MidiChannelT[];
  notes: MidiNoteT[];
}

interface WebMidiInstance {
  inputs: any[];
  outputs: any[];
  getOutputById: any;
}

interface WebMidiOutputT {
  eventsSuspended: boolean;
  _octaveOffset: number;
  _midiOutput: {
    id: string;
    manufacturer: string;
    name: string;
    connection: string;
    state: string;
    type: string;
    version: string;
  };
}

interface MidiOutputT {
  id: string;
  name: string;
  octaveOffset: number;
  eventsSuspended: boolean;
}

interface WidgetModule {
  name: string;
  Component: React.ComponentType<any>;
  SettingComponent: React.ComponentType<any> | null;
  ButtonsComponent: React.ComponentType<any> | null;
  defaultSettings: {};
  includeBlockSettings: BlockSettingComponents[];
  orderWeight?: number;
}

type BlockSettingComponents = 'Block Theme' | 'Midi Input' | 'Key' | 'Color';

type ChromaticNoteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'E#'
  | 'Fb'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B'
  | 'B#'
  | 'Cb';

type KeyOption =
  | 'C'
  | 'G'
  | 'D'
  | 'A'
  | 'E'
  | 'B'
  | 'F#'
  | 'Gb'
  | 'Db'
  | 'Ab'
  | 'Eb'
  | 'Bb'
  | 'F';

interface NoteOnColors {
  pressedColor: number;
  sustainedColor: number;
  offColor: number;
}

interface BlockTemplate {
  id: string;
  name: string;
  defaultInputId: string;
  defaultChannelId: string;
  midiBlocks: MidiBlockT[];
  blockLayout: ReactGridLayout.Layout[];
  globalSettings: GlobalSettings;
  createdAt: string;
  updatedAt: string;
  owner?: string | null | undefined;
}

type ThemeMode = 'light' | 'dark';
interface MidiBlockT {
  id: string;
  inputId: string;
  channelId: string;
  widget: string;
  themeMode: ThemeMode | 'default';
  pianoSettings: PianoSettingsT;
  staffSettings: StaffSettingsT;
  colorSettings: ColorSettingsT;
  osmdSettings: OSMDSettingsT;
  imageSettings: ImageSettingsT;
  youtubePlayerSettings: YoutubePlayerSettingsT;
  tonnetzSettings: TonnetzSettingsT;
  circleOfFifthsSettings: CircleOfFifthsSettingsT;
  midiFilePlayerSettings: MidiFilePlayerSettingsT;
  widgetSettings: {};
}

interface GlobalSettings {
  themeMode: ThemeMode;
  globalKeySignature: KeyOption;
  globalKeySignatureUsesSharps: boolean;
  playbackIsPlaying: boolean;
  playbackSeekSeconds: number;
  playbackSeekAutoplay: boolean;
  playbackSeekVersion: string;
}

interface ExampleWidgetSettingsT {
  exampleTextSetting: string;
  exampleSliderSetting: number;
  exampleSelectSetting: string;
  exampleCheckboxSetting: boolean;
}
