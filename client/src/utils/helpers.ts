import { ColorSettingsT } from '../features/midiBlock/midiBlockSlice';

export const convertHexColorToNumber = (color: string): number => {
  return parseInt(`${Number(color.replace('#', '0x'))}`, 10);
};

export const noteNumbers = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
  79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
  98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
  114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
];

export const parseColorToNumber = (color: string): number => {
  return Number(`0x${color.slice(1)}`);
};

export const parseColorToString = (color: number): string => {
  return `#${Number(color).toString(16)}`;
};

export const getNoteColor = (
  noteNum: number,
  colorSettings: ColorSettingsT
): number => {
  if (colorSettings.style === 'Monochrome')
    return colorSettings.monoChromeColor;
  else if (colorSettings.style === 'Color Palette') {
    const chromaticNoteNum = (noteNum % 12) as chromaticNoteNumbers;
    return noteColorPalettes[colorSettings.colorPalette][chromaticNoteNum];
  }
  return 0xd72727;
};

type chromaticNoteNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
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
