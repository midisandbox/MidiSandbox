import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback } from 'react';
import { updateOneMidiBlock } from '../../../redux/slices/midiBlockSlice';
import { useAppDispatch } from '../../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../styles/styleHooks';
import DebouncedSlider from '../../utilComponents/DebouncedSlider';
import { ExampleWidgetSettingsT } from './ExampleWidget';

export default function ExampleWidgetSettings({
  block,
  widgetSettings,
}: {
  block: MidiBlockT;
  widgetSettings: ExampleWidgetSettingsT;
}) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();

  const updateSetting = useCallback(
    (setting: keyof ExampleWidgetSettingsT, value: any) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            widgetSettings: {
              ...widgetSettings,
              [setting]: value,
            },
          },
        })
      );
    },
    [block.id, widgetSettings, dispatch]
  );

  const handleInputChange =
    (setting: keyof ExampleWidgetSettingsT, isNumber = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      updateSetting(setting, isNumber ? parseFloat(newVal) : newVal);
    };

  const handleSelectChange =
    (setting: keyof ExampleWidgetSettingsT) => (e: SelectChangeEvent) => {
      updateSetting(setting, e.target.value);
    };

  const handleCheckboxClick = (setting: keyof ExampleWidgetSettingsT) => () => {
    updateSetting(setting, !widgetSettings[setting]);
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <TextField
            size="small"
            label="Example Textfield"
            value={widgetSettings.exampleTextSetting}
            onChange={handleInputChange('exampleTextSetting')}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
              e.target.select()
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <DebouncedSlider
          value={widgetSettings.exampleSliderSetting}
          min={0}
          max={100}
          label="Example Slider"
          valueSuffix="%"
          onCommitChange={(newVal) =>
            updateSetting('exampleSliderSetting', newVal)
          }
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel
            sx={{ padding: 0, textAlign: 'left' }}
            id="example-selector-label"
          >
            Example Selector
          </InputLabel>
          <Select
            labelId="example-selector-label"
            value={widgetSettings.exampleSelectSetting}
            label="Example Selector"
            onChange={handleSelectChange('exampleSelectSetting')}
            MenuProps={blockSettingMenuProps}
          >
            {['Option 1', 'Option 2'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('exampleCheckboxSetting')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={widgetSettings.exampleCheckboxSetting} />
          <Typography variant="body1">Example Checkbox Setting</Typography>
        </Box>
      </Grid>
    </>
  );
}
