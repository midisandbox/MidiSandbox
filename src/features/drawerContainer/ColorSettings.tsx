import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import { useAppDispatch } from '../../app/store';
import {
  parseColorToNumber,
  parseHexadecimalColorToString,
  noteColorPalettes,
} from '../../utils/utils';
import { SxPropDict } from '../../types/types';
import {
  useBlockSettingStyles,
  blockSettingMenuProps,
} from '../../assets/styles/styleHooks';
import { updateOneMidiBlock } from '../midiBlock/midiBlockSlice';

interface ColorSettingsProps {
  block: MidiBlockT;
}
function ColorSettings({ block }: ColorSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [colorPickerValue, setColorPickerValue] = useState(
    parseHexadecimalColorToString(block.colorSettings.monoChromeColor)
  );
  // define the different color styles for notes in widgets like Piano and Circle Of Fifths
  const noteColorStyles: NoteColorSettingStyle[] = [
    'Monochrome',
    'Color Palette',
  ];

  const updateColorSetting = (setting: keyof ColorSettingsT, value: any) => {
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          colorSettings: {
            ...block.colorSettings,
            [setting]: value,
          },
        },
      })
    );
  };

  const handleSelectChange =
    (setting: keyof ColorSettingsT) => (e: SelectChangeEvent) => {
      const {
        target: { value },
      } = e;
      updateColorSetting(setting, value);
    };

  const toggleColorPicker = (value: boolean) => () => {
    setDisplayColorPicker(value);
  };

  const handleColorChange = (color: ColorResult) => {
    setColorPickerValue(color.hex);
  };

  const handleColorPickerClose = () => {
    toggleColorPicker(false)();
    updateColorSetting('monoChromeColor', parseColorToNumber(colorPickerValue));
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel
            sx={{ padding: 0, textAlign: 'left' }}
            id="color-style-label"
          >
            Color Style
          </InputLabel>
          <Select
            labelId="color-style-label"
            value={block.colorSettings.style}
            label="Color Style"
            onChange={handleSelectChange('style')}
            MenuProps={blockSettingMenuProps}
          >
            {noteColorStyles.map((style) => (
              <MenuItem key={style} value={style}>
                {style}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      {block.colorSettings.style === 'Monochrome' && styles && (
        <Grid item xs={12}>
          <Box
            sx={{
              ...styles.colorPickerCont,
              ':hover': {
                color: parseHexadecimalColorToString(
                  block.colorSettings.monoChromeColor
                ),
              },
            }}
            onClick={toggleColorPicker(true)}
          >
            <Box
              sx={{
                ...styles.colorExampleBlock,
                backgroundColor: colorPickerValue,
              }}
            ></Box>
            Change Color
          </Box>
          {displayColorPicker ? (
            <Box sx={styles.colorPopover}>
              <Box
                sx={styles.colorPickerCover}
                onClick={handleColorPickerClose}
              />
              <ChromePicker
                disableAlpha
                color={colorPickerValue}
                onChangeComplete={handleColorChange}
              />
            </Box>
          ) : null}
        </Grid>
      )}
      {block.colorSettings.style === 'Color Palette' && (
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <InputLabel id="color-palette-label">Color Palette</InputLabel>
            <Select
              labelId="color-palette-label"
              value={block.colorSettings.colorPalette}
              label="Color Palette"
              onChange={handleSelectChange('colorPalette')}
              MenuProps={blockSettingMenuProps}
            >
              {Object.keys(noteColorPalettes).map((palette) => (
                <MenuItem key={palette} value={palette}>
                  {palette}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </>
  );
}

const styles = {
  colorPopover: {
    position: 'absolute',
    zIndex: '2',
  },
  colorPickerCover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
  colorPickerCont: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  colorExampleBlock: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    mr: 2,
  },
} as SxPropDict;

export default ColorSettings;
