import { Theme } from '@mui/material';
import { memoize } from 'lodash';
import { Layout } from 'react-grid-layout';
import { v4 as uuidv4 } from 'uuid';
import { GlobalSettings } from '../app/globalSettingsSlice';
import { MidiBlockT } from '../features/midiBlock/midiBlockSlice';

const browserCompatible: any = navigator.requestMIDIAccess;
export const BROWSER_COMPATIBLE = Boolean(browserCompatible);

// define the widgets that a block can select
export const midiWidgets = [
  'Piano',
  'Tonnetz',
  'Circle Of Fifths',
  'Chord Estimator',
  'Grand Staff',
  'Sheet Music',
  // 'Notepad',
  'Youtube Player',
  'Image',
] as const;

// define the settings for the Piano widget
export interface PianoSettingsT {
  startNote: number;
  keyWidth: number;
}

export const CURSOR_MATCH_CLEFS = ['All', 'Treble', 'Bass'] as const;
export interface OSMDSettingsT {
  zoom: number;
  drawTitle: boolean;
  showCursor: boolean;
  iterateCursorOnInput: boolean;
  cursorMatchClefs: typeof CURSOR_MATCH_CLEFS[number];
  drawFromMeasureNumber: number;
  drawUpToMeasureNumber: number;
  colorNotes: boolean;
  selectedFileKey: string;
  playbackVolume: number;
  metronomeVolume: number;
  metronomeCountInBeats: number;
  rerenderId: string; // rerenders osmd whenever this ID changes
}

export interface YoutubePlayerSettingsT {
  url: string;
}

export interface TonnetzSettingsT {
  zoom: number;
}

// define the different color styles for notes in widgets like Piano and Circle Of Fifths
export const colorStyles = ['Monochrome', 'Color Palette'] as const;

// define the color settings that may apply to different widgets like Piano and Circle Of Fifths
export interface ColorSettingsT {
  style: typeof colorStyles[number];
  monoChromeColor: number;
  colorPalette: keyof typeof noteColorPalettes;
}

// 0 = C, 1 = C#/Db, ..., 11 = B
export const chromaticNoteNumbers = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] as const;

export type ChromaticNoteNumber = typeof chromaticNoteNumbers[number];

export const noteNumbers = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
  79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
  98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
  114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
] as const;

export const noteNames = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'E#',
  'Fb',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
  'B#',
  'Cb',
] as const;

export type NoteName = typeof noteNames[number];

export const parseColorToNumber = (color: string): number => {
  let hexString = color.slice(1);
  if (hexString.length === 3) {
    hexString = `${hexString[0]}${hexString[0]}${hexString[1]}${hexString[1]}${hexString[2]}${hexString[2]}`;
  }
  return Number(`0x${hexString}`);
};

export const parseHexadecimalColorToString = (color: number): string => {
  return `#${Number(color).toString(16)}`;
};

export const getNoteColorNum = (
  noteNum: number,
  colorSettings: ColorSettingsT
): number => {
  if (colorSettings.style === 'Monochrome')
    return colorSettings.monoChromeColor;
  else if (colorSettings.style === 'Color Palette') {
    const chromaticNoteNum = (noteNum % 12) as ChromaticNoteNumber;
    return noteColorPalettes[colorSettings.colorPalette][chromaticNoteNum];
  }
  return 0xd72727;
};

export const getNoteColorNumStr = (
  noteNum: number,
  colorSettings: ColorSettingsT
): string => {
  return parseHexadecimalColorToString(getNoteColorNum(noteNum, colorSettings));
};

export const noteColorPalettes = Object.freeze({
  Gradient: {
    0: 0xf5989d, // C
    1: 0x6dcff6, // C#/Db
    2: 0xfdc689, // D
    3: 0x8781bd, // D#/Eb
    4: 0xc4df9b, // E
    5: 0xf49bc1, // F
    6: 0x7accc8, // F#/Gb
    7: 0xf9ad81, // G
    8: 0x7da7d9, // G#/Ab
    9: 0xfff79a, // A
    10: 0xbd8cbf, // A#/Bb
    11: 0x83ca9d, // B
  },
  'Color of Sound': {
    0: 0x83ca9d, // C
    1: 0x7accc8, // C#/Db
    2: 0x6dcff6, // D
    3: 0x7da7d9, // D#/Eb
    4: 0x8781bd, // E
    5: 0xbd8cbf, // F
    6: 0xf49bc1, // F#/Gb
    7: 0xf5989d, // G
    8: 0xf9ad81, // G#/Ab
    9: 0xfdc689, // A
    10: 0xfff79a, // A#/Bb
    11: 0xc4df9b, // B
  },
});

// get all note numbers (0-127) in the provided key
export const getNoteNumsInKey = memoize(
  (chromaticNum: ChromaticNoteNumber): number[] => {
    let result = [];
    for (let i = 0; i < 127; i++) {
      if (keyToNoteMap[chromaticNum].includes(i % 12)) result.push(i);
    }
    return result;
  }
);

// each property represents a key (by its chromatic number) and the value is a list of notes in the key
export const keyToNoteMap: { [key: number]: number[] } = {
  0: [0, 2, 4, 5, 7, 9, 11], // C
  1: [1, 3, 5, 6, 8, 10, 0], // C#/Db
  2: [2, 4, 6, 7, 9, 11, 1], // D
  3: [3, 5, 7, 8, 10, 0, 2], // D#/Eb
  4: [4, 6, 8, 9, 11, 1, 3], // E
  5: [5, 7, 9, 10, 0, 2, 4], // F
  6: [6, 8, 10, 11, 1, 3, 5], // F#/Gb
  7: [7, 9, 11, 0, 2, 4, 6], // G
  8: [8, 10, 0, 1, 3, 5, 7], // G#/Ab
  9: [9, 11, 1, 2, 4, 6, 8], // A
  10: [10, 0, 2, 3, 5, 7, 9], // A#/Bb
  11: [11, 1, 3, 4, 6, 8, 10], // B
};

// each property is a chromatic note and the value is an array of keys (by their chromatic number) that the note is found in
export const noteToKeyMap: { [key: number]: number[] } = {
  0: [0, 1, 3, 5, 7, 8, 10], // C
  1: [1, 2, 4, 6, 8, 9, 11], // C#/Db
  2: [2, 3, 5, 7, 9, 10, 0], // D
  3: [3, 4, 6, 8, 10, 11, 1], // D#/Eb
  4: [4, 5, 7, 9, 11, 0, 2], // E
  5: [5, 6, 8, 10, 0, 1, 3], // F
  6: [6, 7, 9, 11, 1, 2, 4], // F#/Gb
  7: [7, 8, 10, 0, 2, 3, 5], // G
  8: [8, 9, 11, 1, 3, 4, 6], // G#/Ab
  9: [9, 10, 0, 2, 4, 5, 7], // A
  10: [10, 11, 1, 3, 5, 6, 8], // A#/Bb
  11: [11, 0, 2, 4, 6, 7, 9], // B
};

export const noteNameToNum: { [key in NoteName]: ChromaticNoteNumber } = {
  Cb: 11,
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  'B#': 0,
};

export const checkKeySignatureUsesSharps = (value: KeyOption) =>
  ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'].includes(value);

export const getNoteNumToNameMap = (
  keySignature: KeyOption
): { [key in ChromaticNoteNumber]: NoteName } => {
  const useSharps = checkKeySignatureUsesSharps(keySignature);
  return {
    0: ['C#'].includes(keySignature) ? 'B#' : 'C',
    1: useSharps ? 'C#' : 'Db',
    2: 'D',
    3: useSharps ? 'D#' : 'Eb',
    4: ['Cb'].includes(keySignature) ? 'Fb' : 'E',
    5: ['F#', 'C#'].includes(keySignature) ? 'E#' : 'F',
    6: useSharps ? 'F#' : 'Gb',
    7: 'G',
    8: useSharps ? 'G#' : 'Ab',
    9: 'A',
    10: useSharps ? 'A#' : 'Bb',
    11: 'B',
  };
};

// keep track of data related to musical keys where 0 = C, 1 = C#, ..., 11 = B
interface KeyProps {
  noteCount: number;
}
export type KeyData = { [key: number]: KeyProps };

export const getInitialKeyData = () => {
  let result: KeyData = {};
  chromaticNoteNumbers.forEach((chromaticNum) => {
    result[chromaticNum] = { noteCount: 0 };
  });
  return result;
};

export const keyOptions = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'Gb',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
] as const;
export type KeyOption = typeof keyOptions[number];

export const addUniqueNumToSortedArr = (newNum: number, arr: number[]) => {
  let insertIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    const noteNumOn = arr[i];
    if (noteNumOn === newNum) {
      insertIndex = -1;
      break;
    } else if (newNum > noteNumOn) {
      insertIndex = i + 1;
    }
  }
  if (insertIndex > -1) arr.splice(insertIndex, 0, newNum);
};

export const getDefaultMidiBlock = (theme: Theme, layout?: Partial<Layout>) => {
  const blockId = uuidv4();

  const blockLayout = {
    i: blockId,
    x: 0,
    y: 0,
    w: 12,
    h: 20,
    ...(layout && layout),
  };

  const midiBlock: MidiBlockT = {
    id: blockId,
    inputId: '',
    channelId: '',
    widget: '',
    themeMode: 'default',
    pianoSettings: {
      startNote: 36,
      keyWidth: 50,
    },
    staffSettings: {
      verticalSpacing: 1,
    },
    colorSettings: {
      style: 'Color Palette',
      monoChromeColor: parseColorToNumber(theme.palette.primary.main),
      colorPalette: 'Gradient',
    },
    osmdSettings: {
      zoom: 1,
      drawTitle: false,
      showCursor: true,
      iterateCursorOnInput: true,
      cursorMatchClefs: 'All',
      drawFromMeasureNumber: 0,
      drawUpToMeasureNumber: 0,
      colorNotes: false,
      selectedFileKey: '',
      playbackVolume: 50,
      metronomeVolume: 0,
      metronomeCountInBeats: 0,
      rerenderId: uuidv4(),
    },
    youtubePlayerSettings: {
      url: '',
    },
    tonnetzSettings: {
      zoom: 1,
    },
    circleOfFifthsSettings: {
      keyPrevalenceShading: false,
    },
    imageSettings: {
      url: '',
      selectedFileKey: '',
      objectFit: 'cover',
    },
    notepadSettings: {
      currentEditorState: '',
      templateEditorState: '',
    },
  };
  return { midiBlock, blockLayout };
};

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function hexToRgb(hex: string) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {
        r: 0,
        g: 0,
        b: 0,
      };
}
// console.log(hexToRgb("#1c87c9").b); //201

export function componentToHex(c: number) {
  let hex = c.toString(16);
  // eslint-disable-next-line eqeqeq
  return hex.length == 1 ? '0' + hex : hex;
}
export function rgbToHex(rgbObj: RgbObj) {
  return (
    '#' +
    componentToHex(Math.floor(rgbObj.r)) +
    componentToHex(Math.floor(rgbObj.g)) +
    componentToHex(Math.floor(rgbObj.b))
  );
}
// console.log(rgbToHex(28, 135, 201)); // #1c89c9

interface RgbObj {
  r: number;
  g: number;
  b: number;
}
export function calculateColorDiff(
  first: RgbObj,
  second: RgbObj,
  percentage = 0.5
) {
  let result: RgbObj = { r: 0, g: 0, b: 0 };
  Object.keys(first).forEach((key) => {
    const keyTyped = key as keyof RgbObj;
    let start = first[keyTyped];
    let end = second[keyTyped];
    let offset = (start - end) * percentage;
    if (offset >= 0) {
      Math.abs(offset);
    }
    result[keyTyped] = start - offset;
  });
  return result;
}

export interface NoteOnColors {
  pressedColor: number;
  sustainedColor: number;
  offColor: number;
}

// get NoteOnColors for 1-5 provided noteNums (combine up to 5 note colors based on colorSettings/theme)
export const getNoteOnColors = (
  noteNums: number[],
  colorSettings: ColorSettingsT,
  theme: Theme,
  offColor?: number
): NoteOnColors => {
  if (!offColor) offColor = parseColorToNumber(theme.palette.divider);
  let pressedColor = getNoteColorNum(noteNums[0], colorSettings);
  // combine 2 colors if noteNums has 2 values
  if (noteNums.length >= 2 && colorSettings.style === 'Color Palette') {
    pressedColor = parseColorToNumber(
      rgbToHex(
        calculateColorDiff(
          hexToRgb(getNoteColorNumStr(noteNums[0], colorSettings)),
          hexToRgb(getNoteColorNumStr(noteNums[1], colorSettings))
        )
      )
    );
    // combine 3 colors if noteNums has 2 values
    if (noteNums.length >= 3) {
      let mergeColor = calculateColorDiff(
        hexToRgb(getNoteColorNumStr(noteNums[0], colorSettings)),
        hexToRgb(getNoteColorNumStr(noteNums[1], colorSettings)),
        0.5
      );
      mergeColor = calculateColorDiff(
        mergeColor,
        hexToRgb(getNoteColorNumStr(noteNums[2], colorSettings)),
        0.333
      );
      if (noteNums.length >= 4) {
        mergeColor = calculateColorDiff(
          mergeColor,
          hexToRgb(getNoteColorNumStr(noteNums[3], colorSettings)),
          0.25
        );
      }
      if (noteNums.length >= 5) {
        mergeColor = calculateColorDiff(
          mergeColor,
          hexToRgb(getNoteColorNumStr(noteNums[4], colorSettings)),
          0.2
        );
      }
      pressedColor = parseColorToNumber(rgbToHex(mergeColor));
    }
  }
  // combine pressedColor with white to get sustainedColor
  let sustainedColor = parseColorToNumber(
    rgbToHex(
      calculateColorDiff(
        hexToRgb(parseHexadecimalColorToString(pressedColor)),
        hexToRgb('#ffffff'),
        0.5
      )
    )
  );
  return { pressedColor, sustainedColor, offColor };
};

export const getDefaultTemplate = (muiTheme: Theme) => {
  const blocks = [
    {
      x: 0,
      y: 0,
      w: 12,
      h: 20,
    },
    {
      x: 0,
      y: 33,
      w: 12,
      h: 20,
    },
    {
      x: 6,
      y: 20,
      w: 6,
      h: 13,
    },
    {
      x: 0,
      y: 20,
      w: 6,
      h: 13,
    },
    {
      x: 0,
      y: 68,
      w: 12,
      h: 20,
    },
    {
      x: 4,
      y: 53,
      w: 4,
      h: 15,
    },
    {
      x: 8,
      y: 53,
      w: 4,
      h: 15,
    },
    {
      x: 0,
      y: 53,
      w: 4,
      h: 15,
    },
  ].map((layout) => getDefaultMidiBlock(muiTheme, layout));
  return {
    midiBlocks: blocks.map((x) => x.midiBlock),
    blockLayout: blocks.map((x) => x.blockLayout),
  };
};

export interface BlockTemplate {
  id: string;
  name: string;
  defaultInputId: string;
  defaultChannelId: string;
  midiBlocks: MidiBlockT[];
  blockLayout: Layout[];
  globalSettings: GlobalSettings;
  createdAt: string;
  updatedAt: string;
  owner?: string | null | undefined;
}

export const extractSubstring = (s: string, prefix: string, suffix: string) => {
  var i = s.indexOf(prefix);
  if (i >= 0) {
    s = s.substring(i + prefix.length);
  } else {
    return '';
  }
  if (suffix) {
    i = s.indexOf(suffix);
    if (i >= 0) {
      s = s.substring(0, i);
    } else {
      return '';
    }
  }
  return s;
};
