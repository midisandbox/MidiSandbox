import { Grid, Slider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';

interface StaffSettingsProps {
  block: MidiBlockT;
}
function StaffSettings({ block }: StaffSettingsProps) {
  const dispatch = useAppDispatch();
  const [staffSettings, setStaffSettings] = useState(block.staffSettings);

  const debouncedStoreUpdate = useMemo(
    () =>
      debounce((updatedStaffSettings: StaffSettingsT) => {
        dispatch(
          updateOneMidiBlock({
            id: block.id,
            changes: {
              staffSettings: updatedStaffSettings,
            },
          })
        );
      }, 500),
    [block.id, dispatch]
  );

  const handleSliderChange =
    (setting: keyof StaffSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      const updatedStaffSettings = {
        ...staffSettings,
        [setting]: newValue as number,
      };
      setStaffSettings(updatedStaffSettings);
      debouncedStoreUpdate(updatedStaffSettings);
    };

  return (
    <>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="verticalSpacing" gutterBottom>
            Vertical spacing:
            <Typography color="secondary" component="span" fontWeight={500}>
              {' '}
              {`${staffSettings.verticalSpacing}x`}
            </Typography>
          </Typography>
          <Slider
            value={staffSettings.verticalSpacing}
            onChange={handleSliderChange('verticalSpacing')}
            aria-labelledby="verticalSpacing"
            step={0.1}
            min={0}
            max={2}
          />
        </Box>
      </Grid>
    </>
  );
}

export default StaffSettings;
