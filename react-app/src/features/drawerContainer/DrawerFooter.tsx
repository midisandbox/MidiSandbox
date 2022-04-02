import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useTypedSelector } from '../../app/store';
import FullscreenButton from '../widgets/FullscreenButton';
import { drawerWidth, selectDrawerContainer } from './drawerContainerSlice';

interface DrawerFooterProps {
  zIndex?: number;
}
export const DrawerFooter = (
  props: React.PropsWithChildren<DrawerFooterProps>
) => {
  const theme = useTheme();
  const { footerHeight } = useTypedSelector((state) =>
    selectDrawerContainer(state)
  );
  const { zIndex } = props;
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: drawerWidth,
        display: 'flex',
        alignItems: 'center',
        height: footerHeight,
        outline: `1px solid ${theme.palette.divider}`,
        ...(zIndex !== undefined && { zIndex }),
      }}
    >
      {props.children}
    </Box>
  );
};

export const DefaultDrawerFooter = () => {
  return (
    <DrawerFooter zIndex={-1}>
      <Box sx={{ flexGrow: 1 }}>
        <Button>FAQ</Button>
      </Box>
      <FullscreenButton />
    </DrawerFooter>
  );
};
