import { Button, Grid, Typography } from '@mui/material';
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
    dispatch(removeMidiBlockAndLayout(modalData.blockId));
    handleClose();
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography sx={{ textAlign: 'center', pt: 8 }} variant="body1">
            Are you sure you want to delete this block?
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              mt: 6,
            }}
          >
            <Button sx={{ mr: 4 }} color="primary" onClick={onConfirm}>
              Yes
            </Button>
            <Button color="inherit" onClick={() => handleClose()}>
              No
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
