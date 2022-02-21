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

const initialState = midiBlockAdapter.getInitialState();

const midiBlockSlice = createSlice({
  name: 'midiBlocks',
  initialState,
  reducers: {
    addMidiBlockAndLayout: (
      state,
      action: PayloadAction<{ midiBlock: MidiBlockT; blockLayout: Layout }>
    ) => {
      midiBlockAdapter.addOne(state, action.payload.midiBlock);
    },
    removeMidiBlockAndLayout: midiBlockAdapter.removeOne,
    updateOneMidiBlock: midiBlockAdapter.updateOne,
    updateManyMidiBlocks: midiBlockAdapter.updateMany,
    upsertManyMidiBlocks: midiBlockAdapter.upsertMany,
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveTemplate, (state, action) => {
      midiBlockAdapter.setAll(state, action.payload.midiBlocks);
    });
  },
});

export const {
  addMidiBlockAndLayout,
  removeMidiBlockAndLayout,
  updateManyMidiBlocks,
  upsertManyMidiBlocks,
  updateOneMidiBlock,
} = midiBlockSlice.actions;

export const {
  selectAll: selectAllMidiBlocks,
  selectById: selectMidiBlockById,
} = midiBlockAdapter.getSelectors<RootState>((state) => state.midiBlock);

type SliceActions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer A ? A : never;
}[keyof T];

export type BlockActionTypes = SliceActions<typeof midiBlockSlice.actions>;

export default midiBlockSlice.reducer;
