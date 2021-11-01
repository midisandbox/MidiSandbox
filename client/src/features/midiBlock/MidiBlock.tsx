import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { openModal } from '../modalContainer/modalContainerSlice';
import { selectMidiBlockById } from './midiBlockSlice';
export interface MidiBlockProps {
  blockId: string;
  containerHeight: number;
  containerWidth: number;
}
const MidiBlock = ({
  blockId,
  containerHeight,
  containerWidth,
}: MidiBlockProps) => {
  const [hover, setHover] = useState(false);
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  const dispatch = useAppDispatch();
  const handleHoverEvent = (value: boolean) => () => {
    setHover(value);
  };

  if (!block) {
    console.error(`Could not find block! blockId: ${blockId}`);
    return null;
  }

  const openBlockSettings = () => {
    dispatch(openModal({ modalId: 'BLOCK_SETTINGS', modalData: { blockId } }));
  };

  return (
    <Box
      onMouseEnter={handleHoverEvent(true)}
      onMouseLeave={handleHoverEvent(false)}
      key={block.id}
      sx={styles.midiBlockCont}
    >
      <Box sx={{ backgroundColor: 'white', height: '100%', width: '100%' }}>
        CONTENT
      </Box>
      {hover && (
        <Box
          sx={{
            float: 'right',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            backgroundColor: '#00000052',
            height: '100%',
            pt: 1,
            pb: 1,
          }}
        >
          <DragHandleOutlinedIcon
            sx={{ ...styles.block_icon, cursor: 'grab' }}
            className="blockDragHandle"
          />
          <IconButton
            color="default"
            sx={styles.block_icon}
            onClick={openBlockSettings}
            aria-label="settings"
          >
            <SettingsOutlinedIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

const styles = {
  midiBlockCont: {
    backgroundColor: 'grey.800',
    height: '100%',
    overflow: 'hidden',
  },
  midiBlockUtilColumn: {
    float: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    pt: 1,
    pr: 1,
    pb: 1,
  },
  block_icon: {
    mb: 1,
  },
};

export default MidiBlock;
