import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

const notificationAdapter = createEntityAdapter<NotificationT>({
  selectId: (notification) => notification.id,
});

const initialState = notificationAdapter.getInitialState();

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: notificationAdapter.addOne,
    upsertManyNotification: notificationAdapter.upsertMany,
    updateManyNotification: notificationAdapter.updateMany,
    setAllNotification: notificationAdapter.setAll,
    removeNotification: notificationAdapter.removeOne,
  },
});

export const {
  addNotification,
  upsertManyNotification,
  updateManyNotification,
  setAllNotification,
  removeNotification,
} = notificationSlice.actions;

export const { selectAll: selectAllNotifications } =
  notificationAdapter.getSelectors<RootState>((state) => state.notification);

export default notificationSlice.reducer;
