import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import {
  BasicAudioPlayer,
  LinearTimingSource,
  OpenSheetMusicDisplay as OSMD,
  PlaybackManager,
} from 'osmd-extended';
import {
  BlockTheme,
  ColorSettingsT,
  OSMDSettingsT,
} from '../../../utils/helpers';
import { SxPropDict } from '../../../utils/types';

export interface OSMDViewProps {
  channelId: string;
  containerWidth: number;
  containerHeight: number;
  hover: boolean;
  osmdSettings: OSMDSettingsT;
  colorSettings: ColorSettingsT;
  blockTheme: BlockTheme;
}

export const audioPlaybackControl = function (osmd: OSMD) {
  const timingSource = new LinearTimingSource();
  const audioMetronomePlayer = {
    playFirstBeatSample: (volume: number) => {},
    playBeatSample: (volume: number) => {},
  };
  const playbackManager = new PlaybackManager(
    timingSource,
    audioMetronomePlayer,
    new BasicAudioPlayer(),
    { MessageOccurred: undefined }
  );
  playbackManager.DoPlayback = true;
  playbackManager.DoPreCount = false;
  playbackManager.PreCountMeasures = 1; // note that DoPreCount has to be true for a precount to happen

  const initialize = () => {
    timingSource.reset();
    timingSource.pause();
    timingSource.Settings = osmd.Sheet.SheetPlaybackSetting;
    playbackManager.initialize(osmd.Sheet.MusicPartManager);
    playbackManager.addListener(osmd.cursor);
    playbackManager.reset();
    osmd.PlaybackManager = playbackManager;
    playbackManager.Metronome.Audible = true;
    playbackManager.bpmChanged(osmd.Sheet.DefaultStartTempoInBpm);
  };

  initialize();
  return playbackManager;
};

export function errorLoadingOrRenderingSheet(
  e: Error,
  loadingOrRenderingString: string
) {
  console.warn(
    `Error ${loadingOrRenderingString} sheet: ${e} \nStackTrace: \n${e.stack}`
  );
}

const buttonBackground = '#212121';

export const useOSMDStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      overflow: 'scroll',
      padding: theme.spacing(5),
    },
    iconButton: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      borderRadius: '50%',
      width: theme.spacing(10),
      height: theme.spacing(10),
      minWidth: 0,
      padding: 0,
    },
    osmdButtonCont: {
      position: 'absolute',
      textAlign: 'center',
      display: 'flex',
      bottom: theme.spacing(1),
      left: 0,
      right: 0,
      justifyContent: 'center',
    },
    buttonGroup: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    buttonGroupItem: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      border: '0 !important',
    },
    buttonGroupText: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      margin: '0 -2px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  })
);
