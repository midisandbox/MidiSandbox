import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { MidiBlockData } from '../midiBlock/midiBlockSlice';
import {
  keyOptions,
  selectChannelKey,
  updateOneMidiChannel,
} from '../midiListener/midiChannelSlice';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from './BlockSettingsDrawer';

interface KeySettingsProps {
  block: MidiBlockData;
}
function KeySettings({ block }: KeySettingsProps) {
  const dispatch = useAppDispatch();
  const classes = useBlockSettingStyles();
  const selectedKey = useTypedSelector((state) =>
    selectChannelKey(state, block.channelId)
  );

  const handleKeyChange = (e: SelectChangeEvent) => {
    const {
      target: { value },
    } = e;
    dispatch(
      updateOneMidiChannel({
        id: block.channelId,
        changes: {
          selectedKey: value as typeof keyOptions[number],
        },
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
            value={selectedKey}
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
