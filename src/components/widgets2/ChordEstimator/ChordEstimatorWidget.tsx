import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../../redux/store';
import { selectEstimateChordData } from '../../../redux/slices/midiListenerSlice';
import { useTheme } from '@mui/material/styles';
import { selectGlobalSettings } from '../../../redux/slices/globalSettingsSlice';

interface ChordEstimatorProps {
  block: MidiBlockT;
  containerWidth: number;
  containerHeight: number;
}
const ChordEstimator = React.memo(
  ({ block, containerWidth, containerHeight }: ChordEstimatorProps) => {
    const muiTheme = useTheme();
    const globalSettings = useTypedSelector(selectGlobalSettings);
    const chords = useTypedSelector((state) =>
      selectEstimateChordData(
        state,
        block.channelId,
        globalSettings.globalKeySignatureUsesSharps
      )
    );

    // set max font size based on width breakpoints
    let maxFont = 1000;
    if (containerWidth <= 200) maxFont = 22;
    else if (containerWidth <= 400) maxFont = 35;
    else if (containerWidth <= 510) maxFont = 60;
    else if (containerWidth <= 610) maxFont = 72;
    else if (containerWidth <= 717) maxFont = 85;
    else if (containerWidth <= 820) maxFont = 100;
    else if (containerWidth <= 920) maxFont = 110;
    const mainFont = Math.min(containerHeight / 2.5, maxFont);
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

const exportObj: WidgetModule = {
  name: 'Chord Estimator',
  Component: ChordEstimator,
  SettingComponent: null,
  defaultSettings: {},
  includeBlockSettings: ['Midi Input', 'Key', 'Block Theme'],
};

export default exportObj;
