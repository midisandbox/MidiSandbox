import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface UploadedFileT {
  filename: string;
  key: string;
  folder: 'mxl' | 'midi';
  lastModified: number;
}

const fileUploadAdapter = createEntityAdapter<UploadedFileT>({
  selectId: (file) => file.key,
});

const initialState = fileUploadAdapter.getInitialState({});

const fileUploadSlice = createSlice({
  name: 'fileUploads',
  initialState,
  reducers: {
    setAllUploadedFiles: fileUploadAdapter.setAll,
    removeOneUploadedFile: fileUploadAdapter.removeOne,
    addUploadedFile(
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
});

export const { addUploadedFile, setAllUploadedFiles, removeOneUploadedFile } =
  fileUploadSlice.actions;

export const {
  selectAll: selectAllFileUploads,
  selectById: selectFileUploadById,
} = fileUploadAdapter.getSelectors<RootState>((state) => state.fileUpload);

export const selectAllMxlFiles = createSelector(
  [(state: RootState) => state.fileUpload.entities],
  (entities) => {
    let result: UploadedFileT[] = [];
    Object.keys(entities).forEach((id) => {
      const file = entities[id];
      if (file?.folder === 'mxl') {
        result.push(file);
      }
    });
    return result.sort((a, b) => b.lastModified - a.lastModified);
  }
);
export default fileUploadSlice.reducer;
