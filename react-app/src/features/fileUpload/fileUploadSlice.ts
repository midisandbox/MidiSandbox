import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface UploadedFileT {
  id: string;
  filename: string;
  folder: REMOTE_FOLDER;
  uuidFilename: string;
}

export enum REMOTE_FOLDER {
  SHEET_MUSIC = 'sheet-music',
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
    uploadSheetMusicFile(
      state,
      action: PayloadAction<{
        uploadedFile: UploadedFileT,
        blockId: string
      }>
    ) {
      const { uploadedFile } = action.payload;
      fileUploadAdapter.addOne(state, uploadedFile);
    },
  },
});

export const { addUploadedFile, setAllUploadedFiles, uploadSheetMusicFile } = fileUploadSlice.actions;

export const {
  selectAll: selectAllFileUploads,
  selectById: selectFileUploadById,
} = fileUploadAdapter.getSelectors<RootState>((state) => state.fileUpload);

export const selectAllSheetMusicFiles = createSelector(
  [
    (state: RootState) => state.fileUpload.ids,
    (state: RootState) => state.fileUpload.entities,
  ],
  (ids, entities) => {
    let result: UploadedFileT[] = [];
    ids.forEach((id) => {
      const fileData = entities[id];
      if (fileData?.folder === REMOTE_FOLDER.SHEET_MUSIC) {
        result.push(fileData);
      }
    });
    return result;
  }
);
export default fileUploadSlice.reducer;
