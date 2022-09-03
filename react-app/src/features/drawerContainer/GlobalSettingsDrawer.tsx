import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  GlobalSettings,
  updateGlobalSetting,
} from '../../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { useBlockSettingStyles } from '../../assets/styles/styleHooks';
import {
  selectDefaultInputChannel,
  setDefaultInputChannel,
} from '../midiBlock/midiBlockSlice';
import KeySettings from './KeySettings';
import SelectMidiInputChannel from './SelectMidiInputChannel';

export default function GlobalSettingsDrawer() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const classes = useBlockSettingStyles();
  const { defaultInputId, defaultChannelId } = useTypedSelector(
    selectDefaultInputChannel
  );

  const handleSettingChange = (settings: Partial<GlobalSettings>) => {
    dispatch(updateGlobalSetting(settings));
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
      {/* <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="themeMode-label">Theme</InputLabel>
          <Select
            labelId="themeMode-label"
            value={theme.palette.mode}
            label="Theme"
            onChange={(e) =>
              handleSettingChange({ themeMode: e.target.value as PaletteMode })
            }
            MenuProps={blockSettingMenuProps}
          >
            <MenuItem value={'dark'}>Dark</MenuItem>
            <MenuItem value={'light'}>Light</MenuItem>
          </Select>
        </FormControl>
      </Grid> */}
      <SelectMidiInputChannel
        source="global"
        handleInputChannelChange={(newInputId: string, newChannelId: string) =>
          dispatch(
            setDefaultInputChannel({
              defaultInputId: newInputId,
              defaultChannelId: newChannelId,
            })
          )
        }
        inputId={defaultInputId}
        channelId={defaultChannelId}
      />
      <Grid item xs={12}>
        <KeySettings />
      </Grid>
    </Grid>
  );
}
