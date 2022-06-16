interface NotificationT {
  id: string;
  msg: string;
  severity: 'error' | 'success' | 'info' | 'warning' | undefined;
}
