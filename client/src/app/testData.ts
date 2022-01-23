import { MidiBlockData } from '../features/midiBlock/midiBlockSlice';

export const getTestData = (numBlocks: number) => {
  let midiBlocks: MidiBlockData[] = [];
  let blockLayouts = [];
  for (let i = 0; i < numBlocks; i++) {
    midiBlocks.push({
      id: `block-${i}`,
      inputId: '',
      channelId: '',
      widget: '',
      theme: 'Light',
      pianoSettings: {
        startNote: 36,
        keyWidth: 50,
      },
      colorSettings: {
        style: 'Color Palette',
        monoChromeColor: 0x93f1ff,
        colorPalette: 'Gradient',
      },
      osmdSettings: {
        zoom: 1,
        horizontalStaff: false,
        drawTitle: false,
        showCursor: true,
        drawFromMeasureNumber: 0,
        drawUpToMeasureNumber: 0,
      },
    });
    blockLayouts.push({ i: `block-${i}`, x: 0, y: 0, w: 12, h: 20 });
  }
  return { midiBlocks, blockLayouts };
};
