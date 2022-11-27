import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addNotification,
  removeNotification,
} from '../redux/slices/notificationSlice';

// collect all of tsx files in the widgets folder and combine their default exports into an object
// used for rendering widgets and their settings in MidiBlock and BlockSettingsTab
interface WidgetModuleMap {
  [key: string]: WidgetModule;
}
export const useWidgetModules = () => {
  const [widgetModules, setWidgetModules] = useState<WidgetModuleMap>({});
  const [sortedWidgetNames, setSortedWidgetNames] = useState<string[]>([]);
  // compareModules are only used to check which modules were updated to support hot reloading
  const compareModules: any = useMemo(() => ({}), []);
  const moduleContext = useMemo(
    () => require.context('../components/widgets', true),
    []
  );

  // initialize the widgetModules by loading them from moduleContext
  useEffect(() => {
    const updatedModules: WidgetModuleMap = {};
    moduleContext.keys().forEach((fileName) => {
      if (fileName.includes('Widget.tsx')) {
        const moduleObj = { ...moduleContext(fileName).default };
        updatedModules[moduleObj.name] = moduleObj;
        compareModules[fileName] = moduleContext(fileName);
      }
    });
    setWidgetModules(updatedModules);
  }, [moduleContext, compareModules]);

  // update sortedWidgetNames whenever the widgetModules change
  useEffect(() => {
    setSortedWidgetNames(
      Object.keys(widgetModules)
        .map((key) => widgetModules[key])
        .sort((a, b) => {
          const aOrderWeight = a.orderWeight || 0;
          const bOrderWeight = b.orderWeight || 0;
          return bOrderWeight - aOrderWeight;
        })
        .map((module) => module.name)
    );
  }, [widgetModules]);

  // support hot reloading by updating widgetModules in the below accept() func
  if (module.hot) {
    module.hot.accept(moduleContext.id, function () {
      //You can't use context here. You _need_ to call require.context again to
      //get the new version. Otherwise you might get errors about using disposed
      //modules
      var reloadedContext = require.context('../components/widgets', true);
      //To find out what module was changed you just compare the result of the
      //require call with the version stored in the modules hash using strict
      //equality. Equal means it is unchanged.
      var changedModules = reloadedContext
        .keys()
        .map(function (key) {
          return [key, reloadedContext(key)];
        })
        .filter(function (reloadedModule) {
          return compareModules[reloadedModule[0]] !== reloadedModule[1];
        });
      const updatedModules: WidgetModuleMap = {};
      changedModules.forEach(function (module) {
        compareModules[module[0]] = module[1];
        // only update modules with the special widget format including the 'name' prop
        const moduleObj = { ...module[1].default };
        if (moduleObj.name) {
          updatedModules[moduleObj.name] = moduleObj;
        }
      });
      setWidgetModules({ ...widgetModules, ...updatedModules });
    });
  }
  return { widgetModules, sortedWidgetNames };
};

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
