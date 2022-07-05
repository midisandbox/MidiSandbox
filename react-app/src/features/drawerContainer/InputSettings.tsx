import { Checkbox, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { useBlockSettingStyles } from '../../assets/styles/styleHooks';
import { MidiInputT } from '../../utils/types';
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

  const dispatchInputUpdate = (changes: Partial<MidiInputT>) => {
    dispatch(
      updateOneMidiInput({
        id: inputId,
        changes: changes,
      })
    );
  };

  const handleCheckboxClick = (setting: keyof MidiInputT) => () => {
    dispatchInputUpdate({
      [setting]: !selectedInput[setting],
    });
  };

  // const handleOctaveChange = (value: number) => () => {
  //   dispatchInputUpdate({
  //     manualOctaveOffset: selectedInput.manualOctaveOffset + value,
  //   });
  // };

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
      {/* octave offset should not be needed if all widgets use midi standard */}
      {/* <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1">Octave:</Typography>
          <Typography variant="body1" color="secondary" sx={{ ml: 3, mr: 1 }}>
            {selectedInput.manualOctaveOffset}
          </Typography>
          <ButtonGroup
            sx={{
              mr: 1,
              ml: 1,
            }}
            disableElevation
            variant="text"
          >
            <Button
              className={classes.buttonGroupItem}
              sx={{
                borderTopLeftRadius: '50%',
                borderBottomLeftRadius: '50%',
              }}
              onClick={handleOctaveChange(-1)}
            >
              <RemoveIcon />
            </Button>
            <Button
              className={classes.buttonGroupItem}
              sx={{
                borderTopRightRadius: '50%',
                borderBottomRightRadius: '50%',
              }}
              onClick={handleOctaveChange(1)}
            >
              <AddIcon />
            </Button>
          </ButtonGroup>
        </Box>
      </Grid> */}
    </>
  );
}
