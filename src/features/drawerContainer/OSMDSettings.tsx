import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../styles/styleHooks';
import { updateOneMidiBlock } from '../../redux/slices/midiBlockSlice';
import { OSMDFileSelector } from '../widgets/OSMDView/OSMDUtils';
import { DrawerFooter } from './DrawerFooter';
import { InputLabel } from '@mui/material';
import SelectMidiOutputChannel from './SelectMidiOutputChannel';

interface OSMDSettingsProps {
  block: MidiBlockT;
}
function OSMDSettings({ block }: OSMDSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const [osmdSettings, setOSMDSettings] = useState(block.osmdSettings);
  const [settingChanged, setSettingChanged] = useState(false);
  const cursorMatchOptions: CursorMatchOption[] = ['All', 'Treble', 'Bass'];

  useEffect(() => {
    setOSMDSettings(block.osmdSettings);
  }, [block.osmdSettings]);

  const saveChanges = () => {
    setSettingChanged(false);
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          osmdSettings: osmdSettings,
        },
      })
    );
  };

  const updateSettings = (updatedOSMDSettings: OSMDSettingsT) => {
    setSettingChanged(true);
    setOSMDSettings(updatedOSMDSettings);
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

  const handleSelectChange =
    (setting: keyof OSMDSettingsT) => (e: SelectChangeEvent) => {
      updateSettings({
        ...osmdSettings,
        [setting]: e.target.value,
      });
    };

  const selectTextOnFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    event.target.select();

  return (
    <>
      {/* <Grid key="osmd-divider" item xs={12}>
        <DividerWithText hideBorder>Sheet Music Settings</DividerWithText>
      </Grid> */}
      <Grid item xs={12}>
        <SelectMidiOutputChannel
          source="osmd-settings"
          outputId={osmdSettings.midiOutputId}
          channel={osmdSettings.midiOutputChannel}
          handleOutputChannelChange={(
            newOutputId: string,
            newChannel: string
          ) =>
            updateSettings({
              ...osmdSettings,
              midiOutputId: newOutputId,
              midiOutputChannel: newChannel,
            })
          }
        />
      </Grid>

      <Grid item xs={12}>
        <OSMDFileSelector osmdSettings={osmdSettings} blockId={block.id} />
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
          <Box sx={{ mr: 3 }}>
            <Slider
              value={osmdSettings.zoom}
              onChange={handleSliderChange('zoom')}
              aria-labelledby="zoom"
              step={0.05}
              min={0.25}
              max={3}
            />
          </Box>
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
          onClick={handleCheckboxClick('iterateCursorOnInput')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox
            disabled={!osmdSettings.showCursor}
            checked={osmdSettings.iterateCursorOnInput}
          />
          <Typography variant="body1">Iterate Cursor On Input Match</Typography>
          <Tooltip
            arrow
            title="If the notes pressed on your midi input match the notes under the cursor, then iterate to the next note(s)."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
          </Tooltip>
        </Box>
      </Grid>
      {osmdSettings.iterateCursorOnInput && (
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel
              sx={{ padding: 0, textAlign: 'left' }}
              id="cursor-match-clefs-label"
            >
              <Box sx={{ display: 'flex' }}>
                <div>Cursor Match Clef(s)</div>
                <Tooltip
                  arrow
                  title="The cursor will iterate when your midi input matches the notes in the selected clefs. Change this setting if you only want to practice the notes on a single clef."
                  placement="top"
                >
                  <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
                </Tooltip>
              </Box>
            </InputLabel>
            <Select
              labelId="cursor-match-clefs-label"
              value={osmdSettings.cursorMatchClefs}
              label="Cursor Match Clef(s)"
              onChange={handleSelectChange('cursorMatchClefs')}
              MenuProps={blockSettingMenuProps}
            >
              {cursorMatchOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {/* <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('drawTitle')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.drawTitle} />
          <Typography variant="body1">Show Title</Typography>
        </Box>
      </Grid> */}
      {/* <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('colorNotes')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={osmdSettings.colorNotes} />
          <Typography variant="body1">Color Notes</Typography>
        </Box>
      </Grid> */}
      {settingChanged && (
        <DrawerFooter>
          <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', zIndex: 1 }}>
            <Button
              sx={{ width: '100%' }}
              onClick={saveChanges}
              variant="contained"
            >
              Save Changes
            </Button>
          </Box>
        </DrawerFooter>
      )}
    </>
  );
}

export default OSMDSettings;
