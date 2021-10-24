import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import MidiBlock from '../midiBlock/MidiBlock';
import {
  selectAllMidiBlocks,
  UpdateLayoutPayload,
  updateMidiBlocksLayout,
} from '../midiBlock/midiBlockSlice';

const ReactGridLayout = WidthProvider(GridLayout);

const BlockLayout = () => {
  const muiTheme = useTheme();
  const midiBlocks = useTypedSelector(selectAllMidiBlocks);
  const dispatch = useAppDispatch();

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updateObject: UpdateLayoutPayload = {};
    updatedLayout.forEach((layout) => {
      updateObject[layout.i] = layout;
    });
    dispatch(updateMidiBlocksLayout(updateObject));
  };

  return (
    <ReactGridLayout
      className="layout"
      draggableHandle=".blockDragHandle"
      margin={[
        muiTheme.custom.spacingUnit * 2,
        muiTheme.custom.spacingUnit * 2,
      ]}
      cols={12}
      rowHeight={muiTheme.custom.spacingUnit * 2}
      onLayoutChange={onLayoutChange}
    >
      {midiBlocks.map((block) => (
        <Box
          key={block.id}
          data-grid={{ ...block.layout, ...blockLayoutTemplate }}
        >
          <MidiBlock block={block} />
        </Box>
      ))}
    </ReactGridLayout>
  );
};

const blockLayoutTemplate: Partial<Layout> = {
  minH: 5,
};

export default BlockLayout;
