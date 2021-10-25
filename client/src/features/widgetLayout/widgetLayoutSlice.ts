import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { RootState } from '../../app/store';
import { createSelector } from 'reselect';

export type WidgetLayoutData = Layout & { blockId: string };

const widgetLayoutAdapter = createEntityAdapter<WidgetLayoutData>({
  selectId: (layout) => layout.i,
});

const initialState = widgetLayoutAdapter.getInitialState();

const widgetLayoutSlice = createSlice({
  name: 'widgetLayouts',
  initialState,
  reducers: {
    addWidgetLayouts: widgetLayoutAdapter.addOne,
    upsertManyWidgetLayouts: widgetLayoutAdapter.upsertMany,
    updateManyWidgetLayouts: widgetLayoutAdapter.updateMany,
  },
});

export const {
  addWidgetLayouts,
  upsertManyWidgetLayouts,
  updateManyWidgetLayouts,
} = widgetLayoutSlice.actions;

export const { selectAll: selectAllwidgetLayouts } =
  widgetLayoutAdapter.getSelectors<RootState>((state) => state.widgetLayout);

export const selectWidgetLayoutsByBlockId = createSelector(
  [selectAllwidgetLayouts, (state: RootState, blockId: string) => blockId],
  (widgetLayouts, blockId) =>
    widgetLayouts.filter(
      (widgetLayout: WidgetLayoutData) => widgetLayout.blockId === blockId
    )
);

export default widgetLayoutSlice.reducer;
