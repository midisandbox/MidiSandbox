import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import { useWebMidiManager } from '../../utils/webMidiUtils';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../styles/styleHooks';
import { Box } from '@mui/system';

interface SelectMidiOutputChannelProps {
  handleOutputChannelChange(newOutputId: string, newChannel: string): void;
  outputId: string;
  channel: string;
  source: string;
}
export default function SelectMidiOutputChannel({
  outputId,
  channel,
  handleOutputChannelChange,
  source,
}: SelectMidiOutputChannelProps) {
  const classes = useBlockSettingStyles();
  const webMidiManager = useWebMidiManager();
  const outputs = webMidiManager.instance
    ? webMidiManager.instance.outputs
    : [];
  const channelOptions = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
  ];

  const handleChange = (
    setting: string,
    newOutputId: string,
    newChannel: string
  ) => {
    if (setting === 'outputId') {
      if (newOutputId === '') {
        newChannel = '1';
      } else {
        const selectedOutput = outputs.find(
          (output) => output.id === newOutputId
        );
        if (selectedOutput) {
          newChannel = '1';
        }
      }
    }
    return handleOutputChannelChange(newOutputId, newChannel);
  };

  return (
    <>
      <Grid key="output-setting" item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'end' }}>
          <FormControl
            id={`${source}-output-select`}
            className={classes.select}
            size="small"
            fullWidth
          >
            <InputLabel id="block-output-label" sx={{ display: 'flex' }}>
              MIDI Output
            </InputLabel>
            <Select
              labelId="block-output-label"
              value={outputId}
              label="MIDI Output"
              onChange={(e) =>
                handleChange('outputId', e.target.value, channel)
              }
              MenuProps={blockSettingMenuProps}
            >
              {outputs.length === 0 ? (
                <MenuItem
                  key={`output-options-empty`}
                  value={`output-options-empty`}
                  disabled
                >
                  {`No devices found. Try connecting a`}
                  <br />
                  {'midi device and refresh the page.'}
                </MenuItem>
              ) : (
                <MenuItem value={''}>None</MenuItem>
              )}
              {outputs.map((output) => (
                <MenuItem key={output.id} value={output.id}>
                  {`${output.name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{ width: '130px', ml: 2 }}
            className={classes.select}
            size="small"
            fullWidth
          >
            <InputLabel id="block-channel-label">Channel</InputLabel>
            <Select
              labelId="block-channel-label"
              value={channel}
              label="Channel"
              onChange={(e) =>
                handleChange('channelId', outputId, e.target.value)
              }
              MenuProps={blockSettingMenuProps}
            >
              {!outputId ? (
                <MenuItem
                  key={`channel-options-empty`}
                  value={`channel-options-empty`}
                  disabled
                >
                  {`Select an Output before setting the channel.`}
                </MenuItem>
              ) : (
                channelOptions.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {channel}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Tooltip
            arrow
            title="Sends the notes from the sheet music to a midi output during playback."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2, mb: 2 }} />
          </Tooltip>
        </Box>
      </Grid>
    </>
  );
}
