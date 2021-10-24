export const testData = {
  midiBlocks: [
    {
      id: 'block1',
      layout: { i: 'block1', x: 0, y: 0, w: 12, h: 10 },
      midiWidgetIds: ['widget1', 'widget2'],
    },
    {
      id: 'block2',
      layout: { i: 'block2', x: 0, y: 10, w: 6, h: 10 },
      midiWidgetIds: [],
    },
    {
      id: 'block3',
      layout: { i: 'block3', x: 6, y: 10, w: 6, h: 10 },
      midiWidgetIds: [],
    },
  ],
  midiWidgets: [
    {
      id: 'widget1',
      layout: { i: 'widget1', x: 0, y: 0, w: 6, h: 9, },
      midiBlockId: 'block1'
    },
    {
      id: 'widget2',
      layout: { i: 'widget2', x: 6, y: 0, w: 6, h: 9,  },
      midiBlockId: 'block1'
    },
  ]
}