import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../store';

const initialState: GlobalSettings = {
  themeMode: 'dark',
  globalKeySignature: 'C',
  globalKeySignatureUsesSharps: false,
  playbackIsPlaying: false,
  playbackSeekSeconds: 0,
  playbackSeekAutoplay: false,
  playbackSeekVersion: '',
};

const globalSettingsSlice = createSlice({
  name: 'globalSettings',
  initialState,
  reducers: {
    updateGlobalSetting(state, action: PayloadAction<Partial<GlobalSettings>>) {
      return { ...state, ...action.payload };
    },
    setAllGlobalSettings(state, action: PayloadAction<GlobalSettings>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateGlobalSetting, setAllGlobalSettings } =
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
