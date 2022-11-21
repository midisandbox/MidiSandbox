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
import { midiWidgets, widgetModules } from '../../utils/utils';
import {
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
import ReactGA from 'react-ga4';
import MidiFilePlayerSettings from './MidiFilePlayerSettings';

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
    let widgetSettingComponent: JSX.Element | null = null;
    let widgetsWithBlockTheme = [
      'Circle Of Fifths',
      'Chord Estimator',
      'Grand Staff',
      'Tonnetz',
      'Sheet Music',
      'Midi File Player',
    ];
    let widgetsWithMidiInput = [
      'Piano',
      'Circle Of Fifths',
      'Grand Staff',
      'Chord Estimator',
      'Sheet Music',
      'Tonnetz',
    ];
    let widgetsWithKeySettings = ['Grand Staff', 'Tonnetz', 'Chord Estimator'];
    let widgetsWithColorSettings = ['Piano', 'Circle Of Fifths', 'Tonnetz'];

    // get settings for selected widgetModule (if applicable)
    for (let key in widgetModules) {
      const widgetModule = widgetModules[key];
      if (widgetModule.includeBlockSettings.includes('Block Theme'))
        widgetsWithBlockTheme.push(widgetModule.name);
      if (widgetModule.includeBlockSettings.includes('Midi Input'))
        widgetsWithMidiInput.push(widgetModule.name);
      if (widgetModule.includeBlockSettings.includes('Key'))
        widgetsWithKeySettings.push(widgetModule.name);
      if (widgetModule.includeBlockSettings.includes('Color'))
        widgetsWithColorSettings.push(widgetModule.name);
      if (block.widget === widgetModule.name && widgetModule.SettingComponent) {
        let WidgetElement = widgetModule.SettingComponent;
        widgetSettingComponent = (
          <WidgetElement
            key={`${widgetModule.name}-setting-${block.id}`}
            block={block}
            widgetSettings={block.widgetSettings}
          />
        );
      }
    }

    if (widgetsWithBlockTheme.includes(block.widget)) {
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
    if (widgetsWithMidiInput.includes(block.widget)) {
      result = result.concat([
        <SelectMidiInputChannel
          key={`block-input-channel-${block.id}`}
          source={block.id}
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
    if (widgetsWithKeySettings.includes(block.widget)) {
      result.push(<KeySettings key={`key-setting-${block.id}`} />);
    }
    // add widget settings after the midi input settings
    if (widgetSettingComponent) {
      result = result.concat([widgetSettingComponent]);
    }
    if (block.widget === 'Piano') {
      result = result.concat([
        // <Grid key="piano-divider" item xs={12}>
        //   <DividerWithText hideBorder>Piano Settings</DividerWithText>
        // </Grid>,
        <PianoSettings key={`piano-setting-${block.id}`} block={block} />,
      ]);
    }
    if (block.widget === 'Grand Staff') {
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
    if (block.widget === 'Midi File Player') {
      result = result.concat([
        <MidiFilePlayerSettings
          key={`midi-player-setting-${block.id}`}
          block={block}
        />,
      ]);
    }
    if (widgetsWithColorSettings.includes(block.widget)) {
      result.push(
        <ColorSettings key={`color-setting-${block.id}`} block={block} />
      );
    }
    return result;
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={4}>
      <Grid item xs={12}>
        <FormControl
          className={`${classes.select} widget-selector`}
          size="small"
          fullWidth
        >
          <InputLabel id="block-widget-label">Widget</InputLabel>
          <Select
            labelId="block-widget-label"
            value={block.widget}
            label="Widget"
            onChange={(e) => {
              const newWidget = e.target.value as typeof midiWidgets[number];
              ReactGA.event({
                category: 'interaction',
                action: 'widget selection',
                label: newWidget,
              });
              handleSelectChange({
                widget: newWidget,
                // reset generic widgetSettings to default of newly selected widget
                ...(newWidget in widgetModules && {
                  widgetSettings: widgetModules[newWidget].defaultSettings,
                }),
              });
            }}
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
