import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Checkbox, Grid, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useAppDispatch } from '../../../redux/store';
import { useBlockSettingStyles } from '../../../styles/styleHooks';
import { updateOneMidiBlock } from '../../../redux/slices/midiBlockSlice';

interface CircleOfFifthsSettingsProps {
  block: MidiBlockT;
}
function CircleOfFifthsSettings({ block }: CircleOfFifthsSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();

  const updateCircleOfFifthsSetting = (
    setting: keyof CircleOfFifthsSettingsT,
    value: any
  ) => {
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          circleOfFifthsSettings: {
            ...block.circleOfFifthsSettings,
            [setting]: value,
          },
        },
      })
    );
  };

  const handleCheckboxClick =
    (setting: keyof CircleOfFifthsSettingsT) => () => {
      updateCircleOfFifthsSetting(
        setting,
        !block.circleOfFifthsSettings[setting]
      );
    };

  return (
    <>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('keyPrevalenceShading')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox
            checked={block.circleOfFifthsSettings.keyPrevalenceShading}
          />
          <Typography variant="body1">Key prevalence shading</Typography>
          <Tooltip
            arrow
            title="If enabled, the notes in the circle will be shaded based on how many input notes are within each key. Eg. if you play a song in the key of C major then the the Gb major slice of the Circle of 5ths will be dim, since it shares very few notes with C major. You can reset this by hovering the Circle widget and clicking the refresh button."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
          </Tooltip>
        </Box>
      </Grid>
    </>
  );
}

export default CircleOfFifthsSettings;
