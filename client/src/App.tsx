import Box from '@mui/material/Box';
import React from 'react';
import BlockLayout from './features/blockLayout/BlockLayout';
import ModalContainer from './features/modalContainer/ModalContainer';
import DrawerContainer from './features/drawerContainer/DrawerContainer';

const App = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <ModalContainer />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default App;
