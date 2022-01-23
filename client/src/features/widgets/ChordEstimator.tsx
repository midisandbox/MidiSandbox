import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import { selectChordEstimate } from '../midiListener/midiChannelSlice';
import { BlockTheme } from '../../utils/helpers';
import { useTheme } from '@mui/material/styles';

interface ChordEstimatorProps {
  channelId: string;
  containerWidth: number;
  containerHeight: number;
  blockTheme: BlockTheme;
}
const ChordEstimator = React.memo(
  ({
    channelId,
    containerWidth,
    containerHeight,
    blockTheme,
  }: ChordEstimatorProps) => {
    const estimatedChords = useTypedSelector((state) =>
      selectChordEstimate(state, channelId)
    );
    const muiTheme = useTheme();
    const chordArr = JSON.parse(estimatedChords);

    // set max font size based on width breakpoints
    let maxFont = 1000;
    if (containerWidth <= 200) maxFont = 22;
    else if (containerWidth <= 400) maxFont = 35;
    else if (containerWidth <= 510) maxFont = 60;
    else if (containerWidth <= 610) maxFont = 72;
    else if (containerWidth <= 717) maxFont = 85;
    else if (containerWidth <= 820) maxFont = 100;
    else if (containerWidth <= 920) maxFont = 110;
    const mainFont = Math.min(containerHeight / 3, maxFont);
    const subFont = mainFont * (2.5 / 5);

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor:
            blockTheme === 'Light'
              ? muiTheme.custom.lightBackground
              : muiTheme.custom.darkBackground,
          color:
            blockTheme === 'Light'
              ? muiTheme.custom.lightText
              : muiTheme.custom.darkText,
        }}
      >
        {chordArr[0] && <Box sx={{ fontSize: mainFont }}>{chordArr[0]}</Box>}
        {chordArr[1] && <Box sx={{ fontSize: subFont }}>{chordArr[1]}</Box>}
      </Box>
    );
  }
);

export default ChordEstimator;
