import { Box } from '@mui/system';
import React from 'react';
import { MidiWidgetData } from './midiWidgetSlice';

export interface MidiWidgetProps {
  midiWidget: MidiWidgetData;
}
const MidiWidget = ({ midiWidget }: MidiWidgetProps) => {
  return (
    <Box
      key={midiWidget.id}
      data-grid={midiWidget.layout}
      sx={{ backgroundColor: 'grey.200', height: '100%', color: 'grey.900' }}
    >
      <div>{`${midiWidget?.id}`}</div>
    </Box>
  );
};

export default MidiWidget;
