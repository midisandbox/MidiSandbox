import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleOutlinedIcon from '@mui/icons-material/DragHandleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Button,
  createTheme,
  Menu,
  MenuItem,
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
import ChordEstimator from '../widgets/ChordEstimator';
import CircleOfFifths, {
  CircleOfFifthsBlockButtons,
} from '../widgets/CircleOfFifths';
import Tonnetz from '../widgets/Tonnetz';
import OSMDView from '../widgets/OSMDView/OSMDView';
import Piano from '../widgets/Piano';
import YoutubePlayer from '../widgets/YoutubePlayer';
import Staff from '../widgets/Staff/Staff';
import {
  addMidiBlockAndLayout,
  removeMidiBlockAndLayout,
  selectMidiBlockById,
} from './midiBlockSlice';

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
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openDeleteMenu = Boolean(deleteAnchorEl);
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
      openDrawer({
        drawerId: 'BLOCK_SETTINGS',
        drawerData: { blockId },
        tabValue: 0,
      })
    );
  };

  const addNewBlock = () => {
    const newBlock = getNewMidiBlock({ y: blockLayout.y + blockLayout.h - 1 });
    dispatch(addMidiBlockAndLayout(newBlock));
    dispatch(
      openDrawer({
        drawerId: 'BLOCK_SETTINGS',
        drawerData: { blockId: newBlock.midiBlock.id },
        tabValue: 0,
      })
    );
  };

  const deleteBlock = () => {
    dispatch(removeMidiBlockAndLayout(blockId));
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
            blockId={block.id}
            osmdFile={null}
            channelId={block.channelId}
            hover={hover}
            osmdSettings={block.osmdSettings}
            containerHeight={height}
            containerWidth={width}
            colorSettings={block.colorSettings}
          />
        );
      } else if (block.widget === 'Youtube Player') {
        widget = (
          <YoutubePlayer
            youtubePlayerSettings={block.youtubePlayerSettings}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Tonnetz') {
        widget = (
          <Tonnetz
            channelId={block.channelId}
            colorSettings={block.colorSettings}
            containerHeight={height}
            containerWidth={width}
          />
        );
      }
    }
    return { widget, widgetButtons };
  };

  const closeDeleteMenu = () => {
    setDeleteAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        ref={ref}
        onMouseEnter={handleHoverEvent(true)}
        onMouseLeave={handleHoverEvent(false)}
        key={block.id}
        sx={{
          bgcolor: 'background.paper',
          height: '100%',
          overflow: 'hidden',
          border: `2px solid ${theme.palette.divider}`,
        }}
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
            <>
              <Tooltip arrow title="Delete Block" placement="left">
                <Button
                  variant="contained"
                  sx={styles.block_icon}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    setDeleteAnchorEl(e.currentTarget);
                  }}
                  id="delete-block"
                  aria-controls={openDeleteMenu ? 'basic-menu' : undefined}
                  aria-expanded={openDeleteMenu ? 'true' : undefined}
                  aria-label="delete block"
                  aria-haspopup="true"
                >
                  <DeleteIcon />
                </Button>
              </Tooltip>
              <Menu
                id="delete-block-menu"
                anchorEl={deleteAnchorEl}
                open={openDeleteMenu}
                onClose={closeDeleteMenu}
                MenuListProps={{
                  'aria-labelledby': 'delete-block',
                }}
              >
                <MenuItem onClick={deleteBlock}>Confirm Delete</MenuItem>
                <MenuItem onClick={closeDeleteMenu}>Cancel</MenuItem>
              </Menu>
            </>
          )}
          {renderWidget().widgetButtons}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const styles = {
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
