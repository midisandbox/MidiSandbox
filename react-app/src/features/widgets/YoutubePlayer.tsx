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
    const videoId = youtube_parser(url);
    if (!videoId) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          Please provide a valid youtube url in the widget settings.
        </Box>
      );
    }

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

function youtube_parser(url: string) {
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
}

export default YoutubePlayer;
