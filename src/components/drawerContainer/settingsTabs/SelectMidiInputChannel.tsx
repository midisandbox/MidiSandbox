import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../styles/styleHooks';
import {
  selectAllMidiChannels,
  selectAllMidiInputs,
} from '../../../redux/slices/midiListenerSlice';

interface SelectMidiInputChannelProps {
  handleInputChannelChange(newInputId: string, newChannelId: string): void;
  inputId: string;
  channelId: string;
  source: string;
}
export default function SelectMidiInputChannel({
  inputId,
  channelId,
  handleInputChannelChange,
  source,
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
      {/* <Grid key="input-divider" item xs={12}>
        <DividerWithText hideBorder>Midi Input Settings</DividerWithText>
      </Grid> */}
      <Grid key="input-setting" item xs={12}>
        <Box sx={{ display: 'flex' }}>
          <FormControl
            id={`${source}-input-select`}
            className={classes.select}
            size="small"
            fullWidth
          >
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
                  {`No devices found. Try connecting a`}
                  <br />
                  {'midi device and refresh the page.'}
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
          <FormControl
            sx={{ width: '150px', ml: 2 }}
            className={classes.select}
            size="small"
            fullWidth
          >
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
        </Box>
      </Grid>
    </>
  );
}
