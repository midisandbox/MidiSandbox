import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export const storageFolders = ['mxl', 'midi', 'audio', 'img'] as const;
export type BucketFolder = typeof storageFolders[number];

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

export const selectFilesInFolder = createSelector(
  [
    (state: RootState, folder: BucketFolder) => state.fileUpload.entities,
    (state: RootState, folder: BucketFolder) => folder,
  ],
  (entities, folder) => {
    let result: UploadedFileT[] = [];
    Object.keys(entities).forEach((id) => {
      const file = entities[id];
      if (file?.folder === folder) {
        result.push(file);
      }
    });
    return result.sort((a, b) => b.lastModified - a.lastModified);
  }
);

export const getFilenameFromKey = (key: string) => {
  const keyArr = key.split('/');
  if (keyArr.length > 0) return keyArr[keyArr.length - 1];
  return '';
};

export default fileUploadSlice.reducer;
