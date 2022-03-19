import Box from '@mui/material/Box';
import React from 'react';
import BlockLayout from '../features/blockLayout/BlockLayout';
import ModalContainer from '../features/modalContainer/ModalContainer';
import DrawerContainer from '../features/drawerContainer/DrawerContainer';
import { useTheme } from '@mui/material/styles';

const Sandbox = () => {
  const muiTheme = useTheme();
  return (
    <Box sx={{ height: '100%', background: muiTheme.palette.background.default}}>
      <ModalContainer />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default Sandbox;
