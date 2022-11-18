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
import { getDefaultMidiBlock, isDblTouchTap } from '../../utils/helpers';
import { SxPropDict } from '../../utils/types';
import { openDrawer } from '../drawerContainer/drawerContainerSlice';
import {
  selectJoyrideTour,
  updateJoyrideTour,
} from '../joyride/joyrideTourSlice';
import MidiFilePlayer from '../midiFilePlayer/MidiFilePlayer';
import ChordEstimator from '../widgets/ChordEstimator';
import CircleOfFifths, {
  CircleOfFifthsBlockButtons,
} from '../widgets/CircleOfFifths';
import ImageUpload from '../widgets/ImageUpload';
import { OSMDBlockButtons } from '../widgets/OSMDView/OSMDUtils';
import OSMDView from '../widgets/OSMDView/OSMDView';
import Piano from '../widgets/Piano';
import Staff from '../widgets/Staff/Staff';
import Tonnetz from '../widgets/Tonnetz';
import YoutubeVideoPlayer from '../widgets/YoutubeVideoPlayer';
import {
  addMidiBlockAndLayout,
  removeMidiBlockAndLayout,
  selectMidiBlockById,
} from './midiBlockSlice';

interface MidiBlockProps {
  blockLayout: Layout;
  deleteDisabled: boolean;
  blockIndex: number;
}

const MidiBlock = ({
  blockLayout,
  deleteDisabled,
  blockIndex,
}: MidiBlockProps) => {
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
  const joyrideTour = useTypedSelector(selectJoyrideTour);
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openDeleteMenu = Boolean(deleteAnchorEl);
  // use globalThemeMode if block's themeMode is 'default', else use block themeMode
  const globalThemeMode = useTypedSelector(selectGlobalThemeMode);
  let blockThemeMode =
    block?.themeMode && block.themeMode !== 'default'
      ? block.themeMode
      : globalThemeMode;
  // use light mode as default for sheet music, no matter the global theme
  if (block?.widget === 'Sheet Music' && block.themeMode === 'default') {
    blockThemeMode = 'light';
  }
  const theme = React.useMemo(
    () => responsiveFontSizes(createTheme(getCustomTheme(blockThemeMode))),
    [blockThemeMode]
  );

  const handleHoverEvent = (value: boolean) => () => {
    setHover(value);
  };

  if (!block) {
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
    if (joyrideTour.tour === 'GET_STARTED') {
      dispatch(
        updateJoyrideTour({
          stepIndex: joyrideTour.stepIndex + 1,
        })
      );
    }
  };

  const addNewBlock = () => {
    const newBlock = getDefaultMidiBlock(theme, {
      y: blockLayout.y + blockLayout.h - 1,
      x: blockLayout.x,
      w: blockLayout.w,
      h: blockLayout.h,
    });
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
      } else if (block.widget === 'Grand Staff') {
        widget = (
          <Staff
            channelId={block.channelId}
            containerHeight={height}
            containerWidth={width}
            staffSettings={block.staffSettings}
          />
        );
      } else if (block.widget === 'Circle Of Fifths') {
        widget = (
          <CircleOfFifths
            channelId={block.channelId}
            colorSettings={block.colorSettings}
            containerHeight={height}
            containerWidth={width}
            circleOfFifthsSettings={block.circleOfFifthsSettings}
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
      } else if (block.widget === 'Sheet Music') {
        widget = (
          <OSMDView
            blockId={block.id}
            osmdFile={null}
            channelId={block.channelId}
            hover={hover}
            osmdSettings={block.osmdSettings}
            colorSettings={block.colorSettings}
            themeMode={blockThemeMode}
          />
        );
        widgetButtons = <OSMDBlockButtons block={block} styles={styles} />;
      } else if (block.widget === 'Youtube Player') {
        widget = (
          <YoutubeVideoPlayer
            blockId={block.id}
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
            tonnetzSettings={block.tonnetzSettings}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Image') {
        widget = (
          <ImageUpload
            imageFile={null}
            blockId={block.id}
            imageSettings={block.imageSettings}
            containerHeight={height}
            containerWidth={width}
          />
        );
      } else if (block.widget === 'Midi File Player') {
        widget = (
          <MidiFilePlayer
            blockId={block.id}
            containerHeight={height}
            containerWidth={width}
            midiFilePlayerSettings={block.midiFilePlayerSettings}
          />
        );
      }
      // else if (block.widget === 'Notepad') {
      //   widget = (
      //     <Notepad
      //       block={block}
      //       containerHeight={height}
      //       containerWidth={width}
      //     />
      //   );
      // }
    }
    return { widget, widgetButtons };
  };

  const closeDeleteMenu = () => {
    setDeleteAnchorEl(null);
  };

  const blockButtonsVisible =
    hover ||
    (joyrideTour.tour === 'GET_STARTED' &&
      blockIndex === 0 &&
      joyrideTour.stepIndex === 1);

  return (
    <ThemeProvider theme={theme}>
      <Box
        className={`midi-block-${blockIndex}`}
        ref={ref}
        onMouseEnter={handleHoverEvent(true)}
        onMouseLeave={handleHoverEvent(false)}
        key={block.id}
        sx={{
          bgcolor: 'background.paper',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          onTouchEnd={(e) => {
            if (isDblTouchTap(e)) {
              setTimeout(() => {
                handleHoverEvent(!hover)();
              }, 100);
            }
          }}
          sx={{ height: '100%', width: '100%' }}
        >
          {renderWidget().widget}
        </Box>
        <Box
          sx={{
            ...styles.midiBlockUtilColumn,
            visibility: blockButtonsVisible ? 'inherit' : 'hidden',
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
              className={`block-settings-btn-${blockIndex}`}
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
