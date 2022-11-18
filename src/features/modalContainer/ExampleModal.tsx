import {
  Button, Grid, Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

export interface ExampleModalData {
  exampleId: string;
}
export interface ExampleModalProps {
  modalData: ExampleModalData;
  handleClose: Function;
}
export default function ExampleModal({
  modalData,
  handleClose,
}: ExampleModalProps) {
  // const { exampleId } = modalData;

  const onSave = () => {
    handleClose();
  };

  return (
    <Box>
      <Typography
        sx={modalStyles.modalHeader}
        id="transition-modal-title"
        variant="h6"
        component="h2"
      >
        Example Modal
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          CONTENT GOES HERE
        </Grid>
        <Grid item xs={12}>
          <Box sx={{float: 'right', mt: 2}}>
            <Button color='inherit' onClick={() => handleClose()}>Cancel</Button>
            <Button color="primary" onClick={onSave}>
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

const modalStyles = {
  modalHeader: {
    mb: 5,
  },
};
