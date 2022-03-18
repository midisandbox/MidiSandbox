import { Box } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import {
  BasicAudioPlayer,
  LinearTimingSource,
  OpenSheetMusicDisplay as OSMD,
  PlaybackManager,
} from 'osmd-extended';
import { useTypedSelector } from '../../../app/store';
import { ColorSettingsT, OSMDSettingsT } from '../../../utils/helpers';
import { useGetSheetMusicQuery } from '../../api/apiSlice';
import { selectFileUploadById } from '../../fileUpload/fileUploadSlice';

export interface OSMDViewProps {
  osmdFile: any;
  channelId: string;
  containerWidth: number;
  containerHeight: number;
  hover: boolean;
  osmdSettings: OSMDSettingsT;
  colorSettings: ColorSettingsT;
}

// creates a new PlayBackManager and adds it to the passed osmd instance
export const addPlaybackControl = function (
  osmd: OSMD,
  drawFromMeasureNumber: number
) {
  const timingSource = new LinearTimingSource();
  timingSource.reset();
  timingSource.pause();
  timingSource.Settings = osmd.Sheet.SheetPlaybackSetting;
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
  // playbackManager.PreCountMeasures = 1; // note that DoPreCount has to be true for a precount to happen
  playbackManager.DoPreCount = false;
  playbackManager.DoPlayback = true;
  playbackManager.Metronome.Audible = true;
  playbackManager.initialize(osmd.Sheet.MusicPartManager);
  playbackManager.addListener(osmd.cursor);
  playbackManager.reset();
  playbackManager.bpmChanged(osmd.Sheet.DefaultStartTempoInBpm);
  playbackManager.addListener({
    pauseOccurred: (o) => {
      // loop playbackManager to start and continue playing when end is reached
      if (playbackManager.CursorIterator.EndReached) {
        playbackManager.setPlaybackStart(
          osmd.Sheet.SourceMeasures[Math.max(0, drawFromMeasureNumber - 1)]
            .AbsoluteTimestamp
        );
        playbackManager.play();
      }
    },
    cursorPositionChanged: (timestamp, data) => {},
    selectionEndReached: (o) => {},
    resetOccurred: (o) => {},
    notesPlaybackEventOccurred: (o) => {},
  });

  osmd.PlaybackManager = playbackManager;
};

export function errorLoadingOrRenderingSheet(
  e: Error,
  loadingOrRenderingString: string
) {
  console.warn(
    `Error ${loadingOrRenderingString} sheet: ${e} \nStackTrace: \n${e.stack}`
  );
}

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
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.secondary.contrastText,
      margin: '0 -2px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  })
);

export const withOSMDFile = (
  WrappedComponent: React.FunctionComponent<OSMDViewProps>
) => {
  const WithOSMDFile = (props: OSMDViewProps) => {
    const { osmdSettings } = props;
    const file = useTypedSelector((state) =>
      selectFileUploadById(state, osmdSettings.selectedFileId)
    );
    console.log('file: ', file);
    const fileUuid = file?.uuidFilename ? file.uuidFilename : '';
    const { data, error, isLoading } = useGetSheetMusicQuery(fileUuid, {
      skip: !fileUuid,
    });
    const osmdFile = data?.result ? atob(data?.result) : null;

    if (osmdFile === null) return <Box>No file selected</Box>;
    return <WrappedComponent {...props} osmdFile={osmdFile} />;
  };
  return WithOSMDFile;
};
