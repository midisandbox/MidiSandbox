import { PaletteMode } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from './store';

export interface GlobalSettings {
  themeMode: PaletteMode;
}
const initialState: GlobalSettings = {
  themeMode: 'dark',
};

const globalSettingsSlice = createSlice({
  name: 'globalSettings',
  initialState,
  reducers: {
    setGlobalThemeMode(state, action: PayloadAction<PaletteMode>) {
      state.themeMode = action.payload;
    },
  },
});

export const { setGlobalThemeMode } = globalSettingsSlice.actions;

export const selectGlobalThemeMode = createSelector(
  [(state: RootState) => state.globalSettings.themeMode],
  (themeMode) => themeMode
);

export default globalSettingsSlice.reducer;
