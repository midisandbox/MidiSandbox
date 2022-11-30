import { Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { Note as TonalNote, Scale as TonalScale } from '@tonaljs/tonal';
import { selectGlobalSettings } from '../../../redux/slices/globalSettingsSlice';
import {
  selectChannelChromaticNoteData,
  selectChannelNote,
  selectChannelNotesOn,
  selectChannelNotesPressed,
  selectChromaticNotesOn,
  selectChromaticNotesPressed,
  selectEstimateChordData,
  selectNotesOnByChannelId,
  selectNotesPressedByChannelId,
} from '../../../redux/slices/midiListenerSlice';
import { useTypedSelector } from '../../../redux/store';
import {
  getNoteColorNumStr,
  getNoteOnColors,
  parseHexadecimalColorToString,
} from '../../../utils/utils';
import { ExampleWidgetBlockButtons } from './ExampleWidgetButtons';
import ExampleWidgetSettings from './ExampleWidgetSettings';

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
  const { colorSettings } = block;
  const muiTheme = useTheme();
  const styles = {
    highlightedText: {
      color: muiTheme.palette.primary.main,
      fontWeight: 600,
      display: 'inline',
    },
    sectionTitle: { textDecoration: 'underline', mb: 2 },
  };

  // contains some useful settings from the Global tab, like globalKeySignature and globalKeySignatureUsesSharps
  const globalSettings = useTypedSelector(selectGlobalSettings);

  // get boolean for whether an array of midi notes are on (including sustain)
  const notesOn = useTypedSelector((state) =>
    selectNotesOnByChannelId(state, block.channelId, [60, 64])
  );
  // get boolean for whether an array of midi notes are actively being pressed (not including sustain)
  const notesPressed = useTypedSelector((state) =>
    selectNotesPressedByChannelId(state, block.channelId, [60, 64])
  );

  // get boolean for whether an array of chromatic notes are on (including sustain), where chromatic notes are 0-11 and 0=C, ..., 11=B
  // eg. passing [0,1] will return true if ANY C (no matter the octave) and ANY C# are on
  const chromaticNotesOn = useTypedSelector((state) =>
    selectChromaticNotesOn(state, block.channelId, [0, 4])
  );
  // same logic as chromaticNotesOn but only for notes that are actively pressed (not including sustain)
  const chromaticNotesPressed = useTypedSelector((state) =>
    selectChromaticNotesPressed(state, block.channelId, [0, 4])
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
    <Box
      sx={{
        p: 2,
        height: containerHeight,
        width: containerWidth,
        overflow: 'auto',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h4" sx={styles.sectionTitle}>
            General selectors & functions
          </Typography>
          <Typography variant="body1">
            Width: <Box sx={styles.highlightedText}>{containerWidth}</Box>,
            Height: <Box sx={styles.highlightedText}>{containerHeight}</Box>
          </Typography>
          <Typography variant="body1">
            Notes on:{' '}
            <Box sx={styles.highlightedText}>
              {JSON.stringify(channelNotesOn)}
            </Box>
          </Typography>
          <Typography variant="body1">
            Notes pressed:{' '}
            <Box sx={styles.highlightedText}>
              {JSON.stringify(channelNotesPressed)}
            </Box>
          </Typography>
          <Typography variant="body1">
            Chromatic notes on:{' '}
            <Box sx={styles.highlightedText}>
              {JSON.stringify(
                Object.entries(channelChromaticNoteData)
                  .map(([key, value]) => (value.noteOn ? parseInt(key) : null))
                  .filter((x) => x !== null)
              )}
            </Box>
          </Typography>
          <Typography variant="body1">
            Chromatic notes pressed:{' '}
            <Box sx={styles.highlightedText}>
              {JSON.stringify(
                Object.entries(channelChromaticNoteData)
                  .map(([key, value]) =>
                    value.notePressed ? parseInt(key) : null
                  )
                  .filter((x) => x !== null)
              )}
            </Box>
          </Typography>
          <Typography variant="body1">
            Estimated Chords:{' '}
            <Box sx={styles.highlightedText}>
              {JSON.stringify(estimatedChords)}
            </Box>
          </Typography>
          <Typography variant="body1">
            Get color for note based on color settings:{' '}
            <span style={{ color: getNoteColorNumStr(0, colorSettings) }}>
              C
            </span>
            ,
            <span style={{ color: getNoteColorNumStr(4, colorSettings) }}>
              E
            </span>
            ,
            <span style={{ color: getNoteColorNumStr(7, colorSettings) }}>
              G
            </span>
          </Typography>
          <Typography variant="body1">
            Get color for a combination of up to 5 notes:{' '}
            <span
              style={{
                color: parseHexadecimalColorToString(
                  getNoteOnColors([60, 62], colorSettings, muiTheme)
                    .pressedColor
                ),
              }}
            >
              C+E
            </span>
          </Typography>
          <Typography variant="body1">
            <Box sx={{ textDecoration: 'underline', mt: 2 }}>
              Use TonalJS to translate and manipulate notes
            </Box>
            <Box>
              Translate midi note number (61) to note name:{' '}
              <Box sx={styles.highlightedText}>
                {globalSettings.globalKeySignatureUsesSharps
                  ? TonalNote.fromMidiSharps(61)
                  : TonalNote.fromMidi(61)}
              </Box>
            </Box>
            <Box>
              Translate note name (Bb4) to midi note number:{' '}
              <Box sx={styles.highlightedText}>{TonalNote.midi('Bb4')}</Box>
            </Box>
            <Box>
              Get notes in selected key:{' '}
              <Box sx={styles.highlightedText}>
                {JSON.stringify(
                  TonalScale.get(
                    `${globalSettings.globalKeySignature} ${globalSettings.globalScale}`
                  ).notes
                )}
              </Box>
            </Box>
          </Typography>
          <Typography variant="body1">
            <Box sx={{ textDecoration: 'underline', mt: 2 }}>
              Custom widget settings
            </Box>
            <Box>
              Example textfield setting:{' '}
              <Box sx={styles.highlightedText}>
                {widgetSettings.exampleTextSetting}
              </Box>
            </Box>
            <Box>
              Example slider setting:{' '}
              <Box sx={styles.highlightedText}>
                {widgetSettings.exampleSliderSetting}
              </Box>
            </Box>
            <Box>
              Example selector setting:{' '}
              <Box sx={styles.highlightedText}>
                {widgetSettings.exampleSelectSetting}
              </Box>
            </Box>
            <Box>
              Example checkbox setting:{' '}
              <Box sx={styles.highlightedText}>
                {String(widgetSettings.exampleCheckboxSetting)}
              </Box>
            </Box>
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h4" sx={styles.sectionTitle}>
            Selecting specific notes
          </Typography>
          <Typography variant="body1">
            It's important to remember that your components should only select
            the data that they need to render. Often this means that a component
            should only select the state for a single note, rather than
            selecting all notes.
          </Typography>
          <br />
          <Typography variant="body1">
            For example, we can use the selectChannelNote selector to get the
            state of a single note (60 aka C4):
          </Typography>
          <Typography variant="body1">
            Note on:{' '}
            <Box sx={styles.highlightedText}>{String(channelNote?.noteOn)}</Box>
          </Typography>
          <Typography variant="body1">
            Note pressed:{' '}
            <Box sx={styles.highlightedText}>
              {String(channelNote?.notePressed)}
            </Box>
          </Typography>
          <Typography variant="body1">
            Note velocity:{' '}
            <Box sx={styles.highlightedText}>{channelNote?.velocity}</Box>
          </Typography>
          <br />
          <Typography variant="body1">
            Additionally, we can select the notesOn and notesPressed state for a
            specific group of notes, such as 60 and 64 (C4 and E4):
          </Typography>
          <Typography variant="body1">
            Notes 60,64 both on:{' '}
            <Box sx={styles.highlightedText}>{String(notesOn)}</Box>
          </Typography>
          <Typography variant="body1">
            Notes 60,64 both pressed:{' '}
            <Box sx={styles.highlightedText}>{String(notesPressed)}</Box>
          </Typography>
          <br />
          <Typography variant="body1">
            Similarly, we can select notesOn/notesPressed for a group of
            chromatic notes (disregarding octaves). So selecting 0 and 4 will
            return true if any C and any E are pressed:
          </Typography>
          <Typography variant="body1">
            Chromatic notes 0, 4 both on:{' '}
            <Box sx={styles.highlightedText}>{String(chromaticNotesOn)}</Box>
          </Typography>
          <Typography variant="body1">
            Chromatic notes 0, 4 both pressed:{' '}
            <Box sx={styles.highlightedText}>
              {String(chromaticNotesPressed)}
            </Box>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export interface ExampleWidgetSettingsT {
  exampleTextSetting: string;
  exampleSliderSetting: number;
  exampleSelectSetting: string;
  exampleCheckboxSetting: boolean;
}
export const exampleWidgetDefaultSettings: ExampleWidgetSettingsT = {
  exampleTextSetting: 'Lorem Ipsum',
  exampleSliderSetting: 50,
  exampleSelectSetting: 'Option 1',
  exampleCheckboxSetting: false,
};

const exportObj: WidgetModule = {
  name: 'Example Widget',
  Component: ExampleWidget,
  SettingComponent: ExampleWidgetSettings,
  ButtonsComponent: ExampleWidgetBlockButtons,
  defaultSettings: exampleWidgetDefaultSettings,
  includeBlockSettings: ['Block Theme', 'Midi Input', 'Color'],
  orderWeight: 0, // used to determine the ordering of the options in the Widget selector
};

export default exportObj;
