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

interface SoundfontManager {
  metronomeSF: Soundfont.Player;
  pianoSF: Soundfont.Player;
}

interface ImageSettingsT {
  url: string;
  selectedFileKey: string;
  objectFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
}

interface NotepadSettingsT {
  currentEditorState: string;
  templateEditorState: string;
}
