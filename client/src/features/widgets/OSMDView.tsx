import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import React, { useEffect, useRef, useState } from 'react';
import { useTypedSelector } from '../../app/store';
import alvinRow from '../../temp/Alvin-Row.mxl';
import { BlockTheme, OSMDSettingsT } from '../../utils/helpers';
import { selectNotesOnStr } from '../midiListener/midiChannelSlice';
import LoadingOverlay from '../utilComponents/LoadingOverlay';

// alvin row
// https://drive.google.com/uc?id=1zRm6Qc3s2MOk-TlEByOJUGBeijw4aV9-&export=download

interface OSMDViewProps {
  channelId: string;
  containerWidth: number;
  containerHeight: number;
  osmdSettings: OSMDSettingsT;
  blockTheme: BlockTheme;
}
const OSMDView = React.memo(
  ({
    channelId,
    containerWidth,
    containerHeight,
    osmdSettings,
    blockTheme,
  }: OSMDViewProps) => {
    const notesOnStr = useTypedSelector((state) =>
      selectNotesOnStr(state, channelId)
    );
    const muiTheme = useTheme();
    const osmd = useRef<OSMD>();
    const [osmdLoadingState, setOsmdLoadingState] = useState<
      'uninitiated' | 'loading' | 'loaded' | 'rendering' | 'complete'
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

    useEffect(() => {
      console.log('INIT OSMD');
      setOsmdLoadingState('loading');
      const containerDivId = `osmd-container`;
      const containerDiv = document.getElementById(containerDivId);
      // make sure the container is empty before loading osmd (hot-loading was causing issue)
      if (containerDiv?.hasChildNodes()) {
        containerDiv.innerHTML = '';
      }
      osmd.current = new OSMD(containerDivId, {
        autoResize: false,
        backend: 'svg', // 'svg' or 'canvas'. NOTE: defaultColorMusic is currently not working with 'canvas'
        drawingParameters: 'compacttight',
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
      osmd.current.EngravingRules.PageBackgroundColor = backgroundColor;
      osmd.current.load(alvinRow).then((result) => {
        setOsmdLoadingState('loaded');
      });
    }, [
      osmdSettings.horizontalStaff,
      osmdSettings.drawTitle,
      osmdSettings.drawFromMeasureNumber,
      osmdSettings.drawUpToMeasureNumber,
      backgroundColor,
      textColor,
      cursorAlpha,
      muiTheme.palette.primary.main,
    ]);

    // rerender on container size change
    useEffect(() => {
      if (
        ['loaded', 'complete'].includes(osmdLoadingState) &&
        osmd &&
        osmd.current
      ) {
        if (osmd.current.IsReadyToRender()) {
          console.log('RENDER OSMD');
          setOsmdLoadingState('rendering');
          osmd.current.zoom = osmdSettings.zoom;
          osmd.current.render();
          if (osmdSettings.showCursor) {
            osmd.current.cursor.show();
          }
          updateCursorNotes();
          setOsmdLoadingState('complete');
        } else {
          // console.error('OSMD tried to render() but it is not ready!');
        }
      }
    }, [
      osmdLoadingState,
      containerWidth,
      containerHeight,
      osmdSettings.zoom,
      osmdSettings.showCursor,
    ]);

    const updateCursorNotes = () => {
      if (osmd?.current?.cursor) {
        let newNotes: number[] = [];
        osmd.current.cursor.NotesUnderCursor().forEach((note) => {
          const midiNoteNum = note.halfTone;
          if (
            note.PrintObject &&
            !newNotes.includes(midiNoteNum) &&
            !note.isRest()
          ) {
            newNotes.push(midiNoteNum);
          }
        });
        newNotes = newNotes.sort((a, b) => a - b);
        setCursorNotes(JSON.stringify(newNotes));
      }
    };

    useEffect(() => {
      console.log('cursorNotes: ', cursorNotes);
      console.log('notesOnStr: ', notesOnStr);
      // FIXME: test and fix below logic
      if (
        ['[]', notesOnStr].includes(cursorNotes) &&
        osmd?.current?.cursor &&
        !osmd.current.cursor.Iterator.EndReached
      ) {
        osmd.current.cursor.next();
        updateCursorNotes();
      }
    }, [cursorNotes, notesOnStr]);

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
        {osmdLoadingState !== 'complete' && <LoadingOverlay />}
        <button
          onClick={() => {
            if (osmd && osmd.current) {
              osmd.current.render();
            }
          }}
        >
          rerender
        </button>
        <button
          onClick={() => {
            if (osmd && osmd.current) {
              osmd.current.cursor.next();
              updateCursorNotes();
            }
          }}
        >
          next
        </button>
        <button
          onClick={() => {
            if (osmd && osmd.current) {
              osmd.current.cursor.resetIterator();
              osmd.current.cursor.update();
              updateCursorNotes();
            }
          }}
        >
          resetIterator
        </button>
        <div id={`osmd-container`} />
      </Box>
    );
  }
);

export default OSMDView;
