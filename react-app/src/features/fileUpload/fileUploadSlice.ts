import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { REMOTE_FOLDER } from '../../utils/helpers';
import { apiSlice } from '../api/apiSlice';

export interface UploadedFileT {
  filename: string;
  folder: REMOTE_FOLDER;
  uuidFilename: string;
}

const fileUploadAdapter = createEntityAdapter<UploadedFileT>({
  selectId: (file) => file.uuidFilename,
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
        uploadedFile: UploadedFileT;
        blockId: string;
      }>
    ) {
      const { uploadedFile } = action.payload;
      fileUploadAdapter.addOne(state, uploadedFile);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      apiSlice.endpoints.deleteSheetMusic.matchPending,
      (state, action) => {
        const fileId = action.meta.arg.originalArgs;
        fileUploadAdapter.removeOne(state, fileId);
      }
    );
  },
});

export const { addUploadedFile, setAllUploadedFiles, uploadSheetMusicFile } =
  fileUploadSlice.actions;

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
