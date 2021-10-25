export const testData = {
  midiBlocks: [
    {
      id: 'block1',
      midiWidgetIds: ['widget1', 'widget2'],
    },
    {
      id: 'block2',
      midiWidgetIds: [],
    },
    {
      id: 'block3',
      midiWidgetIds: [],
    },
  ],
  midiWidgets: [
    {
      id: 'widget1',
      midiBlockId: 'block1',
    },
    {
      id: 'widget2',
      midiBlockId: 'block1',
    },
  ],
  blockLayouts: [
    { i: 'block1', x: 0, y: 0, w: 12, h: 10 },
    { i: 'block2', x: 0, y: 10, w: 6, h: 10 },
    { i: 'block3', x: 6, y: 10, w: 6, h: 10 },
  ],
  widgetLayouts: [
    {blockId: 'block1', i: 'widget1', x: 0, y: 0, w: 6, h: 9 },
    {blockId: 'block1', i: 'widget2', x: 6, y: 0, w: 6, h: 9 },
  ],
};
