import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Checkbox,
  FormControl,
  Grid,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../app/store';
import { useBlockSettingStyles } from '../../../assets/styles/styleHooks';
import { OSMDSettingsT } from '../../../utils/helpers';
import { MidiBlockT, updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';
import DividerWithText from '../../utilComponents/DividerWithText';
import OSMDFileSelector from './OSMDFileSelector';

interface OSMDSettingsProps {
  block: MidiBlockT;
}
function OSMDSettings({ block }: OSMDSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const [osmdSettings, setOSMDSettings] = useState(block.osmdSettings);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSettingsUpdate = useCallback(
    debounce((updatedOSMDSettings: OSMDSettingsT) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            osmdSettings: updatedOSMDSettings,
          },
        })
      );
    }, 500),
    []
  );

  const updateSettings = (updatedOSMDSettings: OSMDSettingsT) => {
    setOSMDSettings(updatedOSMDSettings);
    debouncedSettingsUpdate(updatedOSMDSettings);
  };

  const handleSliderChange =
    (setting: keyof OSMDSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      updateSettings({
        ...osmdSettings,
        [setting]: newValue as number,
      });
    };

  const handleCheckboxClick = (setting: keyof OSMDSettingsT) => () => {
    updateSettings({
      ...osmdSettings,
      [setting]: !osmdSettings[setting],
    });
  };

  const handleInputChange =
    (setting: keyof OSMDSettingsT) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateSettings({
        ...osmdSettings,
        [setting]: parseInt(event.target.value),
      });
    };

  const selectTextOnFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    event.target.select();

  return (
    <>
      <Grid key="osmd-divider" item xs={12}>
        <DividerWithText hideBorder>Sheet Music Settings</DividerWithText>
      </Grid>

      <Grid item xs={12}>
        <OSMDFileSelector blockId={block.id} osmdSettings={block.osmdSettings} />
      </Grid>

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
            <Typography component="span" fontWeight={500}>
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
          onClick={handleCheckboxClick('showCursor')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.showCursor} />
          <Typography variant="body1">Show Audio Player</Typography>
          <Tooltip
            arrow
            title="If enabled, cursor also moves when correct notes are hit on selected midi input."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
          </Tooltip>
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
