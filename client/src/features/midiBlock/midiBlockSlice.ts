import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import {
  BlockTheme,
  ColorSettingsT,
  midiWidgets,
  OSMDSettingsT,
  PianoSettingsT,
} from '../../utils/helpers';

export interface MidiBlockData {
  id: string;
  inputId: string;
  channelId: string;
  widget: '' | typeof midiWidgets[number];
  pianoSettings: PianoSettingsT;
  colorSettings: ColorSettingsT;
  osmdSettings: OSMDSettingsT;
  theme: BlockTheme;
}

const midiBlockAdapter = createEntityAdapter<MidiBlockData>({
  selectId: (block) => block.id,
});

const initialState = midiBlockAdapter.getInitialState();

const midiBlockSlice = createSlice({
  name: 'midiBlocks',
  initialState,
  reducers: {
    addMidiBlock: midiBlockAdapter.addOne,
    updateOneMidiBlock: midiBlockAdapter.updateOne,
    updateManyMidiBlocks: midiBlockAdapter.updateMany,
    upsertManyMidiBlocks: midiBlockAdapter.upsertMany,
  },
});

export const {
  addMidiBlock,
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
