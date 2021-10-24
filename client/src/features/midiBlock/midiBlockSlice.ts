import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { RootState } from '../../app/store';

export interface MidiBlockData {
  id: string;
  layout: Layout;
  midiWidgetIds: string[];
}

// dictionary of Layouts with blockId as key
export type UpdateLayoutPayload = {
  [key: string]: Layout;
};

const midiBlockAdapter = createEntityAdapter<MidiBlockData>({
  selectId: (block) => block.id,
});

const initialState = midiBlockAdapter.getInitialState();

const midiBlockSlice = createSlice({
  name: 'midiBlock',
  initialState,
  reducers: {
    addMidiBlock: midiBlockAdapter.addOne,
    updateManyMidiBlocks: midiBlockAdapter.updateMany,
    upsertManyMidiBlocks: midiBlockAdapter.upsertMany,
    updateMidiBlocksLayout: (
      state,
      action: PayloadAction<UpdateLayoutPayload>
    ) => {
      for (const key in action.payload) {
        const midiBlock = state.entities[key];
        if (midiBlock) {
          midiBlock.layout = action.payload[key];
        }
      }
    },
  },
});

export const {
  addMidiBlock,
  updateManyMidiBlocks,
  upsertManyMidiBlocks,
  updateMidiBlocksLayout,
} = midiBlockSlice.actions;

export const { selectAll: selectAllMidiBlocks } =
  midiBlockAdapter.getSelectors<RootState>((state) => state.midiBlock);

export default midiBlockSlice.reducer;
