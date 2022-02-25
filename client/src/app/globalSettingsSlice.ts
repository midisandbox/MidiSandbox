import { PaletteMode } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { setActiveTemplate } from '../features/blockTemplate/blockTemplateSlice';
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
    setAllGlobalSettings(state, action: PayloadAction<GlobalSettings>) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActiveTemplate, (state, action) => {
      return { ...state, ...action.payload.globalSettings };
    });
  },
});

export const { setGlobalThemeMode, setAllGlobalSettings } =
  globalSettingsSlice.actions;

export const selectGlobalThemeMode = createSelector(
  [(state: RootState) => state.globalSettings.themeMode],
  (themeMode) => themeMode
);

export const selectGlobalSettings = createSelector(
  [(state: RootState) => state.globalSettings],
  (globalSettings) => globalSettings
);

export default globalSettingsSlice.reducer;
