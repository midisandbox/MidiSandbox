import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button, ButtonGroup, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import {
  IOSMDOptions,
  Note,
  OpenSheetMusicDisplay as OSMD,
} from 'osmd-extended';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import { getNoteColorNumStr } from '../../../utils/helpers';
import OSMDFileSelector from '../../drawerContainer/OSMDSettings/OSMDFileSelector';
import {
  selectOSMDNotesOnStr,
  updateOneMidiChannel,
} from '../../midiListener/midiListenerSlice';
import LoadingOverlay from '../../utilComponents/LoadingOverlay';
import {
  addPlaybackControl,
  errorLoadingOrRenderingSheet,
  OSMDViewProps,
  useOSMDStyles,
  withOSMDFile,
} from './OSMDUtils';

// alvin row
// https://drive.google.com/uc?id=1zRm6Qc3s2MOk-TlEByOJUGBeijw4aV9-&export=download

const OSMDView = React.memo(
  ({
    blockId,
    osmdFile,
    channelId,
    containerWidth,
    containerHeight,
    osmdSettings,
    hover,
    colorSettings,
  }: OSMDViewProps) => {
    const dispatch = useAppDispatch();
    const osmd = useRef<OSMD>();
    const osmdNotesOnStr = useTypedSelector((state) =>
      selectOSMDNotesOnStr(state, channelId)
    );
    const [osmdLoadingState, setOSMDLoadingState] = useState<
      'uninitiated' | 'loading' | 'complete'
    >('uninitiated');
    // a stringified array of sorted midi note numbers (for the highlighted beat on staff)
    const [cursorNotes, setCursorNotes] = useState('[]');
    const [currentBpm, setCurrentBpm] = useState(120);
    const [osmdError, setOSMDError] = useState('');

    // theme vars
    const muiTheme = useTheme();
    const classes = useOSMDStyles();
    const backgroundColor = muiTheme.palette.background.paper;
    const textColor = muiTheme.palette.text.primary;
    const cursorAlpha = muiTheme.palette.mode === 'light' ? 0.4 : 0.25;

    // initialize and render OSMD
    useEffect(() => {
      const containerDivId = `osmd-container`;
      (async () => {
        setOSMDLoadingState('loading');
        // add short delay to make sure loading state is updated before blocking osmd load executes
        await (() => new Promise((resolve) => setTimeout(resolve, 50)))();
        setOSMDError('');
        let osmdOptions: IOSMDOptions = {
          autoResize: false,
          backend: 'svg', // 'svg' or 'canvas'. NOTE: defaultColorMusic is currently not working with 'canvas'
          followCursor: true,
          defaultColorMusic: textColor,
          colorStemsLikeNoteheads: true,
          drawTitle: osmdSettings.drawTitle,
          drawFromMeasureNumber: osmdSettings.drawFromMeasureNumber,
          drawUpToMeasureNumber: osmdSettings.drawUpToMeasureNumber,
          cursorsOptions: [
            {
              type: 0,
              alpha: cursorAlpha,
              color: muiTheme.palette.secondary.main,
              follow: true,
            },
          ],
        };
        if (osmdSettings.colorNotes) {
          osmdOptions.coloringMode = 3;
          osmdOptions.coloringSetCustom = [
            getNoteColorNumStr(0, colorSettings),
            getNoteColorNumStr(1, colorSettings),
            getNoteColorNumStr(2, colorSettings),
            getNoteColorNumStr(3, colorSettings),
            getNoteColorNumStr(4, colorSettings),
            getNoteColorNumStr(5, colorSettings),
            getNoteColorNumStr(6, colorSettings),
            getNoteColorNumStr(7, colorSettings),
            getNoteColorNumStr(8, colorSettings),
            getNoteColorNumStr(9, colorSettings),
            getNoteColorNumStr(10, colorSettings),
            getNoteColorNumStr(11, colorSettings),
            '#000000',
          ];
        }

        osmd.current = new OSMD(containerDivId, osmdOptions);
        osmd?.current
          ?.load(osmdFile)
          .then(
            () => {
              // set instance variables and render
              if (osmd?.current?.IsReadyToRender()) {
                osmd.current.zoom = osmdSettings.zoom;
                osmd.current.DrawingParameters.setForCompactTightMode();
                osmd.current.DrawingParameters.Rules.MinimumDistanceBetweenSystems = 8;
                osmd.current.EngravingRules.PageBackgroundColor =
                  backgroundColor;
                return osmd.current.render();
              } else {
                console.error('OSMD tried to render but was not ready!');
              }
            },
            (e: Error) => {
              errorLoadingOrRenderingSheet(e, 'rendering');
            }
          )
          .then(
            () => {
              // after rendering, add playback control, set cursor notes and bpm
              if (osmd?.current) {
                if (osmdSettings.showCursor) {
                  osmd.current.cursor.show();
                  updateCursorNotes();
                  addPlaybackControl(
                    osmd.current,
                    osmdSettings.drawFromMeasureNumber
                  );
                  setCurrentBpm(osmd.current.Sheet.DefaultStartTempoInBpm);
                } else {
                  osmd.current.cursor?.hide();
                }
                setOSMDLoadingState('complete');
              }
            },
            (e: Error) => {
              errorLoadingOrRenderingSheet(e, 'loading');
            }
          )
          .catch((e) => {
            setOSMDError(
              'Unable to load selected file.\nPlease make sure the file you selected is valid MusicXML.'
            );
          });
      })();
      return () => {
        if (osmd?.current) {
          // unmount cleanup
          osmd.current.PlaybackManager?.pause();
          osmd.current = undefined;
          // make sure the container is empty (hot-loading was causing issue)
          const containerDiv = document.getElementById(containerDivId);
          if (containerDiv?.hasChildNodes()) {
            containerDiv.innerHTML = '';
          }
        }
      };
    }, [
      osmdSettings.drawTitle,
      osmdSettings.drawFromMeasureNumber,
      osmdSettings.drawUpToMeasureNumber,
      osmdSettings.zoom,
      osmdSettings.showCursor,
      osmdSettings.colorNotes,
      backgroundColor,
      textColor,
      cursorAlpha,
      muiTheme.palette.mode,
      muiTheme.palette.secondary.main,
      containerWidth,
      containerHeight,
      colorSettings,
      osmdFile,
    ]);

    // get the notes under the cursor and set cursorNotes state
    const updateCursorNotes = () => {
      if (osmd?.current?.cursor) {
        let newNotes: number[] = [];
        osmd.current.cursor.NotesUnderCursor().forEach((note: Note) => {
          const midiNoteNum = note.halfTone;
          const tiedNote = note?.NoteTie && note.NoteTie.Notes[0] !== note;
          // make sure rests, duplicates and hidden notes are not included
          if (
            !note.isRest() &&
            !tiedNote &&
            !newNotes.includes(midiNoteNum) &&
            note.PrintObject
          ) {
            newNotes.push(midiNoteNum);
          }
        });
        // sort the notes from lowest to highest
        const stringifiedNotes = JSON.stringify(newNotes.sort((a, b) => a - b));
        setCursorNotes(stringifiedNotes);
        return stringifiedNotes;
      }
      return '[]';
    };

    // increment osmd.cursor, update PlaybackManager iterator to match it, and update cursor notes
    const incrementCursor = useCallback(
      (cursorNext = true) => {
        if (osmd?.current) {
          if (cursorNext) osmd.current.cursor.next();
          const timestamp = osmd.current.cursor.Iterator.EndReached
            ? osmd.current.Sheet.SourceMeasures[
                Math.max(0, osmdSettings.drawFromMeasureNumber - 1)
              ].AbsoluteTimestamp
            : osmd.current.cursor.Iterator.currentTimeStamp;
          osmd.current.PlaybackManager.setPlaybackStart(timestamp);
          // skip over all rest notes when incrementing cursor
          const stringifiedNotes = updateCursorNotes();
          if (stringifiedNotes === '[]') incrementCursor();
        }
      },
      [osmdSettings.drawFromMeasureNumber]
    );

    // iterate cursor to next step if the current cursorNotes matches channel.osmdNotesOn
    useEffect(() => {
      if (
        osmdSettings.showCursor &&
        osmd?.current?.cursor &&
        !osmd.current.cursor.Iterator.EndReached &&
        osmd.current.PlaybackManager.RunningState === 0 &&
        ['[]', osmdNotesOnStr].includes(cursorNotes)
      ) {
        // empty osmdNotesOn before cursor.next() so the notes must be pressed again before triggering the following next()
        dispatch(
          updateOneMidiChannel({
            id: channelId,
            changes: {
              osmdNotesOn: [],
            },
          })
        );
        incrementCursor();
      }
    }, [
      osmdSettings.showCursor,
      cursorNotes,
      osmdNotesOnStr,
      channelId,
      dispatch,
      incrementCursor,
    ]);

    const updateBpm = (bpmDiff: number) => () => {
      const newBpm = currentBpm + bpmDiff;
      setCurrentBpm(newBpm);
      osmd?.current?.PlaybackManager.bpmChanged(newBpm);
    };

    // pause player, increment osmd.cursor until it reaches PlaybackManager timestamp, update cursor notes
    const pauseAudioPlayer = () => {
      if (osmd?.current) {
        osmd.current.PlaybackManager.pause();
        while (
          osmd.current.cursor.Iterator.currentTimeStamp.RealValue <
          osmd.current.PlaybackManager.CursorIterator.currentTimeStamp.RealValue
        ) {
          osmd.current.cursor.next();
        }
        // update cursor notes and playback manager cursor but dont call cursor.next
        incrementCursor(false);
      }
    };

    // move cursor to the first measure
    const onCursorReset = () => {
      if (osmd?.current) {
        osmd.current.PlaybackManager.setPlaybackStart(
          osmd.current.Sheet.SourceMeasures[
            Math.max(0, osmdSettings.drawFromMeasureNumber - 1)
          ].AbsoluteTimestamp
        );
        osmd.current.cursor.update();
        updateCursorNotes();
      }
    };

    return (
      <Box
        className={classes.container}
        sx={{ backgroundColor: backgroundColor }}
      >
        <div id={`osmd-container`} />
        {osmdError ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography>{osmdError}</Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: '250px',
                mt: 4,
                textAlign: 'left',
              }}
            >
              <OSMDFileSelector blockId={blockId} osmdSettings={osmdSettings} />
            </Box>
          </Box>
        ) : (
          <>
            {osmdLoadingState !== 'complete' && (
              <LoadingOverlay animate={false} />
            )}
            {osmdSettings.showCursor && (
              <Box
                className={classes.osmdButtonCont}
                sx={{
                  visibility: hover ? 'inherit' : 'hidden',
                }}
              >
                <Tooltip arrow title="Reset Cursor" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.iconButton}
                    onClick={onCursorReset}
                    aria-label="reset"
                  >
                    <RestartAltIcon />
                  </Button>
                </Tooltip>
                <Tooltip arrow title="Cursor Next" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.iconButton}
                    onClick={() => incrementCursor()}
                    aria-label="next"
                  >
                    <NavigateNextIcon />
                  </Button>
                </Tooltip>
                <Tooltip arrow title="BPM" placement="top">
                  <ButtonGroup
                    className={classes.buttonGroup}
                    disableElevation
                    variant="contained"
                  >
                    <Button
                      color="primary"
                      className={classes.buttonGroupItem}
                      sx={{
                        borderTopLeftRadius: '50%',
                        borderBottomLeftRadius: '50%',
                      }}
                      onClick={updateBpm(-5)}
                    >
                      <RemoveIcon />
                    </Button>
                    <Box color="primary" className={classes.buttonGroupText}>
                      {currentBpm}
                    </Box>
                    <Button
                      color="primary"
                      className={classes.buttonGroupItem}
                      sx={{
                        borderTopRightRadius: '50%',
                        borderBottomRightRadius: '50%',
                      }}
                      onClick={updateBpm(5)}
                    >
                      <AddIcon />
                    </Button>
                  </ButtonGroup>
                </Tooltip>
                <Tooltip arrow title="Pause" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.iconButton}
                    onClick={pauseAudioPlayer}
                    aria-label="pause"
                  >
                    <PauseIcon />
                  </Button>
                </Tooltip>
                <Tooltip arrow title="Play" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.iconButton}
                    onClick={() => osmd?.current?.PlaybackManager.play()}
                    aria-label="play"
                  >
                    <PlayArrowIcon />
                  </Button>
                </Tooltip>
              </Box>
            )}
          </>
        )}
      </Box>
    );
  }
);

export default withOSMDFile(OSMDView);
