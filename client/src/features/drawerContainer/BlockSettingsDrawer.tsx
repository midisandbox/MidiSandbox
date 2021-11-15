import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
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

export interface BlockSettingsDrawerData {
  blockId: string;
}
export interface BlockSettingsDrawerProps {
  drawerData: BlockSettingsDrawerData;
  handleDrawerClose: Function;
}
export default function BlockSettingsDrawer({
  drawerData,
  handleDrawerClose,
}: BlockSettingsDrawerProps) {
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

  return (
    <Grid sx={{ p: 1 }} container spacing={0}>
      <Grid item xs={12}>
        <FormControl sx={styles.formControl}>
          <InputLabel id="block-input-label">Input</InputLabel>
          <Select
            labelId="block-input-label"
            value={block.inputId}
            label="Input"
            onChange={handleSelectChange('inputId')}
            MenuProps={selectMenuProps}
          >
            {inputs.map((input) => (
              <MenuItem key={input.id} value={input.id}>
                {`${input.name}`}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Select the input for this Midi Block</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl sx={styles.formControl}>
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
          <FormHelperText>
            Select the channel this block should listen to
          </FormHelperText>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl sx={styles.formControl}>
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
    </Grid>
  );
}

const styles = {
  modalHeader: {
    mb: 5,
  },
  formControl: {
    mb: 5,
    width: 'calc(100%)',
  },
};
const selectMenuProps = {
  PaperProps: {
    sx: {
      ml: 3,
    },
  },
};
