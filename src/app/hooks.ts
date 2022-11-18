import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

export const useDebounceSelector = <T extends (...args: any) => any>(
  selector: T,
  time = 250
) => {
  const [data, setState] = useState<unknown>();
  const result = useRef<ReturnType<T>>();
  const refTimeout = useRef<ReturnType<typeof setTimeout>>();

  if (refTimeout.current) {
    clearTimeout(refTimeout.current);
  }

  const selectorData = useSelector(selector);

  useEffect(
    () => () => refTimeout.current && clearTimeout(refTimeout.current),
    []
  );

  if (time === 0) {
    return selectorData;
  }

  refTimeout.current = setTimeout(() => {
    if (result.current !== selectorData) {
      setState(selectorData);
    }
  }, time);

  return data;
};
