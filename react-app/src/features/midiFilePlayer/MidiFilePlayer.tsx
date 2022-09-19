import FirstPageIcon from '@mui/icons-material/FirstPage';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, LinearProgress, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Storage } from 'aws-amplify';
import MidiPlayer from 'midi-player-js';
import { useCallback, useEffect, useRef } from 'react';
import { MidiNoteEvent } from '../../app/sagas';
import { useAppDispatch } from '../../app/store';
import { useMsStyles } from '../../assets/styles/styleHooks';
import FileSelector from '../drawerContainer/FileSelector';
import { updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
import {
  addNewMidiInputs,
  deleteMidiInputs,
  handleMidiNoteEvent,
} from '../midiListener/midiListenerSlice';
import { mapWebMidiInputs } from '../midiListener/webMidiUtils';
import { useState } from 'react';
import { formatSeconds } from '../../utils/helpers';
interface MidiFilePlayerProps {
  containerWidth: number;
  containerHeight: number;
  blockId: string;
  midiFilePlayerSettings: MidiFilePlayerSettingsT;
}
function MidiFilePlayer({
  blockId,
  containerHeight,
  containerWidth,
  midiFilePlayerSettings,
}: MidiFilePlayerProps) {
  const msClasses = useMsStyles();
  const dispatch = useAppDispatch();
  const midiPlayers = useRef<MidiPlayerMap>({});
  const [playerState, setPlayerState] = useState<PlayerState>({
    songTime: 0,
    timeRemaining: 0,
    percentRemaining: 100,
    isPlaying: false,
  });

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
      if (existingPlayer?.isPlaying()) {
        setPlayerState({
          songTime: existingPlayer.getSongTime(),
          timeRemaining: existingPlayer.getSongTimeRemaining(),
          percentRemaining: existingPlayer.getSongPercentRemaining(),
          isPlaying: existingPlayer.isPlaying(),
        });
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [getRandomMidiPlayer]);

  // run when midiFilePlayerSettings.selectedMidiFiles changes
  useEffect(() => {
    const fileInputs: WebMidiInputT[] = [];
    const updatedMidiPlayers: MidiPlayerMap = {};

    // remove deselected files from midiListener inputs
    const deselectedFiles = Object.keys(midiPlayers.current).filter(
      (id1) =>
        !midiFilePlayerSettings.selectedMidiFiles.some(
          ({ key: id2 }) => id2 === id1
        )
    );
    dispatch(deleteMidiInputs(deselectedFiles));

    // generate midiPlayers and midiListener inputs for each selected file
    midiFilePlayerSettings.selectedMidiFiles.forEach((selectedMidiFile) => {
      // add midiPlayer
      Storage.get(selectedMidiFile.key, {
        level: 'public',
        cacheControl: 'no-cache',
        download: true,
      }).then((result) => {
        const midiBlob: Blob = result.Body as Blob;
        midiBlob.arrayBuffer().then((arrBuff) => {
          // TODO: make sure events are handled properly
          const newMidiPlayer = new MidiPlayer.Player((event: any) => {
            if (event.name === 'Note on') {
              // console.log('Note event: ', event);
              const eventType = event.velocity > 0 ? 'noteon' : 'noteoff';
              const eventPayload: MidiNoteEvent = {
                eventHandler: 'note',
                inputId: selectedMidiFile.key,
                eventType: eventType,
                eventData: [
                  eventType === 'noteon' ? 144 : 128,
                  event.noteNumber,
                  0,
                ],
                channel: 1,
                timestamp: 0,
                velocity: event.velocity,
                attack: 0,
                release: 0,
              };
              dispatch(handleMidiNoteEvent(eventPayload));
            } else {
              // console.log('Other event: ', event);
            }
          });
          newMidiPlayer.loadArrayBuffer(arrBuff);
          updatedMidiPlayers[selectedMidiFile.key] = newMidiPlayer;
          setPlayerState({
            songTime: newMidiPlayer.getSongTime(),
            timeRemaining: newMidiPlayer.getSongTimeRemaining(),
            percentRemaining: newMidiPlayer.getSongPercentRemaining(),
            isPlaying: newMidiPlayer.isPlaying(),
          });
        });
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
    });

    // update midiPlayers
    midiPlayers.current = updatedMidiPlayers;

    // update midiListener
    const { inputs, channels, notes } = mapWebMidiInputs(fileInputs);
    dispatch(addNewMidiInputs({ inputs, channels, notes }));
  }, [midiFilePlayerSettings.selectedMidiFiles, dispatch]);

  // handle both midi and audio file select change
  const onFileSelectorChange = (
    value: UploadedFileT | UploadedFileT[] | null
  ) => {
    let settingUpdate = Array.isArray(value)
      ? { selectedMidiFiles: value }
      : { selectedAudioFile: value };
    dispatch(
      updateOneMidiBlock({
        id: blockId,
        changes: {
          midiFilePlayerSettings: {
            ...midiFilePlayerSettings,
            ...{ settingUpdate },
          },
        },
      })
    );
  };

  const turnOffMidiFileInputNotes = useCallback(() => {
    midiFilePlayerSettings.selectedMidiFiles.forEach((file) => {
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
  }, [midiFilePlayerSettings.selectedMidiFiles, dispatch]);

  return (
    <Box
      sx={{
        width: containerWidth,
        height: containerHeight,
        pl: 11,
        pr: 11,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box>
        <FileSelector
          selectLabel="Select Midi File(s)"
          folder="midi"
          blockId={blockId}
          multi={true}
          multiSelectValue={midiFilePlayerSettings.selectedMidiFiles.map(
            (x) => x.key
          )}
          onSelectChange={onFileSelectorChange}
        />
        {/* <FileSelector
          selectLabel="Select Audio File"
          folder="audio"
          blockId={blockId}
          selectValue={midiFilePlayerSettings.selectedAudioFile.key}
          onSelectChange={onFileSelectorChange}
        /> */}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 6,
          mb: 2,
        }}
      >
        <Tooltip arrow title="Replay" placement="top">
          <Button
            variant="contained"
            color="primary"
            className={msClasses.iconButton}
            onClick={() => {
              Object.keys(midiPlayers.current).forEach((fileKey) => {
                midiPlayers.current[fileKey].resetTracks();
                midiPlayers.current[fileKey].skipToPercent(0);
                turnOffMidiFileInputNotes();
              });
              const existingPlayer = getRandomMidiPlayer();
              if (existingPlayer) {
                setPlayerState({
                  songTime: existingPlayer.getSongTime(),
                  timeRemaining: existingPlayer.getSongTimeRemaining(),
                  percentRemaining: existingPlayer.getSongPercentRemaining(),
                  isPlaying: existingPlayer.isPlaying(),
                });
              }
            }}
            aria-label="replay"
          >
            <FirstPageIcon />
          </Button>
        </Tooltip>
        <Tooltip arrow title="Pause" placement="top">
          <Button
            variant="contained"
            color="primary"
            className={msClasses.iconButton}
            onClick={() => {
              Object.keys(midiPlayers.current).forEach((fileKey) => {
                midiPlayers.current[fileKey].pause();
              });
            }}
            aria-label="pause"
          >
            <PauseIcon />
          </Button>
        </Tooltip>
        <Tooltip arrow title="Play" placement="top">
          <Button
            variant="contained"
            color="primary"
            className={msClasses.iconButton}
            onClick={() => {
              Object.keys(midiPlayers.current).forEach((fileKey) => {
                midiPlayers.current[fileKey].play();
              });
            }}
            aria-label="play"
          >
            <PlayArrowIcon />
          </Button>
        </Tooltip>
      </Box>
      <PlayerProgress playerState={playerState} />
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
}
function PlayerProgress({ playerState }: PlayerProgressProps) {
  const currentTime = formatSeconds(
    playerState.songTime -
      Math.min(playerState.timeRemaining, playerState.songTime)
  );
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
          {currentTime}
        </Typography>
      </Box>
      <LinearProgress
        sx={{ ml: 2, mr: 2, flexGrow: 1 }}
        variant="determinate"
        value={100 - playerState.percentRemaining}
      />
      <Box>
        <Typography variant="body2" color="text.secondary">
          {formatSeconds(playerState.songTime)}
        </Typography>
      </Box>
    </Box>
  );
}

export default MidiFilePlayer;
