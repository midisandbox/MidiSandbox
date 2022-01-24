import { Checkbox, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { MidiInputT } from '../../utils/types';
import { useBlockSettingStyles } from './BlockSettingsDrawer';
import {
  selectMidiInputById,
  updateOneMidiInput,
} from '../midiListener/midiListenerSlice';

interface InputSettingsProps {
  inputId: string;
}
export default function InputSettings({ inputId }: InputSettingsProps) {
  const classes = useBlockSettingStyles();
  const selectedInput = useTypedSelector((state) =>
    selectMidiInputById(state, inputId)
  );
  const dispatch = useAppDispatch();

  if (!selectedInput) return null;

  const handleCheckboxClick = (setting: keyof MidiInputT) => () => {
    const changes = {
      [setting]: !selectedInput[setting],
    };
    dispatch(
      updateOneMidiInput({
        id: inputId,
        changes: changes,
      })
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('reversePedal')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={selectedInput.reversePedal} />
          <Typography variant="body1">Reverse Sustain Pedal</Typography>
        </Box>
      </Grid>
    </>
  );
}
