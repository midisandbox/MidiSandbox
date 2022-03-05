import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { useResizeDetector } from 'react-resize-detector';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { UpdateLayoutPayload } from '../../utils/types';
import MidiBlock from '../midiBlock/MidiBlock';
import {
  selectAllBlockLayouts,
  updateManyBlockLayouts
} from './blockLayoutSlice';

const BlockLayout = () => {
  const { width, ref } = useResizeDetector();
  const muiTheme = useTheme();
  const blockLayouts = useTypedSelector(selectAllBlockLayouts);
  const dispatch = useAppDispatch();

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updatePayload: UpdateLayoutPayload = [];
    updatedLayout.forEach((layout) => {
      updatePayload.push({ id: layout.i, changes: layout });
    });
    dispatch(updateManyBlockLayouts(updatePayload));
  };

  return (
    <Box ref={ref}>
      <GridLayout
        width={width ? width : 0}
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
            <MidiBlock deleteDisabled={blockLayouts.length === 1} blockLayout={blockLayout} />
          </Box>
        ))}
      </GridLayout>
    </Box>
  );
};

const blockLayoutTemplate: Partial<Layout> = {
  minH: 9,
};

export default BlockLayout;
