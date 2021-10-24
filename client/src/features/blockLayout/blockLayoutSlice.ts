import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { RootState } from '../../app/store';

const blockLayoutAdapter = createEntityAdapter<Layout>({
  selectId: (layout) => layout.i,
});

const initialState = blockLayoutAdapter.getInitialState();

const blockLayoutSlice = createSlice({
  name: 'midiBlock/layout',
  initialState,
  reducers: {
    addBlockLayouts: blockLayoutAdapter.addOne,
    upsertManyBlockLayouts: blockLayoutAdapter.upsertMany,
    updateManyBlockLayouts: blockLayoutAdapter.updateMany,
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
