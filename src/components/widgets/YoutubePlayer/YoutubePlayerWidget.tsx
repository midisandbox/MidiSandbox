import { Box } from '@mui/system';
import React, { useEffect } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { useRef } from 'react';
import { selectGlobalSettings } from '../../../redux/slices/globalSettingsSlice';
import { useTypedSelector } from '../../../redux/store';
import YoutubePlayerSettings from './YoutubePlayerSettings';

interface YoutubePlayerProps {
  block: MidiBlockT;
  containerWidth: number;
  containerHeight: number;
}
const YoutubePlayer = React.memo(
  ({ block, containerWidth, containerHeight }: YoutubePlayerProps) => {
    const youtubePlayerSettings = block.youtubePlayerSettings;
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

const exportObj: WidgetModule = {
  name: 'Youtube Player',
  Component: YoutubePlayer,
  SettingComponent: YoutubePlayerSettings,
  ButtonsComponent: null,
  defaultSettings: {}, // youtubePlayerSettings is handled on its own (not using widgetSettings)
  includeBlockSettings: [],
  orderWeight: 3, // used to determine the ordering of the options in the Widget selector
};

export default exportObj;
