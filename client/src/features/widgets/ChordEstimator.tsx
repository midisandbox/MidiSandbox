import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import { selectChordEstimate } from '../midiListener/midiChannelSlice';

interface ChordEstimatorProps {
  channelId: string;
}
const ChordEstimator = React.memo(({ channelId }: ChordEstimatorProps) => {
  const estimatedChords = useTypedSelector((state) =>
    selectChordEstimate(state, channelId)
  );
  const chordArr = estimatedChords.split('__');

  return (
    <Box>
      {chordArr.map((chord, i) => (
        <Box key={`${i}-${chord}`}>{chord}</Box>
      ))}
    </Box>
  );
});

export default ChordEstimator;
