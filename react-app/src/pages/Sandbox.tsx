import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import BlockLayout from '../features/blockLayout/BlockLayout';
import DrawerContainer from '../features/drawerContainer/DrawerContainer';
import ModalContainer from '../features/modalContainer/ModalContainer';

const Sandbox = () => {
  const muiTheme = useTheme();
  return (
    <Box
      sx={{ height: '100%', background: muiTheme.palette.background.default }}
    >
      <ModalContainer />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default Sandbox;
