import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTypedSelector } from '../../app/store';
import useAuth from '../userAuth/amplifyUtils';
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
        overflow: 'hidden',
        borderTop: `1px solid ${theme.palette.divider}`,
        borderLeft: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        ...(zIndex !== undefined && { zIndex }),
      }}
    >
      {props.children}
    </Box>
  );
};

export const DefaultDrawerFooter = () => {
  const { footerHeight } = useTypedSelector((state) =>
    selectDrawerContainer(state)
  );
  const { currentUser, signOut } = useAuth();
  return (
    <DrawerFooter zIndex={-1}>
      <Box sx={{ flexGrow: 1 }}>
        <Link style={{ textDecoration: 'none' }} to="/">
          <Button color="primary">Home</Button>
        </Link>
        {currentUser ? (
          <Button onClick={signOut} color="primary">
            Logout
          </Button>
        ) : (
          <Link style={{ textDecoration: 'none' }} to="/login">
            <Button color="primary">Login</Button>
          </Link>
        )}
      </Box>
      <FullscreenButton width={footerHeight} height={footerHeight} />
    </DrawerFooter>
  );
};
