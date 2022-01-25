import {
  Grid,
  Slider,
  Typography,
  Checkbox,
  TextField,
  FormControl,
} from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { OSMDSettingsT } from '../../utils/helpers';
import { MidiBlockData, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
import { useBlockSettingStyles } from './BlockSettingsDrawer';

interface OSMDSettingsProps {
  block: MidiBlockData;
}
function OSMDSettings({ block }: OSMDSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const [osmdSettings, setOSMDSettings] = useState(block.osmdSettings);

  const dispatchSettingsUpdate = (updatedOSMDSettings: OSMDSettingsT) => {
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          osmdSettings: updatedOSMDSettings,
        },
      })
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStoreUpdate = useCallback(
    debounce((updatedOSMDSettings: OSMDSettingsT) => {
      dispatchSettingsUpdate(updatedOSMDSettings);
    }, 500),
    []
  );

  const handleSliderChange =
    (setting: keyof OSMDSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      const updatedOSMDSettings = {
        ...osmdSettings,
        [setting]: newValue as number,
      };
      setOSMDSettings(updatedOSMDSettings);
      debouncedStoreUpdate(updatedOSMDSettings);
    };

  const handleCheckboxClick = (setting: keyof OSMDSettingsT) => () => {
    const updatedOSMDSettings = {
      ...osmdSettings,
      [setting]: !osmdSettings[setting],
    };
    setOSMDSettings(updatedOSMDSettings);
    debouncedStoreUpdate(updatedOSMDSettings);
  };

  const handleInputChange =
    (setting: keyof OSMDSettingsT) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(event.target.value);
      const updatedOSMDSettings = {
        ...osmdSettings,
        [setting]: newValue,
      };
      setOSMDSettings(updatedOSMDSettings);
      debouncedStoreUpdate(updatedOSMDSettings);
    };

    const selectTextOnFocus = (event: React.FocusEvent<HTMLInputElement>) => event.target.select();

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <TextField
            size="small"
            label="Start Measure"
            type="number"
            value={osmdSettings.drawFromMeasureNumber}
            onChange={handleInputChange('drawFromMeasureNumber')}
            onFocus={selectTextOnFocus}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <TextField
            size="small"
            label="End Measure"
            helperText="0 will display all measures until the end"
            type="number"
            value={osmdSettings.drawUpToMeasureNumber}
            onChange={handleInputChange('drawUpToMeasureNumber')}
            onFocus={selectTextOnFocus}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="zoom" gutterBottom>
            Zoom:
            <Typography component="span" fontWeight={500} color="secondary">
              {' '}
              {`${osmdSettings.zoom}x`}
            </Typography>
          </Typography>
          <Slider
            value={osmdSettings.zoom}
            onChange={handleSliderChange('zoom')}
            aria-labelledby="zoom"
            step={0.25}
            min={0.25}
            max={3}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('drawTitle')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.drawTitle} />
          <Typography variant="body1">Show Title</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('horizontalStaff')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.horizontalStaff} />
          <Typography variant="body1">Horizontal Staff</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('showCursor')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.showCursor} />
          <Typography variant="body1">Show Cursor</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('colorNotes')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.colorNotes} />
          <Typography variant="body1">Color Notes</Typography>
        </Box>
      </Grid>
    </>
  );
}

export default OSMDSettings;
