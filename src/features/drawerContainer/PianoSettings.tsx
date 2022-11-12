import { Grid, Slider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useAppDispatch } from '../../app/store';
import { PianoSettingsT } from '../../utils/helpers';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';

interface PianoSettingsProps {
  block: MidiBlockT;
}
function PianoSettings({ block }: PianoSettingsProps) {
  const dispatch = useAppDispatch();
  const [pianoSettings, setPianoSettings] = useState(block.pianoSettings);
  const {
    accidental: startNoteAccidental,
    name: startNoteName,
    octave: startNoteOctave,
  } = Utilities.getNoteDetails(pianoSettings.startNote) as any;

  const debouncedStoreUpdate = useMemo(
    () =>
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
    [dispatch, block.id]
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
            <Typography color="secondary" component="span" fontWeight={500}>
              {' '}
              {`${startNoteName}${
                startNoteAccidental ? startNoteAccidental : ''
              }${startNoteOctave}`}
            </Typography>
          </Typography>
          <Box sx={{ mr: 3 }}>
            <Slider
              value={pianoSettings.startNote}
              onChange={handleSliderChange('startNote')}
              aria-labelledby="startNote"
              min={0}
              max={127}
            />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="keyWidth" gutterBottom>
            Key Width:
          </Typography>
          <Box sx={{ mr: 3 }}>
            <Slider
              value={pianoSettings.keyWidth}
              onChange={handleSliderChange('keyWidth')}
              aria-labelledby="keyWidth"
              step={0.001}
              min={0.015}
              max={0.1}
            />
          </Box>
        </Box>
      </Grid>
    </>
  );
}

export default PianoSettings;
