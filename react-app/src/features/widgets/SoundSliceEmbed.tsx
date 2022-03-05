import { Box } from '@mui/system';
import React from 'react';

interface SoundSliceEmbedProps {
  containerWidth: number;
  containerHeight: number;
}
const SoundSliceEmbed = React.memo(
  ({ containerWidth, containerHeight }: SoundSliceEmbedProps) => {
    return (
      <Box sx={{marginLeft: '2px', marginTop: '2px'}}>
        <iframe
          title='SoundSlice Embed'
          src="https://www.soundslice.com/slices/1K2Mc/embed/?u=admin&layout=2"
          width={containerWidth-4}
          height={containerHeight-4}
          frameBorder="0"
        ></iframe>
      </Box>
    );
  }
);

export default SoundSliceEmbed;
