import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import { selectMidiWidgetById } from './midiWidgetSlice';

export interface MidiWidgetProps {
  widgetId: string;
}
const MidiWidget = ({ widgetId }: MidiWidgetProps) => {
  const midiWidget = useTypedSelector((state) =>
    selectMidiWidgetById(state, widgetId)
  );

  if (!midiWidget) {
    console.error(`Could not find widget! widgetId: ${widgetId}`);
    return null;
  }

  return (
    <Box
      sx={{ backgroundColor: 'grey.200', height: '100%', color: 'grey.900' }}
    >
      <div>{`${midiWidget?.id}`}</div>
    </Box>
  );
};

export default MidiWidget;
