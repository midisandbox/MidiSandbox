import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { RootState } from '../../app/store';
import { setActiveTemplate } from '../blockTemplate/blockTemplateSlice';
import {
  addMidiBlockAndLayout,
  removeMidiBlockAndLayout,
} from '../midiBlock/midiBlockSlice';

const blockLayoutAdapter = createEntityAdapter<Layout>({
  selectId: (layout) => layout.i,
});

const initialState = blockLayoutAdapter.getInitialState();

const blockLayoutSlice = createSlice({
  name: 'blockLayout',
  initialState,
  reducers: {
    addBlockLayouts: blockLayoutAdapter.addOne,
    upsertManyBlockLayouts: blockLayoutAdapter.upsertMany,
    updateManyBlockLayouts: blockLayoutAdapter.updateMany,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addMidiBlockAndLayout, (state, action) => {
        blockLayoutAdapter.addOne(state, action.payload.blockLayout);
      })
      .addCase(removeMidiBlockAndLayout, blockLayoutAdapter.removeOne)
      .addCase(setActiveTemplate, (state, action) => {
        blockLayoutAdapter.setAll(state, action.payload.blockLayout);
      });
  },
});

export const {
  addBlockLayouts,
  upsertManyBlockLayouts,
  updateManyBlockLayouts,
} = blockLayoutSlice.actions;

export const { selectAll: selectAllBlockLayouts } =
  blockLayoutAdapter.getSelectors<RootState>((state) => state.blockLayout);

export default blockLayoutSlice.reducer;
