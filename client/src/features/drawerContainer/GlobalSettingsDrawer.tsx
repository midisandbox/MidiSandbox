import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  PaletteMode,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { setGlobalThemeMode } from '../../app/globalSettingsSlice';
import { useAppDispatch } from '../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../assets/styles/styleHooks';

export default function GlobalSettingsDrawer() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const classes = useBlockSettingStyles();

  const updateGlobalTheme = (e: SelectChangeEvent) => {
    dispatch(setGlobalThemeMode(e.target.value as PaletteMode));
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="themeMode-label">Theme</InputLabel>
          <Select
            labelId="themeMode-label"
            value={theme.palette.mode}
            label="Theme"
            onChange={updateGlobalTheme}
            MenuProps={blockSettingMenuProps}
          >
            <MenuItem value={'dark'}>Dark</MenuItem>
            <MenuItem value={'light'}>Light</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
