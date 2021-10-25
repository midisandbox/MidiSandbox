import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import { RootState, useAppDispatch, useTypedSelector } from '../../app/store';
import { UpdateLayoutPayload } from '../../types/types';
import MidiWidget from '../midiWidget/MidiWidget';
import {
  selectWidgetLayoutsByBlockId,
  updateManywidgetLayouts,
} from './widgetLayoutSlice';

const ReactGridLayout = WidthProvider(GridLayout);

export interface WidgetLayoutProps {
  blockId: string;
}
const WidgetLayout = ({ blockId }: WidgetLayoutProps) => {
  const muiTheme = useTheme();
  const dispatch = useAppDispatch();
  const widgetLayouts = useTypedSelector((state: RootState) =>
    selectWidgetLayoutsByBlockId(state, blockId)
  );

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updatePayload: UpdateLayoutPayload = [];
    updatedLayout.forEach((layout) => {
      updatePayload.push({ id: layout.i, changes: layout });
    });
    dispatch(updateManywidgetLayouts(updatePayload));
  };

  return (
    <ReactGridLayout
      className="layout"
      margin={[muiTheme.custom.spacingUnit, muiTheme.custom.spacingUnit]}
      cols={12}
      rowHeight={muiTheme.custom.spacingUnit * 2}
      onLayoutChange={onLayoutChange}
    >
      {widgetLayouts.map((widgetLayout) => (
        <Box
          key={widgetLayout.i}
          data-grid={{ ...widgetLayout, ...widgetLayoutTemplate }}
        >
          <MidiWidget widgetId={widgetLayout.i} />
        </Box>
      ))}
    </ReactGridLayout>
  );
};

const widgetLayoutTemplate: Partial<Layout> = {
  minH: 5,
};

export default WidgetLayout;
