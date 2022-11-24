import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  selectGlobalSettings,
  updateGlobalSetting,
} from '../../redux/slices/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../styles/styleHooks';
import { checkKeySignatureUsesSharps } from '../../utils/utils';

function KeySettings() {
  const dispatch = useAppDispatch();
  const classes = useBlockSettingStyles();
  const globalSettings = useTypedSelector(selectGlobalSettings);
  const keyOptions: KeyOption[] = [
    'C',
    'G',
    'D',
    'A',
    'E',
    'B',
    'F#',
    'Gb',
    'Db',
    'Ab',
    'Eb',
    'Bb',
    'F',
  ];

  const handleKeyChange = (e: SelectChangeEvent) => {
    const {
      target: { value },
    } = e;
    const typedValue = value as KeyOption;
    dispatch(
      updateGlobalSetting({
        globalKeySignature: typedValue,
        globalKeySignatureUsesSharps: checkKeySignatureUsesSharps(typedValue),
      })
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <FormControl className={classes.select} size="small" fullWidth>
          <InputLabel id="channel-key-label">Key</InputLabel>
          <Select
            labelId="channel-key-label"
            value={globalSettings.globalKeySignature}
            label="Key"
            onChange={handleKeyChange}
            MenuProps={blockSettingMenuProps}
          >
            {keyOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}

export default KeySettings;
