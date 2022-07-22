import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, Tooltip } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import { Storage } from 'aws-amplify';

import {
  BasicAudioPlayer,
  LinearTimingSource,
  OpenSheetMusicDisplay as OSMD,
  PlaybackManager,
} from 'osmd-extended';
import React, { useEffect, useState } from 'react';
import Soundfont from 'soundfont-player';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationDispatch } from '../../../app/hooks';
import { useAppDispatch } from '../../../app/store';
import { ColorSettingsT, OSMDSettingsT } from '../../../utils/helpers';
import { SxPropDict } from '../../../utils/types';
import FileSelector from '../../drawerContainer/FileSelector';
import {
  MidiBlockT,
  themeModes,
  updateOneMidiBlock,
} from '../../midiBlock/midiBlockSlice';
export interface OSMDViewProps {
  blockId: string;
  osmdFile: any;
  channelId: string;
  hover: boolean;
  osmdSettings: OSMDSettingsT;
  colorSettings: ColorSettingsT;
  themeMode: typeof themeModes[number];
}

// creates a new PlayBackManager and adds it to the passed osmd instance
export const addPlaybackControl = function (
  osmd: OSMD,
  drawFromMeasureNumber: number,
  playbackVolume: number,
  metronomeVolume: number,
  soundfontManager: SoundfontManager
) {
  const timingSource = new LinearTimingSource();
  timingSource.reset();
  timingSource.pause();
  timingSource.Settings = osmd.Sheet.SheetPlaybackSetting;
  const audioMetronomePlayer = {
    playFirstBeatSample: (volume: number) => {},
    playBeatSample: (volume: number) => {},
  };
  const metronomeAudioContext = new AudioContext();
  Soundfont.instrument(metronomeAudioContext, 'woodblock').then(function (
    metro
  ) {
    soundfontManager.metronomeSF = metro;
    // if soundfont loaded, then update audioPlayer.playSound()
    audioMetronomePlayer.playFirstBeatSample = (volume: number) => {
      soundfontManager.metronomeSF?.play(
        'E4',
        metronomeAudioContext.currentTime,
        {
          gain: 5 * (metronomeVolume / 100),
        }
      );
    };
    audioMetronomePlayer.playBeatSample = (volume: number) => {
      soundfontManager.metronomeSF?.play(
        'C4',
        metronomeAudioContext.currentTime,
        {
          gain: 5 * (metronomeVolume / 100),
        }
      );
    };
  });

  // setup audio player to use custom soundfont
  const audioPlayer = new BasicAudioPlayer();
  const audioContext = new AudioContext();
  Soundfont.instrument(audioContext, 'acoustic_grand_piano').then(function (
    piano
  ) {
    soundfontManager.pianoSF = piano;
    // if soundfont loaded, then update audioPlayer.playSound()
    audioPlayer.playSound = (
      instrumentChannel: number,
      key: number,
      volume: number,
      lengthInMs: number
    ) => {
      // mute metronome sound events sent on channel 9
      if (instrumentChannel === 9) return;

      // use custom soundfont to play note
      soundfontManager.pianoSF?.play(
        key as unknown as string,
        audioContext.currentTime,
        {
          gain: 5 * (playbackVolume / 100),
          duration: lengthInMs / 1000,
          // attack: number;
          // decay: number;
          // sustain: number;
          // release: number;
          // adsr: [number, number, number, number];
          // loop: boolean;
        }
      );
    };
  });

  const playbackManager = new PlaybackManager(
    timingSource,
    audioMetronomePlayer,
    audioPlayer,
    { MessageOccurred: undefined }
  );
  // playbackManager.PreCountMeasures = 1; // note that DoPreCount has to be true for a precount to happen
  playbackManager.DoPreCount = false;
  playbackManager.DoPlayback = true;
  playbackManager.Metronome.Audible = true;
  playbackManager.Metronome.Highlight = false;
  playbackManager.Metronome.Volume = 1; // this is necessary to enable the audioMetronomePlayer events, it is not actually being used to control volume
  playbackManager.initialize(osmd.Sheet.MusicPartManager);
  playbackManager.addListener(osmd.cursor);
  playbackManager.reset();
  playbackManager.bpmChanged(osmd.Sheet.DefaultStartTempoInBpm, false);
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
    const { blockId, osmdSettings } = props;
    const [osmdFile, setOsmdFile] = useState<any>(null);
    const notificationDispatch = useNotificationDispatch();

    useEffect(() => {
      if (osmdSettings.selectedFileKey) {
        Storage.get(osmdSettings.selectedFileKey, {
          level: 'public',
          cacheControl: 'no-cache',
          download: true,
        })
          .then((result) => {
            const reader = new FileReader();
            reader.onload = (res: any) => {
              setOsmdFile(res?.target?.result);
            };
            reader.readAsBinaryString(result.Body as Blob);
          })
          .catch((err) => {
            notificationDispatch(
              `An error occurred while loading your file. Please try refreshing the page or contact support for help.`,
              'error',
              `Storage.get failed! ${err}`,
              8000
            );
          });
      }
    }, [osmdSettings.selectedFileKey, notificationDispatch]);

    if (osmdFile === null) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            <OSMDFileSelector osmdSettings={osmdSettings} blockId={blockId} />
          </Box>
        </Box>
      );
    }
    return <WrappedComponent {...props} osmdFile={osmdFile} />;
  };
  return WithOSMDFile;
};

interface OSMDBlockButtonsProps {
  styles: SxPropDict;
  block: MidiBlockT;
}
export const OSMDBlockButtons = React.memo(
  ({ styles, block }: OSMDBlockButtonsProps) => {
    const dispatch = useAppDispatch();
    const onRefreshClick = () => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            osmdSettings: {
              ...block.osmdSettings,
              rerenderId: uuidv4(),
            },
          },
        })
      );
    };
    return (
      <Tooltip arrow title="Refresh" placement="left">
        <Button
          color="primary"
          variant="contained"
          sx={styles.block_icon}
          onClick={onRefreshClick}
          aria-label="refresh"
        >
          <RefreshOutlinedIcon />
        </Button>
      </Tooltip>
    );
  }
);

export const OSMDFileSelector = ({
  blockId,
  osmdSettings,
}: {
  blockId: string;
  osmdSettings: OSMDSettingsT;
}) => {
  const dispatch = useAppDispatch();
  return (
    <FileSelector
      selectLabel="Select MusicXML File"
      folder="mxl"
      blockId={blockId}
      onSelectChange={(value: string) => {
        dispatch(
          updateOneMidiBlock({
            id: blockId,
            changes: {
              osmdSettings: {
                ...osmdSettings,
                selectedFileKey: value,
              },
            },
          })
        );
      }}
      selectValue={osmdSettings.selectedFileKey}
    />
  );
};
