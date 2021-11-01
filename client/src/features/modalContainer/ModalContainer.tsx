import { Backdrop, Box, Fade, Modal } from '@mui/material';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import BlockSettingsModal from './BlockSettingsModal';
import { closeModal, selectModalContainer } from './modalContainerSlice';
import { BlockSettingsModalData } from './BlockSettingsModal';

function ModalContainer() {
  const dispatch = useAppDispatch();
  const { open, modalId, modalData } = useTypedSelector((state) =>
    selectModalContainer(state)
  );
  const handleClose = () => {
    dispatch(closeModal());
  };

  if (modalId === null) return null;
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box sx={style}>
            {modalId === 'BLOCK_SETTINGS' && modalData && <BlockSettingsModal handleClose={handleClose} modalData={modalData as BlockSettingsModalData} />}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default ModalContainer;
