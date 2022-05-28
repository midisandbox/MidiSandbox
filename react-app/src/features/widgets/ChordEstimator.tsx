import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import { selectEstimateChordData } from '../midiListener/midiListenerSlice';
import { useTheme } from '@mui/material/styles';
import { selectGlobalSettings } from '../../app/globalSettingsSlice';

interface ChordEstimatorProps {
  channelId: string;
  containerWidth: number;
  containerHeight: number;
}
const ChordEstimator = React.memo(
  ({ channelId, containerWidth, containerHeight }: ChordEstimatorProps) => {
    const muiTheme = useTheme();
    const globalSettings = useTypedSelector(selectGlobalSettings);
    const estimatedChords = useTypedSelector((state) =>
      selectEstimateChordData(
        state,
        channelId,
        globalSettings.globalKeySignatureUsesSharps
      )
    );
    const { chords } = JSON.parse(estimatedChords);

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
          backgroundColor: muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary,
        }}
      >
        {chords[0] && <Box sx={{ fontSize: mainFont }}>{chords[0]}</Box>}
        {chords[1] && <Box sx={{ fontSize: subFont }}>{chords[1]}</Box>}
      </Box>
    );
  }
);

export default ChordEstimator;
