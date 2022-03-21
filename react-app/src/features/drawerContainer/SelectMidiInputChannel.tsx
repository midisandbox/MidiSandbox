import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../assets/styles/styleHooks';
import {
  selectAllMidiChannels,
  selectAllMidiInputs,
} from '../midiListener/midiListenerSlice';
import DividerWithText from '../utilComponents/DividerWithText';

interface SelectMidiInputChannelProps {
  handleInputChannelChange(newInputId: string, newChannelId: string): void;
  inputId: string;
  channelId: string;
}
export default function SelectMidiInputChannel({
  inputId,
  channelId,
  handleInputChannelChange,
}: SelectMidiInputChannelProps) {
  const classes = useBlockSettingStyles();
  const inputs = useTypedSelector(selectAllMidiInputs);
  const channels = useTypedSelector(selectAllMidiChannels);
  const channelOptions = channels.filter(
    (channel) => channel.inputId === inputId
  );
  const inputIdValue = inputs.find((x) => x.id === inputId) ? inputId : '';
  const channelIdValue = channelOptions.find((x) => x.id === channelId)
    ? channelId
    : '';

  const handleChange = (
    setting: string,
    newInputId: string,
    newChannelId: string
  ) => {
    if (setting === 'inputId') {
      if (newInputId === '') {
        newChannelId = '';
      } else {
        const selectedInput = inputs.find((input) => input.id === newInputId);
        if (selectedInput) {
          newChannelId = selectedInput.channelIds[0];
        }
      }
    }
    return handleInputChannelChange(newInputId, newChannelId);
  };

  return (
    <>
      <Grid key="input-divider" item xs={12}>
        <DividerWithText hideBorder>Midi Input Settings</DividerWithText>
      </Grid>
      <Grid key="input-setting" item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="block-input-label">MIDI Input</InputLabel>
          <Select
            labelId="block-input-label"
            value={inputIdValue}
            label="MIDI Input"
            onChange={(e) =>
              handleChange('inputId', e.target.value, channelIdValue)
            }
            MenuProps={blockSettingMenuProps}
          >
            {inputs.length === 0 ? (
              <MenuItem
                key={`input-options-empty`}
                value={`input-options-empty`}
                disabled
              >
                {`Device not found, try connecting a device`}
                <br />
                {'and refresh the page.'}
              </MenuItem>
            ) : (
              <MenuItem value={''}>None</MenuItem>
            )}
            {inputs.map((input) => (
              <MenuItem key={input.id} value={input.id}>
                {`${input.name}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid key="channel-setting" item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="block-channel-label">Channel</InputLabel>
          <Select
            labelId="block-channel-label"
            value={channelIdValue}
            label="Channel"
            onChange={(e) =>
              handleChange('channelId', inputIdValue, e.target.value)
            }
            MenuProps={blockSettingMenuProps}
          >
            {!inputId ? (
              <MenuItem
                key={`channel-options-empty`}
                value={`channel-options-empty`}
                disabled
              >
                {`Select an Input before setting the channel.`}
              </MenuItem>
            ) : (
              <MenuItem value={''}>None</MenuItem>
            )}
            {channelOptions.map((channel) => (
              <MenuItem key={channel.id} value={channel.id}>
                {`${channel.number}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}