import { Box } from '@mui/system';
import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { YoutubePlayerSettingsT } from '../../utils/helpers';

interface YoutubePlayerProps {
  containerWidth: number;
  containerHeight: number;
  youtubePlayerSettings: YoutubePlayerSettingsT;
}
const YoutubePlayer = React.memo(
  ({
    youtubePlayerSettings,
    containerWidth,
    containerHeight,
  }: YoutubePlayerProps) => {
    const url = youtubePlayerSettings.url;
    if (!url.includes('v=')) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          Please provide a valid youtube url in the settings.
        </Box>
      );
    }
    const videoId = url.split('v=')[1].substring(0, 11);

    const opts: YouTubeProps['opts'] = {
      height: `${containerHeight}px`,
      width: `${containerWidth}px`,
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
      },
    } as const;

    return <YouTube videoId={videoId} opts={opts} />;
  }
);

export default YoutubePlayer;
