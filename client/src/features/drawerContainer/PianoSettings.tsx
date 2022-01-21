import { Grid, Slider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useAppDispatch } from '../../app/store';
import { PianoSettingsT } from '../../utils/helpers';
import {
  MidiBlockData,
  updateOneMidiBlock,
} from '../midiBlock/midiBlockSlice';

interface PianoSettingsProps {
  block: MidiBlockData;
}
function PianoSettings({ block }: PianoSettingsProps) {
  const dispatch = useAppDispatch();
  const [pianoSettings, setPianoSettings] = useState(block.pianoSettings);
  const {
    accidental: startNoteAccidental,
    name: startNoteName,
    octave: startNoteOctave,
  } = Utilities.getNoteDetails(pianoSettings.startNote) as any;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStoreUpdate = useCallback(
    debounce((updatedPianoSettings: PianoSettingsT) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            pianoSettings: updatedPianoSettings,
          },
        })
      );
    }, 500),
    []
  );

  const handleSliderChange =
    (setting: keyof PianoSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      const updatedPianoSettings = { ...pianoSettings, [setting]: newValue };
      setPianoSettings(updatedPianoSettings);
      debouncedStoreUpdate(updatedPianoSettings);
    };

  return (
    <>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="startNote" gutterBottom>
            Start Note:
            <Typography component="span" fontWeight={500} color="secondary">
              {' '}
              {`${startNoteName}${
                startNoteAccidental ? startNoteAccidental : ''
              }${startNoteOctave}`}
            </Typography>
          </Typography>
          <Slider
            value={pianoSettings.startNote}
            onChange={handleSliderChange('startNote')}
            aria-labelledby="startNote"
            min={0}
            max={127}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="keyWidth" gutterBottom>
            Key Width:
            <Typography component="span" fontWeight={500} color="secondary">
              {' '}
              {`${pianoSettings.keyWidth}px`}
            </Typography>
          </Typography>
          <Slider
            value={pianoSettings.keyWidth}
            onChange={handleSliderChange('keyWidth')}
            aria-labelledby="keyWidth"
            min={30}
            max={150}
          />
        </Box>
      </Grid>
    </>
  );
}

export default PianoSettings;
