import React, { useCallback } from 'react';
import { updateOneMidiBlock } from '../../../redux/slices/midiBlockSlice';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../styles/styleHooks';
import { useAppDispatch, useTypedSelector } from '../../../redux/store';
import {
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
import { Box } from '@mui/system';
import DebouncedSlider from '../../utilComponents/DebouncedSlider';
import {
  selectChromaticNotesOn,
  selectNotesPressedByChannelId,
} from '../../../redux/slices/midiListenerSlice';
import { Note as TonalNote } from '@tonaljs/tonal';
import {
  selectChannelChromaticNoteData,
  selectEstimateChordData,
} from '../../../redux/slices/midiListenerSlice';
import { selectGlobalSettings } from '../../../redux/slices/globalSettingsSlice';
import { selectChannelNote } from '../../../redux/slices/midiListenerSlice';
import {
  selectChannelNotesOn,
  selectChannelNotesPressed,
} from '../../../redux/slices/midiListenerSlice';
import {
  selectChromaticNotesPressed,
  selectNotesOnByChannelId,
} from '../../../redux/slices/midiListenerSlice';
import ExampleWidgetSettings from './ExampleWidgetSettings';

// TODO: implement settings component
// - add all selectors & helper methods to demonstrate in the example and README
// getNoteColorNumStr, getNoteOnColors
// getNoteNumsInMajorKey, majorKeyToChromaticNotesMap, chromaticNoteToMajorKeyMap
// noteNameToChromaticNum
// getNoteNumToNameMap
// - update UI to show values returned from selectors
// - turn ExampleWidget into a module folder instead of a single file (update widgetModules logic in helpers)

const defaultSettings: ExampleWidgetSettingsT = {
  exampleTextSetting: 'Lorem Ipsum',
  exampleSliderSetting: 50,
  exampleSelectSetting: 'Option 1',
  exampleCheckboxSetting: false,
};

function ExampleWidget({
  block,
  containerWidth,
  containerHeight,
  widgetSettings,
}: {
  block: MidiBlockT;
  containerWidth: number;
  containerHeight: number;
  widgetSettings: ExampleWidgetSettingsT;
}) {
  // contains some useful settings from the Global tab, like globalKeySignature and globalKeySignatureUsesSharps
  const globalSettings = useTypedSelector(selectGlobalSettings);

  // get boolean for whether an array of midi notes are on (including sustain)
  const notesOn = useTypedSelector((state) =>
    selectNotesOnByChannelId(state, block.channelId, [60, 61])
  );
  // get boolean for whether an array of midi notes are actively being pressed (not including sustain)
  const notesPressed = useTypedSelector((state) =>
    selectNotesPressedByChannelId(state, block.channelId, [60, 61])
  );

  // get boolean for whether an array of chromatic notes are on (including sustain), where chromatic notes are 0-11 and 0=C, ..., 11=B
  // eg. passing [0,1] will return true if ANY C (no matter the octave) and ANY C# are on
  const chromaticNotesOn = useTypedSelector((state) =>
    selectChromaticNotesOn(state, block.channelId, [0, 1])
  );
  // same logic as chromaticNotesOn but only for notes that are actively pressed (not including sustain)
  const chromaticNotesPressed = useTypedSelector((state) =>
    selectChromaticNotesPressed(state, block.channelId, [0, 1])
  );

  // get array of midi note numbers that are on (including sustain)
  const channelNotesOn = useTypedSelector((state) =>
    selectChannelNotesOn(state, block.channelId)
  );
  // get array of midi note numbers that are actively being pressed (not including sustain)
  const channelNotesPressed = useTypedSelector((state) =>
    selectChannelNotesPressed(state, block.channelId)
  );

  // get an object containing noteOn and notePressed properties for each chromatic note number (0-11)
  const channelChromaticNoteData = useTypedSelector((state) =>
    selectChannelChromaticNoteData(state, block.channelId)
  );

  // returns an array of estimated chords based on the current notesOn for the channel
  const estimatedChords = useTypedSelector((state) =>
    selectEstimateChordData(
      state,
      block.channelId,
      globalSettings.globalKeySignatureUsesSharps
    )
  );

  // get data for a specific midi note, such as name, octave, velocity, attack, release, noteOn, notePressed
  const channelNote = useTypedSelector((state) =>
    selectChannelNote(state, block.channelId, 60)
  );

  return (
    <div>
      <div>Widget Width: {containerWidth}</div>
      <div>Widget Height: {containerHeight}</div>
      <div>exampleSelectSetting: {widgetSettings.exampleSelectSetting}</div>
      <div>Notes On: {JSON.stringify(channelNotesOn)}</div>
    </div>
  );
}

const exportObj: WidgetModule = {
  name: 'Example Widget',
  Component: ExampleWidget,
  SettingComponent: ExampleWidgetSettings,
  ButtonsComponent: null,
  defaultSettings: defaultSettings,
  includeBlockSettings: ['Block Theme', 'Midi Input', 'Key', 'Color'],
  orderWeight: 0, // used to determine the ordering of the options in the Widget selector
};

export default exportObj;
