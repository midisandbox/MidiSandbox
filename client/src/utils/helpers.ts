import { memoize } from 'lodash';

// define the widgets that a block can select
export const midiWidgets = [
  'Piano',
  'Circle Of Fifths',
  'Soundslice',
  'Staff',
] as const;

// define the settings for the Piano widget
export interface PianoSettingsT {
  startNote: number;
  keyWidth: number;
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
  return Number(`0x${color.slice(1)}`);
};

export const parseHexadecimalColorToString = (color: number): string => {
  return `#${Number(color).toString(16)}`;
};

export const getNoteColor = (
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
    0: 0x9ae38c, // C
    1: 0x89e2da, // C#/Db
    2: 0x8cb8e3, // D
    3: 0x7e8cff, // D#/Eb
    4: 0xa99de7, // E
    5: 0xeaabe9, // F
    6: 0xcf5d5d, // F#/Gb
    7: 0xf39899, // G
    8: 0xffbbbd, // G#/Ab
    9: 0xe7af8c, // A
    10: 0xe6e090, // A#/Bb
    11: 0xbfe687, // B
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
