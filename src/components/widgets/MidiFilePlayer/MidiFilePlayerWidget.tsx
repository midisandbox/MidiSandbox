import FirstPageIcon from '@mui/icons-material/FirstPage';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton, Slider, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Storage } from 'aws-amplify';
import { Howl } from 'howler';
import MidiPlayer from 'midi-player-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { updateGlobalSetting } from '../../../redux/slices/globalSettingsSlice';
import { useNotificationDispatch } from '../../../utils/hooks';
import { useAppDispatch } from '../../../redux/store';
import { useMsStyles } from '../../../styles/styleHooks';
import { formatSeconds, blobToBase64 } from '../../../utils/utils';
import {
  addNewMidiInputs,
  deleteMidiInputs,
  handleMidiNoteEvent,
  handlePedalEvent,
} from '../../../redux/slices/midiListenerSlice';
import { mapWebMidiInputs } from '../../../utils/webMidiUtils';
import MidiFilePlayerSettings from './MidiFilePlayerSettings';

interface MidiFilePlayerProps {
  containerWidth: number;
  containerHeight: number;
  block: MidiBlockT;
}
function MidiFilePlayer({
  block,
  containerHeight,
  containerWidth,
}: MidiFilePlayerProps) {
  const msClasses = useMsStyles();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const midiPlayers = useRef<MidiPlayerMap>({});
  const audioPlayer = useRef<Howl>();
  const [playerState, setPlayerState] = useState<PlayerState>({
    songTime: 0,
    timeRemaining: 0,
    percentRemaining: 100,
    isPlaying: false,
  });
  const currentPlaybackTime = Math.max(
    0,
    playerState.songTime - playerState.timeRemaining
  );

  // get a random player from midiPlayers if available, else null
  const getRandomMidiPlayer = useCallback(() => {
    const playerKeys = Object.keys(midiPlayers.current);
    if (playerKeys.length > 0) {
      return midiPlayers.current[playerKeys[0]];
    }
    return null;
  }, []);

  // update playerState every second if it isPlaying
  useEffect(() => {
    const interval = setInterval(() => {
      const existingPlayer = getRandomMidiPlayer();
      if (
        existingPlayer &&
        existingPlayer.getSongTimeRemaining() !== playerState.timeRemaining
      ) {
        setPlayerState({
          songTime: Math.round(existingPlayer.getSongTime()),
          timeRemaining: existingPlayer.getSongTimeRemaining(),
          percentRemaining: existingPlayer.getSongPercentRemaining(),
          isPlaying: existingPlayer.isPlaying(),
        });
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [getRandomMidiPlayer, playerState.timeRemaining]);

  const turnOffMidiFileInputNotes = useCallback(() => {
    block.midiFilePlayerSettings.selectedMidiFiles.forEach((file) => {
      dispatch(
        handlePedalEvent({
          eventHandler: 'pedalEvent',
          inputId: file.key,
          channel: 1,
          notesOnState: [],
          pedalOn: false,
        })
      );
      dispatch(
        handleMidiNoteEvent({
          eventHandler: 'note',
          inputId: file.key,
          eventType: 'TURN_OFF_ACTIVE_NOTES',
          eventData: [0, 0, 0],
          channel: 1,
          timestamp: 0,
          velocity: 0,
          attack: 0,
          release: 0,
        })
      );
    });
  }, [block.midiFilePlayerSettings.selectedMidiFiles, dispatch]);

  const resetPlayback = useCallback(() => {
    Object.keys(midiPlayers.current).forEach((fileKey) => {
      midiPlayers.current[fileKey].resetTracks();
      midiPlayers.current[fileKey].skipToPercent(0);
      turnOffMidiFileInputNotes();
    });
    const existingPlayer = getRandomMidiPlayer();
    if (existingPlayer) {
      setPlayerState({
        songTime: Math.round(existingPlayer.getSongTime()),
        timeRemaining: existingPlayer.getSongTimeRemaining(),
        percentRemaining: existingPlayer.getSongPercentRemaining(),
        isPlaying: existingPlayer.isPlaying(),
      });
    }
    audioPlayer.current?.stop();
    // update global playback
    if (block.midiFilePlayerSettings.controlGlobalPlayback) {
      dispatch(
        updateGlobalSetting({
          playbackIsPlaying: false,
          playbackSeekSeconds: 0,
          playbackSeekAutoplay: false,
          playbackSeekVersion: uuidv4(),
        })
      );
    }
  }, [
    dispatch,
    getRandomMidiPlayer,
    block.midiFilePlayerSettings.controlGlobalPlayback,
    turnOffMidiFileInputNotes,
  ]);

  const startPlayback = useCallback(
    (seekSeconds?: number) => {
      const audioDelay =
        block.midiFilePlayerSettings.audioDelay > 0
          ? block.midiFilePlayerSettings.audioDelay
          : 0;
      const midiDelay =
        block.midiFilePlayerSettings.audioDelay < 0
          ? block.midiFilePlayerSettings.audioDelay
          : 0;

      // play audio file
      audioPlayer.current?.pause();
      setTimeout(() => {
        if (audioPlayer.current) {
          if (seekSeconds !== undefined) {
            audioPlayer.current.seek(seekSeconds);
          }
          audioPlayer.current.play();
        }
      }, audioDelay);

      // play midi files
      setTimeout(() => {
        Object.keys(midiPlayers.current).forEach((fileKey) => {
          if (seekSeconds !== undefined) {
            midiPlayers.current[fileKey].skipToSeconds(seekSeconds);
          }
          midiPlayers.current[fileKey].play();
        });

        // update global playback
        if (block.midiFilePlayerSettings.controlGlobalPlayback) {
          dispatch(
            updateGlobalSetting({
              playbackIsPlaying: true,
              ...(seekSeconds !== undefined && {
                playbackSeekSeconds: seekSeconds,
                playbackSeekAutoplay: true,
                playbackSeekVersion: uuidv4(),
              }),
            })
          );
        }
      }, -midiDelay);
    },
    [
      block.midiFilePlayerSettings.audioDelay,
      block.midiFilePlayerSettings.controlGlobalPlayback,
      dispatch,
    ]
  );

  const midiPlayerEventHandler = useCallback(
    (event: any, fileKey: string) => {
      // handle midi player events
      // console.log('MidiPlayer event:', event);
      if (['Note on', 'Note off'].includes(event.name)) {
        const eventType =
          event.velocity === 0 || event.name === 'Note off'
            ? 'noteoff'
            : 'noteon';
        const eventPayload: MidiNoteEvent = {
          eventHandler: 'note',
          inputId: fileKey,
          eventType: eventType,
          eventData: [eventType === 'noteon' ? 144 : 128, event.noteNumber, 0],
          channel: 1,
          timestamp: 0,
          velocity: event.velocity,
          attack: 0,
          release: 0,
        };
        dispatch(handleMidiNoteEvent(eventPayload));
      } else if (
        event.name === 'Controller Change' &&
        (event.number === 64 || event.noteNumber === 64)
      ) {
        // console.log('Controller event: ', event);
        dispatch(
          handlePedalEvent({
            eventHandler: 'pedalEvent',
            inputId: fileKey,
            channel: 1,
            notesOnState: [],
            pedalOn: event.value >= 70,
          })
        );
      } else {
        // console.log('Other event: ', event);
      }
    },
    [dispatch]
  );

  const handleEndOfFile = useCallback(
    (e: any) => {
      resetPlayback();
      // update global playback
      if (block.midiFilePlayerSettings.controlGlobalPlayback) {
        dispatch(
          updateGlobalSetting({
            playbackIsPlaying: false,
            playbackSeekSeconds: 0,
            playbackSeekAutoplay: false,
            playbackSeekVersion: uuidv4(),
          })
        );
      }
      if (block.midiFilePlayerSettings.loopingEnabled) {
        startPlayback(0);
      }
    },
    [
      dispatch,
      block.midiFilePlayerSettings.controlGlobalPlayback,
      block.midiFilePlayerSettings.loopingEnabled,
      resetPlayback,
      startPlayback,
    ]
  );

  // run when block.midiFilePlayerSettings.selectedMidiFiles changes
  useEffect(() => {
    const fileInputs: WebMidiInputT[] = [];
    const updatedMidiPlayers: MidiPlayerMap = {};

    // remove deselected files from midiListener inputs
    const deselectedFiles = Object.keys(midiPlayers.current).filter(
      (id1) =>
        !block.midiFilePlayerSettings.selectedMidiFiles.some(
          ({ key: id2 }) => id2 === id1
        )
    );
    dispatch(deleteMidiInputs(deselectedFiles));

    // generate midiPlayers and midiListener inputs for each selected file
    block.midiFilePlayerSettings.selectedMidiFiles.forEach(
      (selectedMidiFile, i) => {
        // add midiPlayer
        Storage.get(selectedMidiFile.key, {
          level: 'public',
          // cacheControl: 'no-cache',
          download: true,
        })
          .then((result) => {
            const midiBlob: Blob = result.Body as Blob;
            midiBlob.arrayBuffer().then((arrBuff) => {
              const newMidiPlayer = new MidiPlayer.Player((event: any) =>
                midiPlayerEventHandler(event, selectedMidiFile.key)
              );
              newMidiPlayer.loadArrayBuffer(arrBuff);
              updatedMidiPlayers[selectedMidiFile.key] = newMidiPlayer;
              setPlayerState({
                songTime: Math.round(newMidiPlayer.getSongTime()),
                timeRemaining: newMidiPlayer.getSongTimeRemaining(),
                percentRemaining: newMidiPlayer.getSongPercentRemaining(),
                isPlaying: newMidiPlayer.isPlaying(),
              });
              // only listen to endOfFile events for one of the selectedMidiFiles
              if (i === 0) {
                newMidiPlayer.on('endOfFile', handleEndOfFile);
              }
            });
          })
          .catch((err) => {
            notificationDispatch(
              `An error occurred while loading your file. Please try refreshing the page or contact support for help.`,
              'error',
              `Storage.get failed! key: ${selectedMidiFile.key} \nError: ${err}`,
              8000
            );
          });

        // generate fileInputs to upsert to midiListener inputs/channels/notes
        fileInputs.push({
          eventsSuspended: false,
          _octaveOffset: 0,
          _midiInput: {
            id: selectedMidiFile.key,
            manufacturer: '',
            name: selectedMidiFile.filename,
            connection: '',
            state: '',
            type: 'midi_file',
            version: '',
          },
          channels: [
            {
              _octaveOffset: 0,
              eventsSuspended: false,
              _number: 1,
            },
          ],
        });
      }
    );

    // update midiPlayers
    midiPlayers.current = updatedMidiPlayers;

    // update midiListener
    const { inputs, channels, notes } = mapWebMidiInputs(fileInputs, {
      input: { reversePedal: true },
    });
    dispatch(addNewMidiInputs({ inputs, channels, notes }));
  }, [
    block.midiFilePlayerSettings.selectedMidiFiles,
    dispatch,
    notificationDispatch,
    midiPlayerEventHandler,
    handleEndOfFile,
  ]);

  useEffect(() => {
    if (block.midiFilePlayerSettings.selectedAudioFile?.key) {
      Storage.get(block.midiFilePlayerSettings.selectedAudioFile.key, {
        level: 'public',
        // cacheControl: 'no-cache',
        download: true,
      })
        .then((result) => {
          const audioBlob: Blob = result.Body as Blob;
          var fileExt = block.midiFilePlayerSettings.selectedAudioFile?.key
            .split('.')
            .pop();
          blobToBase64(audioBlob).then((audioBase64) => {
            audioPlayer.current = new Howl({
              src: audioBase64 as string,
              format: fileExt,
            });
            audioPlayer.current.volume(block.midiFilePlayerSettings.volume);
          });
        })
        .catch((err) => {
          notificationDispatch(
            `An error occurred while loading your file. Please try refreshing the page or contact support for help.`,
            'error',
            `Storage.get failed! key: ${block.midiFilePlayerSettings.selectedAudioFile?.key}\nError: ${err}`,
            8000
          );
        });
    } else {
      audioPlayer.current = undefined;
    }
    // NOTE: the dependency warnings are disabled since we only need te initial value for block.midiFilePlayerSettings.volume (updates to volume happen in a different useEffect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    block.midiFilePlayerSettings.selectedAudioFile?.key,
    notificationDispatch,
  ]);

  useEffect(() => {
    audioPlayer.current?.volume(block.midiFilePlayerSettings.volume);
  }, [block.midiFilePlayerSettings.volume]);

  const pausePlayback = useCallback(() => {
    Object.keys(midiPlayers.current).forEach((fileKey) => {
      midiPlayers.current[fileKey].pause();
    });
    audioPlayer.current?.pause();
    // update global playback
    if (block.midiFilePlayerSettings.controlGlobalPlayback) {
      dispatch(
        updateGlobalSetting({
          playbackIsPlaying: false,
          playbackSeekAutoplay: false,
        })
      );
    }
  }, [dispatch, block.midiFilePlayerSettings.controlGlobalPlayback]);

  // handle component cleanup on unmount
  useEffect(() => {
    return () => {
      pausePlayback();
      audioPlayer.current = undefined;
      midiPlayers.current = {};
    };
  }, [pausePlayback]);

  const onPlayerSkip = (seconds: number) => {
    turnOffMidiFileInputNotes();
    startPlayback(seconds);
  };

  const getWarning = () => {
    let fileRuntime = 0;
    for (const fileKey in midiPlayers.current) {
      if (fileRuntime === 0) {
        fileRuntime = Math.round(midiPlayers.current[fileKey].getSongTime());
      } else if (
        Math.abs(
          fileRuntime - Math.round(midiPlayers.current[fileKey].getSongTime())
        ) > 2
      ) {
        return 'Warning! selected midi files have different run-times.';
      }
    }
    return '';
  };

  const warning = getWarning();
  return (
    <Box
      sx={{
        width: containerWidth,
        height: containerHeight,
        pl: 11,
        pr: 11,
        pt: 2,
        pb: 2,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: '1.5rem',
      }}
    >
      {!(block.midiFilePlayerSettings.selectedMidiFiles.length > 0) ? (
        <Typography color="text.primary" sx={{ textAlign: 'center' }}>
          No file selected.
        </Typography>
      ) : (
        <>
          <Typography
            color="text.primary"
            sx={{
              fontSize: '1.5rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
            }}
          >
            {`${block.midiFilePlayerSettings.selectedMidiFiles
              .map((x) => x.filename)
              .join(', ')}`}
          </Typography>
        </>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 0,
          mb: 0,
        }}
      >
        <Tooltip arrow title="Replay" placement="top">
          <IconButton
            color="primary"
            className={msClasses.iconButton}
            onClick={resetPlayback}
            aria-label="replay"
          >
            <FirstPageIcon />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Pause" placement="top">
          <IconButton
            color="primary"
            className={msClasses.iconButton}
            onClick={() => pausePlayback()}
            aria-label="pause"
          >
            <PauseIcon />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Play" placement="top">
          <IconButton
            color="primary"
            className={msClasses.iconButton}
            onClick={() => startPlayback(currentPlaybackTime)}
            aria-label="play"
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <PlayerProgress playerState={playerState} onPlayerSkip={onPlayerSkip} />
      {warning && (
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
          variant="subtitle1"
        >
          {warning}
        </Typography>
      )}
    </Box>
  );
}

interface MidiPlayerMap {
  [key: string]: MidiPlayer.Player;
}

interface PlayerState {
  songTime: number;
  timeRemaining: number;
  percentRemaining: number;
  isPlaying: boolean;
}

interface PlayerProgressProps {
  playerState: PlayerState;
  onPlayerSkip: (x: number) => void;
}
function PlayerProgress({ playerState, onPlayerSkip }: PlayerProgressProps) {
  const currentTime =
    playerState.songTime -
    Math.min(playerState.timeRemaining, playerState.songTime);
  const [mouseDown, setMouseDown] = useState(false);
  const [value, setValue] = useState(currentTime);

  useEffect(() => {
    if (!mouseDown) {
      setValue(currentTime);
    }
  }, [currentTime, mouseDown]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary">
          {formatSeconds(value)}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', display: 'flex', ml: 3, mr: 3 }}>
        <Slider
          value={value}
          onChange={(event: Event, newValue: number | number[]) =>
            setValue(newValue as number)
          }
          aria-labelledby="time"
          step={1}
          min={0}
          max={playerState.songTime}
          size="small"
          onMouseDown={() => setMouseDown(true)}
          onMouseUp={() => setTimeout(() => setMouseDown(false), 1000)}
          onChangeCommitted={(
            event: React.SyntheticEvent | Event,
            value: number | Array<number>
          ) => onPlayerSkip(value as number)}
        />
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          {formatSeconds(playerState.songTime)}
        </Typography>
      </Box>
    </Box>
  );
}

const exportObj: WidgetModule = {
  name: 'Midi File Player',
  Component: MidiFilePlayer,
  SettingComponent: MidiFilePlayerSettings,
  ButtonsComponent: null,
  defaultSettings: {}, // midiFilePlayerSettings is handled on its own (not using widgetSettings)
  includeBlockSettings: ['Block Theme'],
  orderWeight: 4, // used to determine the ordering of the options in the Widget selector
};

export default exportObj;
