import { FormControl, Grid, TextField } from '@mui/material';
import React from 'react';
import { useAppDispatch } from '../../app/store';
import { useBlockSettingStyles } from '../../assets/styles/styleHooks';
import { YoutubePlayerSettingsT } from '../../utils/helpers';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';

interface YoutubePlayerSettingsProps {
  block: MidiBlockT;
}
function YoutubePlayerSettings({ block }: YoutubePlayerSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();

  const handleInputChange =
    (setting: keyof YoutubePlayerSettingsT) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            youtubePlayerSettings: {
              ...block.youtubePlayerSettings,
              [setting]: e.target.value,
            },
          },
        })
      );
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
    </>
  );
}

export default YoutubePlayerSettings;
