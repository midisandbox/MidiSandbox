import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { noteColorPalettes } from '../../utils/helpers';

export const midiWidgets = ['Piano', 'Circle Of Fifths', 'Soundslice'] as const;
export interface PianoSettingsT {
  startNote: number;
  keyWidth: number;
}
export const colorStyles = ['Monochrome', 'Color Palette'] as const;
export interface ColorSettingsT {
  style: typeof colorStyles[number];
  monoChromeColor: number;
  colorPalette: keyof typeof noteColorPalettes;
}

export interface MidiBlockData {
  id: string;
  inputId: string;
  channelId: string;
  widget: '' | typeof midiWidgets[number];
  pianoSettings: PianoSettingsT;
  colorSettings: ColorSettingsT;
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
    updatePianoSettings(
      state,
      action: PayloadAction<{
        blockId: string;
        changes: Partial<PianoSettingsT>;
      }>
    ) {
      const { blockId, changes } = action.payload;
      const block = state.entities[blockId];
      if (block) {
        block.pianoSettings = { ...block.pianoSettings, ...changes };
      }
    },
  },
});

export const {
  addMidiBlock,
  updateManyMidiBlocks,
  upsertManyMidiBlocks,
  updateOneMidiBlock,
  updatePianoSettings,
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
