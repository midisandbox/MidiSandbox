import { PaletteMode } from '@mui/material';
import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from './store';

interface GlobalSettings {
  themeMode: PaletteMode;
}
const initialState: GlobalSettings = {
  themeMode: 'dark',
};

const globalSettingsSlice = createSlice({
  name: 'globalSettings',
  initialState,
  reducers: {
    toggleGlobalThemeMode(state) {
      console.log('state.themeMode: ', state.themeMode);
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      console.log('state.themeMode: ', state.themeMode);
    },
  },
});

export const { toggleGlobalThemeMode } = globalSettingsSlice.actions;

export const selectGlobalThemeMode = createSelector(
  [(state: RootState) => state.globalSettings.themeMode],
  (themeMode) => themeMode
);

export default globalSettingsSlice.reducer;
