import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addNotification,
  removeNotification,
} from '../features/notification/notificationSlice';

export const useNotificationDispatch = () => {
  const dispatch = useDispatch();

  const notificationDispatch = useCallback(
    (
      msg: string,
      severity: NotificationT['severity'],
      error?: any,
      timeout: number = 5000
    ) => {
      if (msg && severity) {
        const notification: NotificationT = {
          id: uuidv4(),
          msg: msg,
          severity: severity,
        };
        dispatch(addNotification(notification));
        setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, timeout);
        if (error) console.error(`${notification.msg}\n`, error);
      }
    },
    [dispatch]
  );

  return notificationDispatch;
};
