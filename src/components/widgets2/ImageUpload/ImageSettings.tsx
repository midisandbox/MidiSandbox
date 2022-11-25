import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch } from '../../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../styles/styleHooks';
import { updateOneMidiBlock } from '../../../redux/slices/midiBlockSlice';
import { ImageFileSelector } from './ImageUploadWidget';

interface ImageSettingsProps {
  block: MidiBlockT;
}
function ImageSettings({ block }: ImageSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();

  const updateImageSettings = (updatedImageSettings: ImageSettingsT) => {
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          imageSettings: updatedImageSettings,
        },
      })
    );
  };

  const handleSelectChange =
    (setting: keyof ImageSettingsT) => (e: SelectChangeEvent) => {
      const {
        target: { value },
      } = e;
      const updatedImageSettings = { ...block.imageSettings, [setting]: value };
      updateImageSettings(updatedImageSettings);
    };

  return (
    <>
      <Grid item xs={12}>
        <ImageFileSelector
          imageSettings={block.imageSettings}
          blockId={block.id}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel
            sx={{ padding: 0, textAlign: 'left' }}
            id="image-objectFit-label"
          >
            Object Fit
          </InputLabel>
          <Select
            labelId="image-objectFit-label"
            value={block.imageSettings.objectFit}
            label="Object Fit"
            onChange={handleSelectChange('objectFit')}
            MenuProps={blockSettingMenuProps}
          >
            {['fill', 'contain', 'cover'].map((objectFit) => (
              <MenuItem key={objectFit} value={objectFit}>
                {objectFit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}

export default ImageSettings;
