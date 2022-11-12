import { Box, Grid, Slider, Typography } from '@mui/material';
import React from 'react';
import { useAppDispatch } from '../../app/store';
import { TonnetzSettingsT } from '../../utils/helpers';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';

interface TonnetzSettingsProps {
  block: MidiBlockT;
}
function TonnetzSettings({ block }: TonnetzSettingsProps) {
  const tonnetzSettings = block.tonnetzSettings;
  const dispatch = useAppDispatch();

  const handleSliderChange =
    (setting: keyof TonnetzSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            tonnetzSettings: {
              ...tonnetzSettings,
              [setting]: newValue as number,
            },
          },
        })
      );
    };

  return (
    <>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="zoom" gutterBottom>
            Zoom:
            <Typography component="span" fontWeight={500}>
              {' '}
              {`${tonnetzSettings.zoom}x`}
            </Typography>
          </Typography>
          <Box sx={{ mr: 3 }}>
            <Slider
              value={tonnetzSettings.zoom}
              onChange={handleSliderChange('zoom')}
              aria-labelledby="zoom"
              step={0.05}
              min={0.5}
              max={3}
            />
          </Box>
        </Box>
      </Grid>
    </>
  );
}

export default TonnetzSettings;
