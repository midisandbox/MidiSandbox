import { Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { useAppDispatch } from '../../app/store';
import { removeMidiBlockAndLayout } from '../midiBlock/midiBlockSlice';

export interface DeleteBlockModalData {
  blockId: string;
}
export interface DeleteBlockModalProps {
  modalData: DeleteBlockModalData;
  handleClose: Function;
}
export default function DeleteBlockModal({
  modalData,
  handleClose,
}: DeleteBlockModalProps) {
  const dispatch = useAppDispatch();

  const onConfirm = () => {
    dispatch(removeMidiBlockAndLayout(modalData.blockId))
    handleClose();
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          Are you sure you want to delete this block?
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ float: 'right', mt: 2 }}>
            <Button color="inherit" onClick={() => handleClose()}>
              No
            </Button>
            <Button color="primary" onClick={onConfirm}>
              Yes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
