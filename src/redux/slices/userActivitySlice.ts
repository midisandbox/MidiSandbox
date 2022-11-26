import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../store';

export interface UserActivity {
  tourComplete: boolean;
}
const initialState: UserActivity = {
  tourComplete: false,
};

const userActivitySlice = createSlice({
  name: 'userActivity',
  initialState,
  reducers: {
    updateUserActivity(state, action: PayloadAction<Partial<UserActivity>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateUserActivity } = userActivitySlice.actions;

export const selectUserActivity = createSelector(
  [(state: RootState) => state.userActivity],
  (userActivity) => userActivity
);

export default userActivitySlice.reducer;
