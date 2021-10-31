import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box } from '@mui/system';
import React from 'react';
import { useTypedSelector } from '../../app/store';
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

  if (!block) {
    console.error(`Could not find block! blockId: ${blockId}`);
    return null;
  }

  return (
    <Box
      key={block.id}
      sx={{ backgroundColor: 'grey.800', height: '100%', overflow: 'hidden' }}
    >
      <Box
        sx={{
          float: 'right',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          pr: 1,
          pb: 1,
        }}
      >
        <DragHandleOutlinedIcon
          sx={{ ...styles.block_icon, cursor: 'grab' }}
          className="blockDragHandle"
        />
        <SettingsOutlinedIcon sx={styles.block_icon} />
      </Box>
    </Box>
  );
};

const styles = {
  block_icon: {
    mb: 1,
  },
};

export default MidiBlock;
