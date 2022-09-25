import { Grid, Slider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { MidiBlockT, updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
import FileSelector from './FileSelector';

interface MidiFilePlayerSettingsProps {
  block: MidiBlockT;
}
function MidiFilePlayerSettings({ block }: MidiFilePlayerSettingsProps) {
  const dispatch = useAppDispatch();
  const [midiFilePlayerSettings, setMidiFilePlayerSettings] = useState(
    block.midiFilePlayerSettings
  );

  useEffect(() => {
    setMidiFilePlayerSettings(block.midiFilePlayerSettings);
  }, [block.midiFilePlayerSettings]);

  const debouncedStoreUpdate = useMemo(
    () =>
      debounce((updatedMidiFilePlayerSettings: MidiFilePlayerSettingsT) => {
        dispatch(
          updateOneMidiBlock({
            id: block.id,
            changes: {
              midiFilePlayerSettings: updatedMidiFilePlayerSettings,
            },
          })
        );
      }, 500),
    [dispatch, block.id]
  );

  const handleSliderChange =
    (setting: keyof MidiFilePlayerSettingsT) =>
    (event: Event, newValue: number | number[]) => {
      const updatedMidiFilePlayerSettings = {
        ...midiFilePlayerSettings,
        [setting]: newValue,
      };
      setMidiFilePlayerSettings(updatedMidiFilePlayerSettings);
      debouncedStoreUpdate(updatedMidiFilePlayerSettings);
    };

  // handle both midi and audio file select change
  const onFileSelectorChange = (
    value: UploadedFileT | UploadedFileT[] | null
  ) => {
    if (value === null) return;
    let settingUpdate = Array.isArray(value)
      ? {
          ...midiFilePlayerSettings,
          selectedMidiFiles: value,
        }
      : {
          ...midiFilePlayerSettings,
          selectedAudioFile: value,
        };
    dispatch(
      updateOneMidiBlock({
        id: block.id,
        changes: {
          midiFilePlayerSettings: settingUpdate,
        },
      })
    );
  };

  return (
    <>
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
          <Slider
            value={midiFilePlayerSettings.volume}
            onChange={handleSliderChange('volume')}
            aria-labelledby="volume"
            step={0.01}
            min={0}
            max={1}
          />
        </Box>
      </Grid>
    </>
  );
}

export default MidiFilePlayerSettings;
