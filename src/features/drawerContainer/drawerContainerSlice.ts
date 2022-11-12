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
  tabValue: number; // 0 = Block Settings, 1 = Global Settings, 2 = Templates
  footerHeight: number;
}
export const drawerWidth = 350;
const initialState: DrawerContainerData = {
  open: false,
  drawerId: null,
  drawerData: null,
  tabValue: 0,
  footerHeight: 40, //px
};

const drawerContainerSlice = createSlice({
  name: 'drawerContainer',
  initialState,
  reducers: {
    openDrawer(
      state,
      action: PayloadAction<{
        drawerId: DrawerId;
        drawerData: DrawerProps;
        tabValue?: number;
      }>
    ) {
      const { drawerId, drawerData, tabValue } = action.payload;
      state.drawerId = drawerId;
      state.drawerData = drawerData;
      state.open = true;
      if (tabValue !== undefined) state.tabValue = tabValue;
    },
    closeDrawer(state) {
      state.drawerId = null;
      state.drawerData = null;
      state.open = false;
    },
    updateDrawerTab(state, action: PayloadAction<number>) {
      state.tabValue = action.payload;
    },
  },
});

export const { openDrawer, closeDrawer, updateDrawerTab } =
  drawerContainerSlice.actions;

export const selectDrawerContainer = createSelector(
  [(state: RootState) => state.drawerContainer],
  (drawerContainer) => drawerContainer
);

export default drawerContainerSlice.reducer;
