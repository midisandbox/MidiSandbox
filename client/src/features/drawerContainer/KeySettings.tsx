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
import { keyOptions } from '../../utils/helpers';
import { MidiBlockData } from '../midiBlock/midiBlockSlice';
import {
  selectChannelKey,
  updateOneMidiChannel,
} from '../midiListener/midiListenerSlice';
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
          selectedKeyUsesSharps: ['C', 'G', 'D', 'A', 'E', 'B', 'F#'].includes(value)
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
