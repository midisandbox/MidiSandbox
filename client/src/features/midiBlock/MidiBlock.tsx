import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box } from '@mui/system';
import React from 'react';
import WidgetLayout from '../midiWidget/WidgetLayout';
import { MidiBlockData } from './midiBlockSlice';

export interface MidiBlockProps {
  block: MidiBlockData;
}
const MidiBlock = ({ block }: MidiBlockProps) => {
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
      <Box sx={{ width: 'auto', overflow: 'hidden' }}>
        <WidgetLayout
          key={`${block.id}-${block.layout.h}-${block.layout.w}`}
          blockId={block.id}
        />
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
