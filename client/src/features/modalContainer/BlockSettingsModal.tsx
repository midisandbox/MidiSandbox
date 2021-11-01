import {
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel, MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import {
  selectMidiBlockById,
  updateOneMidiBlock
} from '../midiBlock/midiBlockSlice';
import { selectAllMidiChannels } from '../midiListener/midiChannelSlice';
import { selectAllMidiInputs } from '../midiListener/midiInputSlice';

export interface BlockSettingsModalData {
  blockId: string;
}
export interface BlockSettingsModalProps {
  modalData: BlockSettingsModalData;
  handleClose: Function;
}
export default function BlockSettingsModal({
  modalData,
  handleClose,
}: BlockSettingsModalProps) {
  const { blockId } = modalData;
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  const inputs = useTypedSelector(selectAllMidiInputs);
  const channels = useTypedSelector(selectAllMidiChannels);
  const dispatch = useAppDispatch();
  const [selectedInputId, setSelectedInputId] = useState(block?.inputId);
  const [selectedChannelIds, setSelectedChannelIds] = useState(
    block ? block.channelIds : []
  );

  if (!block) {
    console.error(`Unable to find block with blockId: ${blockId}`);
    return null;
  }

  const channelOptions = channels.filter(
    (channel) => channel.inputId === selectedInputId
  );

  const saveSettings = () => {
    dispatch(
      updateOneMidiBlock({
        id: blockId,
        changes: {
          inputId: selectedInputId,
          channelIds: selectedChannelIds,
        },
      })
    );
    handleClose();
  };

  const handleInputChange = (e: SelectChangeEvent) => {
    const {
      target: { value },
    } = e;
    setSelectedInputId(value);
    // if selected input changes then automatically set block.channelIds equal to all of the input's channels
    const selectedInput = inputs.find((input) => input.id === value);
    if (selectedInput) {
      setSelectedChannelIds(selectedInput.channelIds);
    }
  };

  const handleChannelsChange = (
    e: SelectChangeEvent<typeof selectedChannelIds>
  ) => {
    const {
      target: { value },
    } = e;
    setSelectedChannelIds(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Typography
        sx={modalStyles.modalHeader}
        id="transition-modal-title"
        variant="h6"
        component="h2"
      >
        Midi Block Settings
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl sx={modalStyles.formControl}>
            <InputLabel id="block-input-label">Input</InputLabel>
            <Select
              labelId="block-input-label"
              value={selectedInputId}
              label="Input"
              onChange={handleInputChange}
            >
              {inputs.map((input) => (
                <MenuItem key={input.id} value={input.id}>
                  {`${input.name}`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the input for this Midi Block
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl sx={modalStyles.formControl}>
            <InputLabel id="block-channels-label">Channels</InputLabel>
            <Select
              labelId="block-channels-label"
              multiple
              renderValue={(selected) =>
                selected
                  .map(
                    (channelId) =>
                      channelOptions.find((channel) => channel.id === channelId)
                        ?.number
                  )
                  .join(', ')
              }
              value={selectedChannelIds}
              label="Channels"
              onChange={handleChannelsChange}
            >
              {!selectedInputId && (
                <MenuItem
                  key={`channel-options-empty`}
                  value={`channel-options-empty`}
                  disabled
                >
                  {`Select an Input before choosing the channels.`}
                </MenuItem>
              )}
              {channelOptions.map((channel) => (
                <MenuItem key={channel.id} value={channel.id}>
                  <Checkbox
                    checked={selectedChannelIds.indexOf(channel.id) > -1}
                  />
                  {`${channel.number}`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the channels this block should listen to
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{float: 'right', mt: 2}}>
            <Button color='inherit' onClick={() => handleClose()}>Cancel</Button>
            <Button color="primary" onClick={saveSettings}>
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

const modalStyles = {
  modalHeader: {
    mb: 5,
  },
  formControl: {
    width: '100%',
    m: 1,
  },
};
