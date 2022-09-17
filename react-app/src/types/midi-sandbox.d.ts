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
  selectedFile: UploadedFileT | null;
  objectFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
}

interface NotepadSettingsT {
  currentEditorState: string;
  templateEditorState: string;
}

interface UploadedFileT {
  filename: string;
  key: string;
  folder: BucketFolder;
  lastModified: number;
}

