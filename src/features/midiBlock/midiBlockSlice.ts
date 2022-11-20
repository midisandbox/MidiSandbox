import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';

import {
  ColorSettingsT,
  midiWidgets,
  OSMDSettingsT,
  PianoSettingsT,
  TonnetzSettingsT,
  YoutubeVideoPlayerSettingsT,
} from '../../utils/helpers';
import {
  addUploadedFile,
  removeOneUploadedFile,
} from '../fileUpload/fileUploadSlice';

export const themeModes = ['default', 'light', 'dark'] as const;
export interface MidiBlockT {
  id: string;
  inputId: string;
  channelId: string;
  widget: '' | typeof midiWidgets[number];
  themeMode: typeof themeModes[number];
  pianoSettings: PianoSettingsT;
  staffSettings: StaffSettingsT;
  colorSettings: ColorSettingsT;
  osmdSettings: OSMDSettingsT;
  imageSettings: ImageSettingsT;
  youtubePlayerSettings: YoutubeVideoPlayerSettingsT;
  tonnetzSettings: TonnetzSettingsT;
  circleOfFifthsSettings: CircleOfFifthsSettingsT;
  notepadSettings: NotepadSettingsT;
  midiFilePlayerSettings: MidiFilePlayerSettingsT;
  widgetSettings: {};
}

const midiBlockAdapter = createEntityAdapter<MidiBlockT>({
  selectId: (block) => block.id,
});

const initialState = midiBlockAdapter.getInitialState({
  defaultInputId: '',
  defaultChannelId: '',
  initialDefaultInputLoaded: false,
});

const midiBlockSlice = createSlice({
  name: 'midiBlocks',
  initialState,
  reducers: {
    addMidiBlockAndLayout: (
      state,
      action: PayloadAction<{ midiBlock: MidiBlockT; blockLayout: Layout }>
    ) => {
      midiBlockAdapter.addOne(state, {
        ...action.payload.midiBlock,
        inputId: state.defaultInputId,
        channelId: state.defaultChannelId,
      });
    },
    removeMidiBlockAndLayout: midiBlockAdapter.removeOne,
    updateOneMidiBlock: midiBlockAdapter.updateOne,
    updateManyMidiBlocks: midiBlockAdapter.updateMany,
    upsertManyMidiBlocks: midiBlockAdapter.upsertMany,
    setAllMidiBlocks: midiBlockAdapter.setAll,
    setDefaultInputChannel(
      state,
      action: PayloadAction<{
        defaultInputId: string;
        defaultChannelId: string;
      }>
    ) {
      const { defaultInputId, defaultChannelId } = action.payload;
      state.defaultInputId = defaultInputId;
      state.defaultChannelId = defaultChannelId;
      state.initialDefaultInputLoaded = true;
      state.ids.forEach((blockId) => {
        const currentBlock = state.entities[blockId];
        if (currentBlock) {
          currentBlock.inputId = defaultInputId;
          currentBlock.channelId = defaultChannelId;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUploadedFile, (state, action) => {
        const { blockId, uploadedFile } = action.payload;
        const currentBlock = state.entities[blockId];
        if (currentBlock) {
          if (currentBlock.widget === 'Sheet Music') {
            currentBlock.osmdSettings.selectedFile = uploadedFile;
          } else if (currentBlock.widget === 'Image') {
            currentBlock.imageSettings.selectedFile = uploadedFile;
          } else if (
            currentBlock.widget === 'Midi File Player' &&
            uploadedFile.folder === 'audio'
          ) {
            currentBlock.midiFilePlayerSettings.selectedAudioFile =
              uploadedFile;
          }
        }
      })
      .addCase(removeOneUploadedFile, (state, action) => {
        // if file is deleted then reset selectedFile for any block that selected it
        state.ids.forEach((blockId) => {
          const currentBlock = state.entities[blockId];
          if (currentBlock) {
            if (
              currentBlock.osmdSettings.selectedFile?.key === action.payload
            ) {
              currentBlock.osmdSettings.selectedFile = null;
            } else if (
              currentBlock.imageSettings.selectedFile?.key === action.payload
            ) {
              currentBlock.imageSettings.selectedFile = null;
            } else if (
              currentBlock.midiFilePlayerSettings.selectedAudioFile?.key ===
              action.payload
            ) {
              currentBlock.midiFilePlayerSettings.selectedAudioFile = null;
            } else if (
              currentBlock.midiFilePlayerSettings.selectedMidiFiles
                .map((x) => x.key)
                .includes(action.payload as string)
            ) {
              currentBlock.midiFilePlayerSettings.selectedMidiFiles =
                currentBlock.midiFilePlayerSettings.selectedMidiFiles.filter(
                  (x) => x.key !== action.payload
                );
            }
          }
        });
      });
  },
});

export const {
  addMidiBlockAndLayout,
  removeMidiBlockAndLayout,
  updateManyMidiBlocks,
  upsertManyMidiBlocks,
  updateOneMidiBlock,
  setAllMidiBlocks,
  setDefaultInputChannel,
} = midiBlockSlice.actions;

export const {
  selectAll: selectAllMidiBlocks,
  selectById: selectMidiBlockById,
} = midiBlockAdapter.getSelectors<RootState>((state) => state.midiBlock);

export const selectDefaultInputChannel = createSelector(
  [
    (state: RootState) => state.midiBlock.defaultInputId,
    (state: RootState) => state.midiBlock.defaultChannelId,
    (state: RootState) => state.midiBlock.initialDefaultInputLoaded,
  ],
  (defaultInputId, defaultChannelId, initialDefaultInputLoaded) => ({
    defaultInputId,
    defaultChannelId,
    initialDefaultInputLoaded,
  })
);

type SliceActions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer A ? A : never;
}[keyof T];

export type BlockActionTypes = SliceActions<typeof midiBlockSlice.actions>;

export default midiBlockSlice.reducer;
