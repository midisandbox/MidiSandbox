import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { Checkbox, Grid, Slider, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { useBlockSettingStyles } from '../../assets/styles/styleHooks';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
import FileSelector from './FileSelector';

interface MidiFilePlayerSettingsProps {
  block: MidiBlockT;
}
function MidiFilePlayerSettings({ block }: MidiFilePlayerSettingsProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const [midiFilePlayerSettings, setMidiFilePlayerSettings] = useState(
    block.midiFilePlayerSettings
  );

  useEffect(() => {
    setMidiFilePlayerSettings(block.midiFilePlayerSettings);
  }, [block.midiFilePlayerSettings]);

  const handleSliderChange =
    (setting: keyof MidiFilePlayerSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      const updatedMidiFilePlayerSettings = {
        ...midiFilePlayerSettings,
        [setting]: newValue,
      };
      setMidiFilePlayerSettings(updatedMidiFilePlayerSettings);
    };
  const handleSliderChangeCommitted =
    (setting: keyof MidiFilePlayerSettingsT) =>
    (event: React.SyntheticEvent | Event, value: number | Array<number>) => {
      updateSettings({
        [setting]: value as number,
      });
    };

  const handleCheckboxClick =
    (setting: keyof MidiFilePlayerSettingsT) => () => {
      updateSettings({
        [setting]: !block.midiFilePlayerSettings[setting],
      });
    };

  // handle both midi and audio file select change
  const onFileSelectorChange = (
    value: UploadedFileT | UploadedFileT[] | null
  ) => {
    if (value === null) return;
    let settingUpdate = Array.isArray(value)
      ? {
          selectedMidiFiles: value,
        }
      : {
          selectedAudioFile: value,
        };
    updateSettings(settingUpdate);
  };

  const updateSettings = (settingUpdate: Partial<MidiFilePlayerSettingsT>) => {
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          midiFilePlayerSettings: {
            ...block.midiFilePlayerSettings,
            ...settingUpdate,
          },
        },
      })
    );
  };

  return (
    <>
      <Grid item xs={12}>
        <Tooltip
          arrow
          title="Upload and select one or more midi files to use as an input. Each file that's selected will appear as an option in other widgets' Midi Input setting. Optionally, add an audio file to sync with the midi player."
          placement="left"
        >
          <Box sx={{ display: 'flex' }}>
            <HelpOutlineIcon color="secondary" sx={{ mr: 2 }} />
            <Typography color="secondary" variant="body1">
              Learn More
            </Typography>
          </Box>
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <FileSelector
          selectLabel="Select Midi File(s)"
          folder="midi"
          blockId={block.id}
          multi={true}
          multiSelectValue={midiFilePlayerSettings.selectedMidiFiles.map(
            (x) => x.key
          )}
          onSelectChange={onFileSelectorChange}
        />
      </Grid>
      <Grid item xs={12}>
        <FileSelector
          showLoginLink={false}
          selectLabel="Select Audio File"
          folder="audio"
          blockId={block.id}
          selectValue={midiFilePlayerSettings.selectedAudioFile?.key}
          onSelectChange={onFileSelectorChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="volume" gutterBottom>
            Volume:
            <Typography color="secondary" component="span" fontWeight={500}>
              {' '}
              {`${Math.round(midiFilePlayerSettings.volume * 100)}%`}
            </Typography>
          </Typography>
          <Box sx={{ mr: 3 }}>
            <Slider
              value={midiFilePlayerSettings.volume}
              onChange={handleSliderChange('volume')}
              onChangeCommitted={handleSliderChangeCommitted('volume')}
              aria-labelledby="volume"
              step={0.01}
              min={0}
              max={1}
            />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="body1" id="audioDelay" gutterBottom>
            Audio - Midi Delay:
            <Typography color="secondary" component="span" fontWeight={500}>
              {' '}
              {`${Math.round(midiFilePlayerSettings.audioDelay)}ms`}
            </Typography>
          </Typography>
          <Box sx={{ mr: 3 }}>
            <Slider
              value={midiFilePlayerSettings.audioDelay}
              onChange={handleSliderChange('audioDelay')}
              onChangeCommitted={handleSliderChangeCommitted('audioDelay')}
              aria-labelledby="audioDelay"
              step={1}
              min={-3000}
              max={3000}
            />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          onClick={handleCheckboxClick('controlGlobalPlayback')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          className={classes.checkbox}
        >
          <Checkbox checked={midiFilePlayerSettings.controlGlobalPlayback} />
          <Typography variant="body1">Control Global Playback</Typography>
          <Tooltip
            arrow
            title="If enabled, then the playback buttons will automatically trigger playback events for any other widgets listening to global playback, such as a Sheet Music widget."
            placement="top"
          >
            <HelpOutlineIcon color="secondary" sx={{ ml: 2 }} />
          </Tooltip>
        </Box>
      </Grid>
    </>
  );
}

export default MidiFilePlayerSettings;
