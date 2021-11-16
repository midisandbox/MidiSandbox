import {
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { Box, Theme } from '@mui/system';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import {
  MidiBlockData,
  midiWidgets,
  selectMidiBlockById,
  updateOneMidiBlock,
} from '../midiBlock/midiBlockSlice';
import { selectAllMidiChannels } from '../midiListener/midiChannelSlice';
import { selectAllMidiInputs } from '../midiListener/midiInputSlice';
import PianoSettings from './PianoSettings';
import { createStyles, makeStyles } from '@mui/styles';

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
  const classes = useStyles();
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
        const selectedInput = inputs.find((input) => input.id === value);
        if (selectedInput) {
          sideEffects.channelId = selectedInput.channelIds[0];
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

  const renderWidgetSettings = () => {
    let settings = null;
    if (block.widget === 'Piano') settings = <PianoSettings block={block} />;
    if(!settings) return null;
    return (
      <>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, mb: 1 }} />
        </Grid>
        {settings}
      </>
    );
  };

  return (
    <Box>
      <Grid sx={{ pl: 3, pr: 3 }} container rowSpacing={2}>
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-input-label">MIDI Input</InputLabel>
            <Select
              labelId="block-input-label"
              value={block.inputId}
              label="MIDI Input"
              onChange={handleSelectChange('inputId')}
              MenuProps={selectMenuProps}
            >
              {inputs.map((input) => (
                <MenuItem key={input.id} value={input.id}>
                  {`${input.name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-channel-label">Channel</InputLabel>
            <Select
              labelId="block-channel-label"
              value={block.channelId}
              label="Channel"
              onChange={handleSelectChange('channelId')}
              MenuProps={selectMenuProps}
            >
              {!block.inputId && (
                <MenuItem
                  key={`channel-options-empty`}
                  value={`channel-options-empty`}
                  disabled
                >
                  {`Select an Input before choosing the channel.`}
                </MenuItem>
              )}
              {channelOptions.map((channel) => (
                <MenuItem key={channel.id} value={channel.id}>
                  {`${channel.number}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="block-widget-label">Widget</InputLabel>
            <Select
              labelId="block-widget-label"
              value={block.widget}
              label="Widget"
              onChange={handleSelectChange('widget')}
              MenuProps={selectMenuProps}
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    select: {
      marginBottom: theme.spacing(2),
    },
  })
);
const selectMenuProps = {
  PaperProps: {
    sx: {
      ml: 3,
    },
  },
};
