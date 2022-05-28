import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import {
  selectGlobalSettings,
  updateGlobalSetting,
} from '../../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../assets/styles/styleHooks';
import { checkKeySignatureUsesSharps, keyOptions } from '../../utils/helpers';

function KeySettings() {
  const dispatch = useAppDispatch();
  const classes = useBlockSettingStyles();
  const globalSettings = useTypedSelector(selectGlobalSettings);

  const handleKeyChange = (e: SelectChangeEvent) => {
    const {
      target: { value },
    } = e;
    const typedValue = value as typeof keyOptions[number];
    dispatch(
      updateGlobalSetting({
        globalKeySignature: typedValue,
        globalKeySignatureUsesSharps: checkKeySignatureUsesSharps(typedValue),
      })
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="channel-key-label">Key</InputLabel>
          <Select
            labelId="channel-key-label"
            value={globalSettings.globalKeySignature}
            label="Key"
            onChange={handleKeyChange}
            MenuProps={blockSettingMenuProps}
          >
            {keyOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}

export default KeySettings;
