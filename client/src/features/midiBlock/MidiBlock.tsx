import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Button,
  createTheme,
  responsiveFontSizes,
  Tooltip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { Layout } from 'react-grid-layout';
import { useResizeDetector } from 'react-resize-detector';
import { selectGlobalThemeMode } from '../../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { getCustomTheme } from '../../assets/styles/customTheme';
import { getNewMidiBlock } from '../../utils/helpers';
import { SxPropDict } from '../../utils/types';
import { openDrawer } from '../drawerContainer/drawerContainerSlice';
import { openModal } from '../modalContainer/modalContainerSlice';
import ChordEstimator from '../widgets/ChordEstimator';
import CircleOfFifths, {
  CircleOfFifthsBlockButtons,
} from '../widgets/CircleOfFifths';
import OSMDView from '../widgets/OSMDView/OSMDView';
import Piano from '../widgets/Piano';
import SoundSliceEmbed from '../widgets/SoundSliceEmbed';
import Staff from '../widgets/Staff/Staff';
import { addMidiBlockAndLayout, selectMidiBlockById } from './midiBlockSlice';

interface MidiBlockProps {
  blockLayout: Layout;
  deleteDisabled: boolean;
}

const MidiBlock = ({ blockLayout, deleteDisabled }: MidiBlockProps) => {
  const blockId = blockLayout.i;
  const { width, height, ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 500,
  });
  const dispatch = useAppDispatch();
  const [hover, setHover] = useState(false);
  const block = useTypedSelector((state) =>
    selectMidiBlockById(state, blockId)
  );
  // use globalThemeMode if block's themeMode is 'default', else use block themeMode
  const globalThemeMode = useTypedSelector(selectGlobalThemeMode);
  const theme = React.useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          getCustomTheme(
            block?.themeMode && block.themeMode !== 'default'
              ? block.themeMode
              : globalThemeMode
          )
        )
      ),
    [globalThemeMode, block?.themeMode]
  );

  const handleHoverEvent = (value: boolean) => () => {
    setHover(value);
  };

  if (!block) {
    console.error(`Could not find block! blockId: ${blockId}`);
    return null;
  }

  const openBlockSettings = () => {
    dispatch(
      openDrawer({ drawerId: 'BLOCK_SETTINGS', drawerData: { blockId } })
    );
  };

  const addNewBlock = () => {
    const newBlock = getNewMidiBlock({ y: blockLayout.y + blockLayout.h - 1 });
    dispatch(addMidiBlockAndLayout(newBlock));
  };

  const deleteBlock = () => {
    dispatch(
      openModal({
        modalId: 'DELETE_BLOCK_MODAL',
        modalData: {
          blockId,
        },
      })
    );
  };

  const renderWidget = () => {
    let widget = null;
    let widgetButtons = null;
    if (height && width) {
      if (block.widget === 'Piano') {
        widget = (
          <Piano
            pianoSettings={block.pianoSettings}
            colorSettings={block.colorSettings}
            channelId={block.channelId}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Staff') {
        widget = (
          <Staff
            channelId={block.channelId}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Circle Of Fifths') {
        widget = (
          <CircleOfFifths
            channelId={block.channelId}
            colorSettings={block.colorSettings}
            containerHeight={height}
            containerWidth={width}
          />
        );
        widgetButtons = (
          <CircleOfFifthsBlockButtons
            channelId={block.channelId}
            styles={styles}
          />
        );
      } else if (block.widget === 'Soundslice') {
        widget = (
          <SoundSliceEmbed containerHeight={height} containerWidth={width} />
        );
      } else if (block.widget === 'Chord Estimator') {
        widget = (
          <ChordEstimator
            channelId={block.channelId}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Sheet Music Viewer') {
        widget = (
          <OSMDView
            channelId={block.channelId}
            hover={hover}
            osmdSettings={block.osmdSettings}
            containerHeight={height}
            containerWidth={width}
            colorSettings={block.colorSettings}
          />
        );
      }
    }
    return { widget, widgetButtons };
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        ref={ref}
        onMouseEnter={handleHoverEvent(true)}
        onMouseLeave={handleHoverEvent(false)}
        key={block.id}
        sx={styles.midiBlockCont}
      >
        {renderWidget().widget}
        <Box
          sx={{
            ...styles.midiBlockUtilColumn,
            visibility: hover ? 'inherit' : 'hidden',
          }}
        >
          <Tooltip arrow title="Drag Handle" placement="left">
            <Button
              color="primary"
              variant="contained"
              sx={{ ...styles.block_icon, cursor: 'grab' }}
              aria-label="drag-handle"
              className="blockDragHandle"
            >
              <DragHandleOutlinedIcon />
            </Button>
          </Tooltip>
          <Tooltip arrow title="Block Settings" placement="left">
            <Button
              color="primary"
              variant="contained"
              sx={styles.block_icon}
              onClick={openBlockSettings}
              aria-label="settings"
            >
              <SettingsOutlinedIcon />
            </Button>
          </Tooltip>
          <Tooltip arrow title="Add Block Below" placement="left">
            <Button
              color="primary"
              variant="contained"
              sx={styles.block_icon}
              onClick={addNewBlock}
              aria-label="add block below"
            >
              <AddIcon />
            </Button>
          </Tooltip>
          {!deleteDisabled && (
            <Tooltip arrow title="Delete Block" placement="left">
              <Button
                color="primary"
                variant="contained"
                sx={styles.block_icon}
                onClick={deleteBlock}
                aria-label="delete block"
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          )}
          {renderWidget().widgetButtons}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const styles = {
  midiBlockCont: {
    bgcolor: 'background.paper',
    height: '100%',
    overflow: 'hidden',
  },
  midiBlockUtilColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    pt: 1,
    pb: 1,
  },
  block_icon: {
    mr: 1,
    mb: 2,
    p: 1,
    minWidth: 0,
    borderRadius: '50%',
  },
} as SxPropDict;

export default MidiBlock;
