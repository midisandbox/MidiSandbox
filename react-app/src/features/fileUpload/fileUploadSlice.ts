import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface UploadedFileT {
  id: string;
  filename: string;
  folder: RemoteFolder;
  uuidFilename: string;
}

export enum RemoteFolder {
  SheetMusic = "sheet-music",
}

const fileUploadAdapter = createEntityAdapter<UploadedFileT>({
  selectId: (file) => file.id,
});

const initialState = fileUploadAdapter.getInitialState({});

const fileUploadSlice = createSlice({
  name: 'fileUploads',
  initialState,
  reducers: {
    addUploadedFile: fileUploadAdapter.addOne,
    setAllUploadedFiles: fileUploadAdapter.setAll,
  },
});

export const { addUploadedFile, setAllUploadedFiles } = fileUploadSlice.actions;

export const {
  selectAll: selectAllFileUploads,
  selectById: selectFileUploadById,
} = fileUploadAdapter.getSelectors<RootState>((state) => state.fileUpload);

export default fileUploadSlice.reducer;
