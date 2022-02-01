import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import {
  OSMDSettingsT,
  getNoteColorNumStr,
  ColorSettingsT,
} from '../../../utils/helpers';
import { SxPropDict } from '../../../utils/types';
import {
  selectOSMDNotesOnStr,
  updateOneMidiChannel,
} from '../../midiListener/midiListenerSlice';
import LoadingOverlay from '../../utilComponents/LoadingOverlay';

// import mxlFile from '../../temp/Alvin-Row.mxl';
// import mxlFile from '../../temp/Demo-1.mxl';
import mxlFile from '../../../temp/Alvin-Row-V2.mxl';
import { useOSMDStyles } from './OSMDUtils';
import {
  OSMDViewProps,
  errorLoadingOrRenderingSheet,
  audioPlaybackControl,
} from './OSMDUtils';
import {
  BasicAudioPlayer,
  ControlPanel,
  IAudioMetronomePlayer,
  IOSMDOptions,
  IPlaybackParametersListener,
  LinearTimingSource,
  OpenSheetMusicDisplay as OSMD,
  PlaybackManager,
} from 'osmd-extended';

// alvin row
// https://drive.google.com/uc?id=1zRm6Qc3s2MOk-TlEByOJUGBeijw4aV9-&export=download

const OSMDView = React.memo(
  ({
    channelId,
    containerWidth,
    containerHeight,
    osmdSettings,
    hover,
    colorSettings,
  }: OSMDViewProps) => {
    const dispatch = useAppDispatch();
    const osmd = useRef<OSMD>();
    const playbackManager = useRef<PlaybackManager>();
    const osmdNotesOnStr = useTypedSelector((state) =>
      selectOSMDNotesOnStr(state, channelId)
    );
    const [osmdLoadingState, setOSMDLoadingState] = useState<
      'uninitiated' | 'loading' | 'complete'
    >('uninitiated');
    const [cursorNotes, setCursorNotes] = useState('[]');
    const [currentBpm, setCurrentBpm] = useState(120);

    // theme vars
    const muiTheme = useTheme();
    const classes = useOSMDStyles();
    let backgroundColor = muiTheme.palette.background.paper;
    let textColor = muiTheme.palette.text.primary;
    let cursorAlpha = 0.15;
    if (muiTheme.palette.mode === 'light') {
      cursorAlpha = 0.45;
    }

    // initialize and render OSMD
    useEffect(() => {
      setOSMDLoadingState('loading');
      let osmdOptions: IOSMDOptions = {
        autoResize: false,
        backend: muiTheme.palette.mode === 'light' ? 'canvas' : 'svg', // 'svg' or 'canvas'. NOTE: defaultColorMusic is currently not working with 'canvas'
        defaultColorMusic: textColor,
        drawTitle: osmdSettings.drawTitle,
        renderSingleHorizontalStaffline: osmdSettings.horizontalStaff,
        drawFromMeasureNumber: osmdSettings.drawFromMeasureNumber,
        drawUpToMeasureNumber: osmdSettings.drawUpToMeasureNumber,
        followCursor: true,
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
        osmdOptions.coloringMode = 2;
        osmdOptions.coloringSetCustom = [
          getNoteColorNumStr(0, colorSettings),
          getNoteColorNumStr(2, colorSettings),
          getNoteColorNumStr(4, colorSettings),
          getNoteColorNumStr(5, colorSettings),
          getNoteColorNumStr(7, colorSettings),
          getNoteColorNumStr(9, colorSettings),
          getNoteColorNumStr(11, colorSettings),
          '#000000',
        ];
      }
      const containerDivId = `osmd-container`;
      const containerDiv = document.getElementById(containerDivId);
      // make sure the container is empty before loading osmd (hot-loading was causing issue)
      if (containerDiv?.hasChildNodes()) {
        containerDiv.innerHTML = '';
      }
      osmd.current = new OSMD(containerDivId, osmdOptions);

      osmd.current
        .load(mxlFile)
        .then(
          (result) => {
            if (osmd?.current?.IsReadyToRender()) {
              osmd.current.DrawingParameters.setForCompactTightMode();
              osmd.current.DrawingParameters.Rules.MinimumDistanceBetweenSystems = 8;
              osmd.current.EngravingRules.PageBackgroundColor = backgroundColor;
              osmd.current.zoom = osmdSettings.zoom;
              return osmd.current.render();
            } else {
              console.warn('OSMD tried to render but was not ready!');
            }
          },
          (e) => {
            errorLoadingOrRenderingSheet(e, 'rendering');
          }
        )
        .then(
          () => {
            if (osmd?.current) {
              if (osmdSettings.showCursor) osmd.current.cursor.show();
              updateCursorNotes();
              playbackManager.current = audioPlaybackControl(osmd.current);
              setCurrentBpm(osmd.current.Sheet.DefaultStartTempoInBpm);
              setOSMDLoadingState('complete');
            }
          },
          (e) => {
            errorLoadingOrRenderingSheet(e, 'loading');
          }
        );
    }, [
      osmdSettings.horizontalStaff,
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
    ]);

    // get the notes under the cursor and set cursorNotes state
    const updateCursorNotes = () => {
      if (osmd?.current?.cursor) {
        let newNotes: number[] = [];
        osmd.current.cursor.NotesUnderCursor().forEach((note) => {
          const midiNoteNum = note.halfTone;
          // make sure rests, duplicates and hidden notes are not included
          if (
            !note.isRest() &&
            !newNotes.includes(midiNoteNum) &&
            note.PrintObject
          ) {
            newNotes.push(midiNoteNum);
          }
        });
        // sort the notes from lowest to highest
        newNotes = newNotes.sort((a, b) => a - b);
        setCursorNotes(JSON.stringify(newNotes));
      }
    };

    // iterate cursor to next step if the current cursorNotes matches channel.osmdNotesOn
    useEffect(() => {
      if (
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
        osmd.current.cursor.next();
        updateCursorNotes();
      }
    }, [
      osmdSettings.showCursor,
      cursorNotes,
      osmdNotesOnStr,
      channelId,
      dispatch,
    ]);

    const updateBpm = (bpmDiff: number) => () => {
      const newBpm = currentBpm + bpmDiff;
      setCurrentBpm(newBpm);
      playbackManager?.current?.bpmChanged(newBpm);
    };

    return (
      <Box
        className={classes.container}
        sx={{ backgroundColor: backgroundColor }}
      >
        {osmdLoadingState !== 'complete' && (
          <LoadingOverlay animate={true} />
        )}
        <div id={`osmd-container`} />
        {osmdSettings.showCursor && (
          <Box
            className={classes.osmdButtonCont}
            sx={{
              visibility: hover ? 'inherit' : 'hidden',
            }}
          >
            <Tooltip arrow title="BPM" placement="top">
              <ButtonGroup
                className={classes.buttonGroup}
                disableElevation
                variant="contained"
              >
                <Button
                  color="secondary"
                  className={classes.buttonGroupItem}
                  sx={{
                    borderTopLeftRadius: '50%',
                    borderBottomLeftRadius: '50%',
                  }}
                  onClick={updateBpm(-5)}
                >
                  <RemoveIcon />
                </Button>
                <Box color="secondary" className={classes.buttonGroupText}>
                  {currentBpm}
                </Box>
                <Button
                  color="secondary"
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
            <Tooltip arrow title="Reset Cursor" placement="top">
              <Button
                variant="contained"
                color="secondary"
                className={classes.iconButton}
                onClick={() => playbackManager.current?.reset()}
                aria-label="reset"
              >
                <RestartAltIcon />
              </Button>
            </Tooltip>
            <Tooltip arrow title="Pause" placement="top">
              <Button
                variant="contained"
                color="secondary"
                className={classes.iconButton}
                onClick={() => playbackManager.current?.pause()}
                aria-label="pause"
              >
                <PauseIcon />
              </Button>
            </Tooltip>
            <Tooltip arrow title="Play" placement="top">
              <Button
                variant="contained"
                color="secondary"
                className={classes.iconButton}
                onClick={() => playbackManager.current?.play()}
                aria-label="play"
              >
                <PlayArrowIcon />
              </Button>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  }
);

export default OSMDView;
