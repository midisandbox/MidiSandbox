interface NotificationT {
  id: string;
  msg: string;
  severity: 'error' | 'success' | 'info' | 'warning' | undefined;
}

interface StaffSettingsT {
  verticalSpacing: number;
}

interface CircleOfFifthsSettingsT {
keyPrevalenceShading: boolean;
}