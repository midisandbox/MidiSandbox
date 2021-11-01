import Box from '@mui/material/Box';
import React from 'react';
import BlockLayout from './features/blockLayout/BlockLayout';
import ModalContainer from './features/modalContainer/ModalContainer';

const App = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <ModalContainer />
      <BlockLayout />
    </Box>
  );
};

export default App;
