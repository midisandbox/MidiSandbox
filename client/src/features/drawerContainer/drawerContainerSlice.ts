import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../app/store';
import { BlockSettingsDrawerData } from './BlockSettingsDrawer';

export type DrawerId = null | 'BLOCK_SETTINGS';
export type DrawerProps = null | BlockSettingsDrawerData;
export interface DrawerContainerData {
  open: boolean;
  drawerId: DrawerId;
  drawerData: DrawerProps;
}

const initialState: DrawerContainerData = {
  open: false,
  drawerId: null,
  drawerData: null,
};

const drawerContainerSlice = createSlice({
  name: 'drawerContainer',
  initialState,
  reducers: {
    openDrawer(
      state,
      action: PayloadAction<{ drawerId: DrawerId; drawerData: DrawerProps }>
    ) {
      state.drawerId = action.payload.drawerId;
      state.drawerData = action.payload.drawerData;
      state.open = true;
    },
    closeDrawer(state) {
      state.drawerId = null;
      state.drawerData = null;
      state.open = false;
    },
  },
});

export const { openDrawer, closeDrawer } = drawerContainerSlice.actions;

export const selectDrawerContainer = createSelector(
  [(state: RootState) => state.drawerContainer],
  (drawerContainer) => drawerContainer
);

export default drawerContainerSlice.reducer;
