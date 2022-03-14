import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { RootState } from '../../app/store';
import {
  ColorSettingsT,
  midiWidgets,
  OSMDSettingsT,
  PianoSettingsT,
} from '../../utils/helpers';
import { setActiveTemplate } from '../blockTemplate/blockTemplateSlice';
import { createSelector } from 'reselect';
import { uploadSheetMusicFile } from '../fileUpload/fileUploadSlice';

export const themeModes = ['default', 'light', 'dark'] as const;
export interface MidiBlockT {
  id: string;
  inputId: string;
  channelId: string;
  widget: '' | typeof midiWidgets[number];
  pianoSettings: PianoSettingsT;
  colorSettings: ColorSettingsT;
  osmdSettings: OSMDSettingsT;
  themeMode: typeof themeModes[number];
}

const midiBlockAdapter = createEntityAdapter<MidiBlockT>({
  selectId: (block) => block.id,
});

const initialState = midiBlockAdapter.getInitialState({
  defaultInputId: '',
  defaultChannelId: '',
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
      .addCase(setActiveTemplate, (state, action) => {
        midiBlockAdapter.setAll(state, action.payload.midiBlocks);
      })
      .addCase(uploadSheetMusicFile, (state, action) => {
        const { blockId, uploadedFile } = action.payload;
        const currentBlock = state.entities[blockId];
        if (currentBlock) {
          currentBlock.osmdSettings.selectedFileId = uploadedFile.id;
        }
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
  ],
  (defaultInputId, defaultChannelId) => ({ defaultInputId, defaultChannelId })
);

type SliceActions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer A ? A : never;
}[keyof T];

export type BlockActionTypes = SliceActions<typeof midiBlockSlice.actions>;

export default midiBlockSlice.reducer;
