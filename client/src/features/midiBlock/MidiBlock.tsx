import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { SxPropDict } from '../../utils/types';
import { openModal } from '../modalContainer/modalContainerSlice';
import Piano from '../widgets/Piano';
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
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  const dispatch = useAppDispatch();
  const [hover, setHover] = useState(false);

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

  const renderWidget = () => {
    return <Piano blockId={blockId} />;
  };

  return (
    <Box
      onMouseEnter={handleHoverEvent(true)}
      onMouseLeave={handleHoverEvent(false)}
      key={block.id}
      sx={styles.midiBlockCont}
    >
      {renderWidget()}
      {hover && (
        <Box sx={styles.midiBlockUtilColumn}>
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
  },
  block_icon: {
    mb: 1,
  },
} as SxPropDict;

export default MidiBlock;
