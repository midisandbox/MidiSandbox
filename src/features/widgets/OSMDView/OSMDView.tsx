import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
// import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Button, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import {
  IOSMDOptions,
  Note,
  OpenSheetMusicDisplay as OSMD,
} from 'opensheetmusicdisplay';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import { useMsStyles } from '../../../assets/styles/styleHooks';
import { getNoteColorNumStr } from '../../../utils/helpers';
import {
  selectOSMDNotesOnStr,
  updateOneMidiChannel,
} from '../../midiListener/midiListenerSlice';
import LoadingOverlay from '../../utilComponents/LoadingOverlay';
import {
  errorLoadingOrRenderingSheet,
  OSMDFileSelector,
  OSMDViewProps,
  useOSMDStyles,
  withOSMDFile,
} from './OSMDUtils';

const OSMDView = React.memo(
  ({
    blockId,
    osmdFile,
    channelId,
    osmdSettings,
    hover,
    colorSettings,
    themeMode,
  }: OSMDViewProps) => {
    const containerDivId = `osmd-container-${blockId}`;
    const dispatch = useAppDispatch();
    const osmd = useRef<OSMD>();
    const osmdNotesOnStr = useTypedSelector((state) =>
      selectOSMDNotesOnStr(state, channelId, osmdSettings.iterateCursorOnInput)
    );
    const [osmdLoadingState, setOSMDLoadingState] = useState<
      'uninitiated' | 'loading' | 'complete'
    >('uninitiated');
    // a stringified array of sorted midi note numbers (for the highlighted beat on staff)
    const [cursorNotes, setCursorNotes] = useState('[]');
    const [osmdError, setOSMDError] = useState('');
    const msClasses = useMsStyles();

    // theme vars
    const muiTheme = useTheme();
    const classes = useOSMDStyles();
    const backgroundColor = muiTheme.palette.background.paper;
    const textColor = muiTheme.palette.text.primary;
    const cursorAlpha = 0.6;

    // get the notes under the cursor and set cursorNotes state
    const updateCursorNotes = useCallback(() => {
      if (osmd?.current?.cursor) {
        let newNotes: number[] = [];
        osmd.current.cursor.NotesUnderCursor().forEach((note: Note) => {
          const midiNoteNum = note.halfTone + 12;
          const tiedNote = note?.NoteTie && note.NoteTie.Notes[0] !== note;
          const noteInCursorMatchClefs =
            osmdSettings.cursorMatchClefs === 'Treble'
              ? note.ParentStaffEntry.ParentStaff.Id === 1
              : osmdSettings.cursorMatchClefs === 'Bass'
              ? note.ParentStaffEntry.ParentStaff.Id === 2
              : true;
          // make sure rests, duplicates and hidden notes are not included
          if (
            !note.isRest() &&
            !tiedNote &&
            !newNotes.includes(midiNoteNum) &&
            note.PrintObject &&
            noteInCursorMatchClefs
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
    }, [osmdSettings.cursorMatchClefs]);

    // initialize and render OSMD
    useEffect(() => {
      (async () => {
        setOSMDLoadingState('loading');
        // add short delay to make sure loading state is updated before blocking osmd load executes
        await (() => new Promise((resolve) => setTimeout(resolve, 50)))();
        setOSMDError('');
        let osmdOptions: IOSMDOptions = {
          autoResize: false,
          backend: themeMode === 'dark' ? 'svg' : 'canvas', // 'svg' or 'canvas'. NOTE: defaultColorMusic is currently not working with 'canvas'
          followCursor: true,
          defaultColorMusic: textColor,
          // darkMode: true,
          defaultColorRest: textColor,
          colorStemsLikeNoteheads: true,
          drawTitle: osmdSettings.drawTitle,
          drawFromMeasureNumber: osmdSettings.drawFromMeasureNumber,
          drawUpToMeasureNumber: osmdSettings.drawUpToMeasureNumber,
          cursorsOptions: [
            {
              type: 0,
              alpha: cursorAlpha,
              color: muiTheme.palette.primary.main,
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
        await osmd?.current
          ?.load(osmdFile)
          .then(
            () => {
              // set instance variables and render
              if (osmd?.current?.IsReadyToRender()) {
                osmd.current.zoom = osmdSettings.zoom;
                osmd.current.DrawingParameters.setForCompactTightMode();
                osmd.current.DrawingParameters.Rules.MinimumDistanceBetweenSystems = 15;
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
      muiTheme.palette.primary.main,
      colorSettings,
      osmdFile,
      themeMode,
      containerDivId,
      updateCursorNotes,
    ]);

    // rerender osmd when rerenderId changes
    useEffect(() => {
      osmd?.current?.render();
    }, [osmdSettings.rerenderId]);

    // increment osmd.cursor, and update cursor notes
    const incrementCursor = useCallback(
      (cursorNext = true) => {
        if (osmd?.current) {
          if (cursorNext) osmd.current.cursor.next();
          // update current cursor notes
          const stringifiedNotes = updateCursorNotes();
          // if end is reached then reset back to start and update cursor notes
          if (osmd.current.cursor.Iterator.EndReached) {
            updateCursorNotes();
          }
          // skip over all rest notes when incrementing cursor
          else if (stringifiedNotes === '[]') {
            incrementCursor();
          }
        }
      },
      [updateCursorNotes]
    );

    // // increment osmd.cursor, and update cursor notes
    // const decrementCursor = useCallback(
    //   (cursorNext = true) => {
    //     if (osmd?.current) {
    //       if (cursorNext) osmd.current.cursor.previous();
    //       // update current cursor notes
    //       const stringifiedNotes = updateCursorNotes();

    //       // skip over all rest notes when incrementing cursor
    //       if (stringifiedNotes === '[]') {
    //         decrementCursor();
    //       }
    //     }
    //   },
    //   [updateCursorNotes]
    // );

    // iterate cursor to next step if the current cursorNotes matches channel.osmdNotesOn
    useEffect(() => {
      console.log('osmdNotesOnStr / cursorNotes ', osmdNotesOnStr, cursorNotes);
      if (
        osmdSettings.iterateCursorOnInput &&
        osmdSettings.showCursor &&
        osmd?.current?.cursor &&
        !osmd.current.cursor.Iterator.EndReached &&
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
      osmdSettings.iterateCursorOnInput,
      osmdSettings.showCursor,
      cursorNotes,
      osmdNotesOnStr,
      channelId,
      dispatch,
      incrementCursor,
    ]);

    // move cursor to the first measure
    const onCursorReset = () => {
      if (osmd?.current) {
        osmd.current.cursor.resetIterator();
        osmd.current.cursor.update();
        updateCursorNotes();
      }
    };

    return (
      <Box
        className={classes.container}
        sx={{ backgroundColor: backgroundColor }}
      >
        <div id={containerDivId} />
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
                margin: 'auto',
              }}
            >
              <OSMDFileSelector osmdSettings={osmdSettings} blockId={blockId} />
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
                    className={msClasses.iconButton}
                    onClick={onCursorReset}
                    aria-label="reset"
                  >
                    <FirstPageIcon />
                  </Button>
                </Tooltip>
                {/* <Tooltip arrow title="Cursor Next" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={msClasses.iconButton}
                    onClick={() => decrementCursor()}
                    aria-label="previous"
                  >
                    <NavigateBeforeIcon />
                  </Button>
                </Tooltip> */}
                <Tooltip arrow title="Cursor Next" placement="top">
                  <Button
                    variant="contained"
                    color="primary"
                    className={msClasses.iconButton}
                    onClick={() => incrementCursor()}
                    aria-label="next"
                  >
                    <NavigateNextIcon />
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
