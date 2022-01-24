import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Box, Theme } from '@mui/system';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { blockThemes, midiWidgets } from '../../utils/helpers';
import {
  MidiBlockData,
  selectMidiBlockById,
  updateOneMidiBlock,
} from '../midiBlock/midiBlockSlice';
import {
  selectAllMidiChannels,
  selectAllMidiInputs,
} from '../midiListener/midiListenerSlice';
import DividerWithText from '../utilComponents/DividerWithText';
import ColorSettings from './ColorSettings';
import InputSettings from './InputSettings';
import KeySettings from './KeySettings';
import OSMDSettings from './OSMDSettings';
import PianoSettings from './PianoSettings';

export interface BlockSettingsDrawerData {
  blockId: string;
}
interface BlockSettingsDrawerProps {
  drawerData: BlockSettingsDrawerData;
  handleDrawerClose: Function;
}
export default function BlockSettingsDrawer({
  drawerData,
  handleDrawerClose,
}: BlockSettingsDrawerProps) {
  const classes = useBlockSettingStyles();
  const { blockId } = drawerData;
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  const inputs = useTypedSelector(selectAllMidiInputs);
  const channels = useTypedSelector(selectAllMidiChannels);
  const dispatch = useAppDispatch();

  if (!block) {
    console.error(`Unable to find block with blockId: ${blockId}`);
    return null;
  }

  const channelOptions = channels.filter(
    (channel) => channel.inputId === block.inputId
  );

  const handleSelectChange =
    (setting: keyof MidiBlockData) => (e: SelectChangeEvent) => {
      const {
        target: { value },
      } = e;
      let sideEffects: Partial<MidiBlockData> = {};
      // if selected input changes then automatically select channel 1 of new input
      if (setting === 'inputId') {
        if (value === '') {
          sideEffects.channelId = '';
        } else {
          const selectedInput = inputs.find((input) => input.id === value);
          if (selectedInput) {
            sideEffects.channelId = selectedInput.channelIds[0];
          }
        }
      }

      dispatch(
        updateOneMidiBlock({
          id: blockId,
          changes: {
            [setting]: value,
            ...sideEffects,
          },
        })
      );
    };

  // change the displayed settings depending on the selected widget
  const renderWidgetSettings = () => {
    let result: JSX.Element[] = [];
    if (
      [
        'Circle Of Fifths',
        'Chord Estimator',
        'Staff',
        'Sheet Music Viewer',
      ].includes(block.widget)
    ) {
      result.push(
        <Grid key="block-theme-setting" item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-theme-label">Theme</InputLabel>
            <Select
              labelId="block-theme-label"
              value={block.theme}
              label="Theme"
              onChange={handleSelectChange('theme')}
              MenuProps={blockSettingMenuProps}
            >
              {blockThemes.map((theme) => (
                <MenuItem key={theme} value={theme}>
                  {theme}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }
    // only show the midi input and channel settings for these widgets
    if (
      [
        'Piano',
        'Circle Of Fifths',
        'Staff',
        'Chord Estimator',
        'Sheet Music Viewer',
      ].includes(block.widget)
    ) {
      result = result.concat([
        <Grid key="input-divider" item xs={12}>
          <DividerWithText hideBorder>Midi Input Settings</DividerWithText>
        </Grid>,
        <Grid key="input-setting" item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-input-label">MIDI Input</InputLabel>
            <Select
              labelId="block-input-label"
              value={block.inputId}
              label="MIDI Input"
              onChange={handleSelectChange('inputId')}
              MenuProps={blockSettingMenuProps}
            >
              <MenuItem value={''}>None</MenuItem>
              {inputs.map((input) => (
                <MenuItem key={input.id} value={input.id}>
                  {`${input.name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>,
        <Grid key="channel-setting" item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-channel-label">Channel</InputLabel>
            <Select
              labelId="block-channel-label"
              value={block.channelId}
              label="Channel"
              onChange={handleSelectChange('channelId')}
              MenuProps={blockSettingMenuProps}
            >
              {!block.inputId ? (
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
        </Grid>,
        <InputSettings key="input-settings" inputId={block.inputId} />,
      ]);
    }
    if (block.widget === 'Piano') {
      result = result.concat([
        <Grid key="piano-divider" item xs={12}>
          <DividerWithText hideBorder>Piano Settings</DividerWithText>
        </Grid>,
        <PianoSettings key="piano-setting" block={block} />,
      ]);
    }
    if (block.widget === 'Sheet Music Viewer') {
      result = result.concat([
        <Grid key="osmd-divider" item xs={12}>
          <DividerWithText hideBorder>Sheet Music Settings</DividerWithText>
        </Grid>,
        <OSMDSettings key="osmd-setting" block={block} />,
      ]);
    }
    if (['Staff', 'Chord Estimator'].includes(block.widget)) {
      result = result.concat([<KeySettings key="key-setting" block={block} />]);
    }
    // only show color settings for these widgets
    if (['Piano', 'Circle Of Fifths'].includes(block.widget)) {
      result.push(<ColorSettings key="color-setting" block={block} />);
    }
    return result;
  };

  return (
    <Box>
      <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-widget-label">Widget</InputLabel>
            <Select
              labelId="block-widget-label"
              value={block.widget}
              label="Widget"
              onChange={handleSelectChange('widget')}
              MenuProps={blockSettingMenuProps}
            >
              {midiWidgets.map((widget) => (
                <MenuItem key={widget} value={widget}>
                  {`${widget}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {renderWidgetSettings()}
      </Grid>
    </Box>
  );
}

export const useBlockSettingStyles = makeStyles((theme: Theme) =>
  createStyles({
    select: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
    checkbox: {
      marginBottom: theme.spacing(2),
    },
  })
);

export const blockSettingMenuProps = {
  PaperProps: {
    sx: {
      ml: 1,
    },
  },
};
