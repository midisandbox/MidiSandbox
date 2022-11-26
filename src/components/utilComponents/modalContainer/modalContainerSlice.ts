import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { RootState } from '../../../redux/store';
import { ExampleModalData } from './ExampleModal';

export type ModalId = null | 'EXAMPLE_MODAL';
export type ModalProps = null | ExampleModalData;
export interface ModalContainerData {
  open: boolean;
  modalId: ModalId;
  modalData: ModalProps;
}

const initialState: ModalContainerData = {
  open: false,
  modalId: null,
  modalData: null,
};

const modalContainerSlice = createSlice({
  name: 'modalContainer',
  initialState,
  reducers: {
    openModal(
      state,
      action: PayloadAction<{ modalId: ModalId; modalData: ModalProps }>
    ) {
      state.modalId = action.payload.modalId;
      state.modalData = action.payload.modalData;
      state.open = true;
    },
    closeModal(state) {
      state.modalId = null;
      state.modalData = null;
      state.open = false;
    },
  },
});

export const { openModal, closeModal } = modalContainerSlice.actions;

export const selectModalContainer = createSelector(
  [(state: RootState) => state.modalContainer],
  (modalContainer) => modalContainer
);

export default modalContainerSlice.reducer;
