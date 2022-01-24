import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import alvinRow from '../../temp/Alvin-Row.mxl';
import { BlockTheme, OSMDSettingsT } from '../../utils/helpers';
import { SxPropDict } from '../../utils/types';
import {
  selectOSMDNotesOnStr,
  updateOneMidiChannel,
} from '../midiListener/midiListenerSlice';
import LoadingOverlay from '../utilComponents/LoadingOverlay';

// alvin row
// https://drive.google.com/uc?id=1zRm6Qc3s2MOk-TlEByOJUGBeijw4aV9-&export=download

interface OSMDViewProps {
  channelId: string;
  containerWidth: number;
  containerHeight: number;
  osmdSettings: OSMDSettingsT;
  blockTheme: BlockTheme;
  hover: boolean;
}
const OSMDView = React.memo(
  ({
    channelId,
    containerWidth,
    containerHeight,
    osmdSettings,
    blockTheme,
    hover,
  }: OSMDViewProps) => {
    const osmdNotesOnStr = useTypedSelector((state) =>
      selectOSMDNotesOnStr(state, channelId)
    );
    const dispatch = useAppDispatch();
    const muiTheme = useTheme();
    const osmd = useRef<OSMD>();
    const [osmdLoadingState, setOSMDLoadingState] = useState<
      'uninitiated' | 'loading' | 'complete'
    >('uninitiated');
    const [cursorNotes, setCursorNotes] = useState('[]');
    let backgroundColor = muiTheme.custom.darkBackground;
    let textColor = muiTheme.custom.darkText;
    let cursorAlpha = 0.15;
    if (blockTheme === 'Light') {
      cursorAlpha = 0.45;
      backgroundColor = muiTheme.custom.lightBackground;
      textColor = muiTheme.custom.lightText;
    }

    // initialize and render OSMD
    useEffect(() => {
      console.log('INIT OSMD');
      setOSMDLoadingState('loading');
      const containerDivId = `osmd-container`;
      const containerDiv = document.getElementById(containerDivId);
      // make sure the container is empty before loading osmd (hot-loading was causing issue)
      if (containerDiv?.hasChildNodes()) {
        containerDiv.innerHTML = '';
      }
      osmd.current = new OSMD(containerDivId, {
        autoResize: false,
        backend: blockTheme === 'Light' ? 'canvas' : 'svg', // 'svg' or 'canvas'. NOTE: defaultColorMusic is currently not working with 'canvas'
        defaultColorMusic: textColor,
        colorStemsLikeNoteheads: true,
        drawTitle: osmdSettings.drawTitle,
        renderSingleHorizontalStaffline: osmdSettings.horizontalStaff,
        drawFromMeasureNumber: osmdSettings.drawFromMeasureNumber,
        drawUpToMeasureNumber: osmdSettings.drawUpToMeasureNumber,
        followCursor: true,
        cursorsOptions: [
          {
            type: 0,
            alpha: cursorAlpha,
            color: muiTheme.palette.primary.main,
            follow: true,
          },
        ],
      });

      osmd.current.load(alvinRow).then((result) => {
        if (osmd?.current?.IsReadyToRender()) {
          osmd.current.DrawingParameters.setForCompactTightMode();
          osmd.current.DrawingParameters.Rules.MinimumDistanceBetweenSystems = 12;
          osmd.current.EngravingRules.PageBackgroundColor = backgroundColor;

          osmd.current.zoom = osmdSettings.zoom;
          osmd.current.render();
          if (osmdSettings.showCursor) {
            osmd.current.cursor.show();
          }
          updateCursorNotes();
          setOSMDLoadingState('complete');
        } else {
          console.error('OSMD tried to render but was not ready!');
        }
      });
    }, [
      osmdSettings.horizontalStaff,
      osmdSettings.drawTitle,
      osmdSettings.drawFromMeasureNumber,
      osmdSettings.drawUpToMeasureNumber,
      osmdSettings.zoom,
      osmdSettings.showCursor,
      blockTheme,
      backgroundColor,
      textColor,
      cursorAlpha,
      muiTheme.palette.primary.main,
      containerWidth,
      containerHeight,
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
      console.log('cursorNotes // osmdNotesOnStr: ', cursorNotes,osmdNotesOnStr);
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

    const onCursorReset = () => {
      if (osmd?.current) {
        osmd.current.cursor.resetIterator();
        osmd.current.cursor.update();
        updateCursorNotes();
      }
    };

    const onCursorNext = () => {
      if (osmd?.current) {
        osmd.current.cursor.next();
        osmd.current.cursor.update();
        updateCursorNotes();
      }
    };

    return (
      <Box
        sx={{
          height: '100%',
          backgroundColor: backgroundColor,
          overflow: 'scroll',
          pt: 2,
          pl: 2,
        }}
      >
        {osmdLoadingState !== 'complete' && <LoadingOverlay animate={true} />}
        <div id={`osmd-container`} />
        {osmdSettings.showCursor && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              textAlign: 'center',
              width: '100%',
              zIndex: hover ? 1 : -1,
            }}
          >
            <Tooltip arrow title="Reset Cursor" placement="top">
              <IconButton
                color="default"
                sx={styles.iconButton}
                onClick={onCursorReset}
                aria-label="reset"
              >
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Next Cursor Step" placement="top">
              <IconButton
                color="default"
                sx={styles.iconButton}
                onClick={onCursorNext}
                aria-label="next"
              >
                <NavigateNextIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  }
);

const styles = {
  iconButton: {
    mr: 1,
    ml: 1,
    mb: 2,
    p: 1,
    backgroundColor: '#00000075',
    ':hover': {
      backgroundColor: '#0000006b',
    },
  },
} as SxPropDict;

export default OSMDView;
