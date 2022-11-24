import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../redux/store';

export const joyrideTours = ['GET_STARTED'] as const;

export interface JoyrideTour {
  tour: '' | typeof joyrideTours[number];
  stepIndex: number;
  tourData: {
    topBlockId: string;
  };
}
const initialState: JoyrideTour = {
  tour: '',
  stepIndex: 0,
  tourData: {
    topBlockId: '',
  },
};

const joyrideTourSlice = createSlice({
  name: 'joyrideTour',
  initialState,
  reducers: {
    updateJoyrideTour(state, action: PayloadAction<Partial<JoyrideTour>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateJoyrideTour } = joyrideTourSlice.actions;

export const selectJoyrideTour = createSelector(
  [(state: RootState) => state.joyrideTour],
  (joyrideTour) => joyrideTour
);

export default joyrideTourSlice.reducer;
