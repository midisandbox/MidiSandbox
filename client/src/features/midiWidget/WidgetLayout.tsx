import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import MidiWidget from './MidiWidget';
import {
  selectWidgetsByBlockId,
  updateMidiWidgetsLayout,
} from './midiWidgetSlice';
import { UpdateLayoutPayload } from '../midiBlock/midiBlockSlice';

const ReactGridLayout = WidthProvider(GridLayout);

export interface WidgetLayoutProps {
  blockId: string;
}
const WidgetLayout = ({ blockId }: WidgetLayoutProps) => {
  const muiTheme = useTheme();
  const dispatch = useAppDispatch();
  const blockWidgets = useTypedSelector((state) =>
    selectWidgetsByBlockId(state, blockId)
  );

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updateObject: UpdateLayoutPayload = {};
    updatedLayout.forEach((layout) => {
      updateObject[layout.i] = layout;
    });
    dispatch(updateMidiWidgetsLayout(updateObject));
  };

  return (
    <ReactGridLayout
      className="layout"
      margin={[muiTheme.custom.spacingUnit, muiTheme.custom.spacingUnit]}
      cols={12}
      rowHeight={muiTheme.custom.spacingUnit * 2}
      onLayoutChange={onLayoutChange}
    >
      {blockWidgets.map((midiWidget) => (
        <Box
          key={midiWidget.id}
          data-grid={{ ...midiWidget.layout, ...widgetLayoutTemplate }}
        >
          <MidiWidget midiWidget={midiWidget} />
        </Box>
      ))}
    </ReactGridLayout>
  );
};

const widgetLayoutTemplate: Partial<Layout> = {
  minH: 5,
};

export default WidgetLayout;
