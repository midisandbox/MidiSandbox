import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { UpdateLayoutPayload } from '../../utils/types';
import MidiBlock from '../midiBlock/MidiBlock';
import {
  selectAllBlockLayouts,
  updateManyBlockLayouts
} from './blockLayoutSlice';
const ReactGridLayout = WidthProvider(GridLayout);

const BlockLayout = () => {
  const muiTheme = useTheme();
  const blockLayouts = useTypedSelector(selectAllBlockLayouts);
  const dispatch = useAppDispatch();

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updatePayload: UpdateLayoutPayload = [];
    updatedLayout.forEach((layout) => {
      updatePayload.push({id: layout.i, changes: layout});
    });
    dispatch(updateManyBlockLayouts(updatePayload));
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
      {blockLayouts.map((blockLayout) => (
        <Box
          key={blockLayout.i}
          data-grid={{ ...blockLayout, ...blockLayoutTemplate }}
        >
          <MidiBlock blockId={blockLayout.i} containerHeight={blockLayout.h} containerWidth={blockLayout.w} />
        </Box>
      ))}
    </ReactGridLayout>
  );
};

const blockLayoutTemplate: Partial<Layout> = {
  minH: 5,
};

export default BlockLayout;
