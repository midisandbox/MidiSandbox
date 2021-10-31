import {
  createEntityAdapter,
  createSlice,
  EntityId
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface MidiBlockData {
  id: EntityId;
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
    updateManyMidiBlocks: midiBlockAdapter.updateMany,
    upsertManyMidiBlocks: midiBlockAdapter.upsertMany,
  },
});

export const { addMidiBlock, updateManyMidiBlocks, upsertManyMidiBlocks } =
  midiBlockSlice.actions;

export const { selectAll: selectAllMidiBlocks, selectById: selectMidiBlockById } =
  midiBlockAdapter.getSelectors<RootState>((state) => state.midiBlock);

export default midiBlockSlice.reducer;
