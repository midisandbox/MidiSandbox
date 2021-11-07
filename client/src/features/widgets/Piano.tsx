import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import { selectNotesByBlockId } from '../midiListener/midiNoteSlice';

export interface PianoProps {
  blockId: string;
}
const Piano = React.memo(({ blockId }: PianoProps) => {
  const notes = useTypedSelector((state) =>
    selectNotesByBlockId(state, blockId)
  );
  return (
    <Box>
      {notes[72] && notes[72].noteon && (
        <div style={{ fontSize: '50px' }}>{notes[72].identifier}</div>
      )}
    </Box>
  );
});

export default Piano;
