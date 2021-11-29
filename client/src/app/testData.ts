import { MidiBlockData } from '../features/midiBlock/midiBlockSlice';
export const testData = {
  midiBlocks: [
    {
      id: 'block1',
      inputId: '',
      channelId: '',
      widget: '',
      pianoSettings: {
        startNote: 36,
        keyWidth: 50,
      },
      colorSettings: {
        style: 'Color Palette',
        monoChromeColor: 0x93f1ff,
        colorPalette: 'Gradient',
      }
    },
  ] as MidiBlockData[],
  blockLayouts: [
    { i: 'block1', x: 0, y: 0, w: 12, h: 10 },
    // { i: 'block2', x: 0, y: 10, w: 6, h: 10 },
    // { i: 'block3', x: 6, y: 10, w: 6, h: 10 },
  ],
};
