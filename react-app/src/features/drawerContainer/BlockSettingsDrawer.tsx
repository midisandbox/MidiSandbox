import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../assets/styles/styleHooks';
import { midiWidgets } from '../../utils/helpers';
import {
  MidiBlockT,
  selectMidiBlockById,
  themeModes,
  updateOneMidiBlock,
} from '../midiBlock/midiBlockSlice';
import ColorSettings from './ColorSettings';
import InputSettings from './InputSettings';
import OSMDSettings from './OSMDSettings';
import PianoSettings from './PianoSettings';
import SelectMidiInputChannel from './SelectMidiInputChannel';
import YoutubePlayerSettings from './YoutubePlayerSettings';
import TonnetzSettings from './TonnetzSettings';
import StaffSettings from './StaffSettings';
import CircleOfFifthsSettings from './CircleOfFifthsSettings';
import KeySettings from './KeySettings';
import ImageSettings from './ImageSettings';

export interface BlockSettingsDrawerData {
  blockId: string;
}
interface BlockSettingsDrawerProps {
  drawerData: BlockSettingsDrawerData;
}
export default function BlockSettingsDrawer({
  drawerData,
}: BlockSettingsDrawerProps) {
  const muiTheme = useTheme();
  const classes = useBlockSettingStyles();
  const { blockId } = drawerData;
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  const dispatch = useAppDispatch();

  if (!block) {
    // console.warn(`Unable to find block with blockId: ${blockId}`);
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          sx={{ color: muiTheme.palette.text.secondary }}
          variant="body1"
        >
          No block selected.
        </Typography>
      </Box>
    );
  }

  const handleSelectChange = (settingChanges: Partial<MidiBlockT>) => {
    dispatch(
      updateOneMidiBlock({
        id: blockId,
        changes: settingChanges,
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
        'Tonnetz',
        'Sheet Music',
      ].includes(block.widget)
    ) {
      result.push(
        <Grid key={`block-themeMode-setting-${block.id}`} item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-themeMode-label">Block Theme</InputLabel>
            <Select
              labelId="block-themeMode-label"
              value={block.themeMode}
              label="Block Theme"
              onChange={(e) =>
                handleSelectChange({
                  themeMode: e.target.value as typeof themeModes[number],
                })
              }
              MenuProps={blockSettingMenuProps}
            >
              {themeModes.map((themeMode) => (
                <MenuItem key={`${themeMode}-${block.id}`} value={themeMode}>
                  {themeMode[0].toUpperCase() + themeMode.substring(1)}
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
        'Sheet Music',
        'Tonnetz',
      ].includes(block.widget)
    ) {
      result = result.concat([
        <SelectMidiInputChannel
          key={`block-input-channel-${block.id}`}
          handleInputChannelChange={(
            newInputId: string,
            newChannelId: string
          ) =>
            handleSelectChange({ inputId: newInputId, channelId: newChannelId })
          }
          inputId={block.inputId}
          channelId={block.channelId}
        />,
        <InputSettings
          key={`input-settings-${block.id}`}
          inputId={block.inputId}
        />,
      ]);
    }
    if (block.widget === 'Piano') {
      result = result.concat([
        // <Grid key="piano-divider" item xs={12}>
        //   <DividerWithText hideBorder>Piano Settings</DividerWithText>
        // </Grid>,
        <PianoSettings key={`piano-setting-${block.id}`} block={block} />,
      ]);
    }
    if (block.widget === 'Staff') {
      result = result.concat([
        <StaffSettings key={`staff-setting-${block.id}`} block={block} />,
      ]);
    }
    if (block.widget === 'Sheet Music') {
      result = result.concat([
        <OSMDSettings key={`osmd-setting-${block.id}`} block={block} />,
      ]);
    }
    if (['Tonnetz'].includes(block.widget)) {
      result.push(
        <TonnetzSettings key={`tonnetz-setting-${block.id}`} block={block} />
      );
    }
    if (['Circle Of Fifths'].includes(block.widget)) {
      result.push(
        <CircleOfFifthsSettings
          key={`circle-of-fifths-setting-${block.id}`}
          block={block}
        />
      );
    }
    if (['Staff', 'Tonnetz', 'Chord Estimator'].includes(block.widget)) {
      result.push(<KeySettings key={`key-setting-${block.id}`} />);
    }
    // only show color settings for these widgets
    if (['Piano', 'Circle Of Fifths', 'Tonnetz'].includes(block.widget)) {
      result.push(
        <ColorSettings key={`color-setting-${block.id}`} block={block} />
      );
    }
    if (['Youtube Player'].includes(block.widget)) {
      result.push(
        <YoutubePlayerSettings
          key={`youtube-player-setting-${block.id}`}
          block={block}
        />
      );
    }
    if (block.widget === 'Image') {
      result = result.concat([
        <ImageSettings key={`image-setting-${block.id}`} block={block} />,
      ]);
    }
    return result;
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="block-widget-label">Widget</InputLabel>
          <Select
            labelId="block-widget-label"
            value={block.widget}
            label="Widget"
            onChange={(e) =>
              handleSelectChange({
                widget: e.target.value as typeof midiWidgets[number],
              })
            }
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
  );
}
