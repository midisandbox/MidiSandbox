import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Box,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import { useAppDispatch } from '../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../styles/styleHooks';
import { updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
import DebouncedSlider from '../utilComponents/DebouncedSlider';

interface YoutubeVideoPlayerSettingsProps {
  block: MidiBlockT;
}
function YoutubeVideoPlayerSettings({
  block,
}: YoutubeVideoPlayerSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();

  const updateSetting = useCallback(
    (setting: keyof YoutubeVideoPlayerSettingsT, value: any) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            youtubePlayerSettings: {
              ...block.youtubePlayerSettings,
              [setting]: value,
            },
          },
        })
      );
    },
    [block.id, block.youtubePlayerSettings, dispatch]
  );

  const handleInputChange =
    (setting: keyof YoutubeVideoPlayerSettingsT, isNumber = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      updateSetting(setting, isNumber ? parseFloat(newVal) : newVal);
    };

  const handleSelectChange =
    (setting: keyof YoutubeVideoPlayerSettingsT) => (e: SelectChangeEvent) => {
      updateSetting(setting, e.target.value);
    };

  const handleCheckboxClick =
    (setting: keyof YoutubeVideoPlayerSettingsT) => () => {
      updateSetting(setting, !block.youtubePlayerSettings[setting]);
    };

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <TextField
            size="small"
            label="Youtube URL"
            value={block.youtubePlayerSettings.url}
            onChange={handleInputChange('url')}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) =>
              e.target.select()
            }
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <DebouncedSlider
          value={block.youtubePlayerSettings.volume}
          min={0}
          max={100}
          label="Volume"
          valueSuffix="%"
          onCommitChange={(newVal) => updateSetting('volume', newVal)}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel
            sx={{ padding: 0, textAlign: 'left' }}
            id="video-fit-label"
          >
            Video Fit
          </InputLabel>
          <Select
            labelId="video-fit-label"
            value={block.youtubePlayerSettings.videoFit}
            label="Video Fit"
            onChange={handleSelectChange('videoFit')}
            MenuProps={blockSettingMenuProps}
          >
            {['contain', 'cover'].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {block.youtubePlayerSettings.videoFit === 'cover' && (
        <Grid item xs={12}>
          <DebouncedSlider
            value={block.youtubePlayerSettings.verticalScroll}
            min={0}
            max={100}
            label="Vertical Scroll"
            valueSuffix="%"
            onCommitChange={(newVal) => updateSetting('verticalScroll', newVal)}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('listenGlobalPlayback')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox
            checked={block.youtubePlayerSettings.listenGlobalPlayback}
          />
          <Typography variant="body1">Listen to Global Playback</Typography>
          <Tooltip
            arrow
            title="If enabled, then the video will automatically play/pause in sync with a Midi File Player widget that is controlling global playback."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
          </Tooltip>
        </Box>
      </Grid>
      {block.youtubePlayerSettings.listenGlobalPlayback && (
        <Grid item xs={12}>
          <FormControl className={classes.select} size="small" fullWidth>
            <TextField
              size="small"
              inputProps={{ step: '0.1', lang: 'en-US' }}
              label="Global Playback Offset (seconds)"
              type="number"
              value={block.youtubePlayerSettings.globalPlaybackStartOffset}
              onChange={handleInputChange('globalPlaybackStartOffset', true)}
              onFocus={(event: React.FocusEvent<HTMLInputElement>) =>
                event.target.select()
              }
            />
          </FormControl>
        </Grid>
      )}
    </>
  );
}

export default YoutubeVideoPlayerSettings;
