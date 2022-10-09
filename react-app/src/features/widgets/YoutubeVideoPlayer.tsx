import { Box } from '@mui/system';
import React, { useEffect } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';

import { YoutubeVideoPlayerSettingsT } from '../../utils/helpers';
import { useRef } from 'react';
import { selectGlobalSettings } from '../../app/globalSettingsSlice';
import { useTypedSelector } from '../../app/store';

interface YoutubeVideoPlayerProps {
  blockId: string;
  containerWidth: number;
  containerHeight: number;
  youtubePlayerSettings: YoutubeVideoPlayerSettingsT;
}
const YoutubeVideoPlayer = React.memo(
  ({
    blockId,
    youtubePlayerSettings,
    containerWidth,
    containerHeight,
  }: YoutubeVideoPlayerProps) => {
    const url = youtubePlayerSettings.url;
    const videoId = youtube_parser(url);
    const youtubePlayer = useRef<YouTubePlayer>();
    const globalSettings = useTypedSelector(selectGlobalSettings);

    useEffect(() => {
      youtubePlayer.current?.setVolume(youtubePlayerSettings.volume);
    }, [youtubePlayerSettings.volume]);

    // handle playbackIsPlaying changes
    useEffect(() => {
      if (youtubePlayerSettings.listenGlobalPlayback) {
        if (globalSettings.playbackIsPlaying) {
          youtubePlayer.current?.seekTo(
            youtubePlayerSettings.globalPlaybackStartOffset +
              globalSettings.playbackSeekSeconds
          );
          youtubePlayer.current?.playVideo();
        } else {
          youtubePlayer.current?.pauseVideo();
        }
      }
    }, [
      youtubePlayerSettings.globalPlaybackStartOffset,
      youtubePlayerSettings.listenGlobalPlayback,
      globalSettings.playbackIsPlaying,
      globalSettings.playbackSeekSeconds,
    ]);

    // handle playbackSeekVersion changes
    useEffect(() => {
      if (youtubePlayerSettings.listenGlobalPlayback) {
        youtubePlayer.current?.seekTo(
          youtubePlayerSettings.globalPlaybackStartOffset +
            globalSettings.playbackSeekSeconds
        );
        youtubePlayer.current?.playVideo();

        if (globalSettings.playbackSeekAutoplay === false) {
          youtubePlayer.current?.pauseVideo();
        }
      }
    }, [
      youtubePlayerSettings.globalPlaybackStartOffset,
      youtubePlayerSettings.listenGlobalPlayback,
      globalSettings.playbackSeekSeconds,
      globalSettings.playbackSeekAutoplay,
      globalSettings.playbackSeekVersion,
    ]);

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

    let youtubeStyle = {};
    if (youtubePlayerSettings.videoFit === 'cover') {
      // calculate the "bottom" css value based on verticalScroll, aspect ratio, and container width/height
      const aspectRatioDelta = Math.abs(
        9 / 16 - containerHeight / containerWidth
      );
      const bottomPercent =
        ((youtubePlayerSettings.verticalScroll / 100) *
          (aspectRatioDelta * containerWidth)) /
        (containerHeight / 100);

      youtubeStyle = {
        position: 'relative',
        paddingBottom: '56.25%',
        overflow: 'scroll',
        bottom: `${bottomPercent}%`,
      };
    }

    const opts: YouTubeProps['opts'] = {
      height: `${containerHeight}px`,
      width: `${containerWidth}px`,
      playerVars: {
        rel: 0,
        // https://developers.google.com/youtube/player_parameters
      },
    } as const;
    return (
      <YouTube
        videoId={videoId}
        iframeClassName={'youtube-player-iframe'}
        opts={opts}
        style={youtubeStyle}
        onReady={(e) => {
          youtubePlayer.current = e.target;
          youtubePlayer.current.setVolume(youtubePlayerSettings.volume);
          youtubePlayer.current.seekTo(
            youtubePlayerSettings.globalPlaybackStartOffset +
              globalSettings.playbackSeekSeconds
          );
          youtubePlayer.current.playVideo();
          youtubePlayer.current.pauseVideo();
        }}
      />
    );
  }
);

function youtube_parser(url: string) {
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
}

export default YoutubeVideoPlayer;
