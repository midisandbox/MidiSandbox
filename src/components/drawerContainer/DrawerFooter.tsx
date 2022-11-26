import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import { updateJoyrideTour } from '../../redux/slices/joyrideTourSlice';
import useAuth from '../../utils/amplifyUtils';
import FullscreenButton from '../utilComponents/FullscreenButton';
import {
  drawerWidth,
  openDrawer,
  selectDrawerContainer,
} from '../../redux/slices/drawerContainerSlice';

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
  const dispatch = useAppDispatch();
  const { footerHeight } = useTypedSelector((state) =>
    selectDrawerContainer(state)
  );
  const { currentUser, signOut } = useAuth();
  const startTour = () => {
    dispatch(
      openDrawer({
        drawerId: 'BLOCK_SETTINGS',
        drawerData: { blockId: '' },
        tabValue: 1,
      })
    );
    dispatch(
      updateJoyrideTour({
        tour: 'GET_STARTED',
        stepIndex: 0,
      })
    );
  };
  return (
    <DrawerFooter zIndex={-1}>
      <Box sx={{ flexGrow: 1 }}>
        <a
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
          href="https://midisandbox.com/"
        >
          <Button color="primary">Home</Button>
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
          href="https://midisandbox.com/faq"
        >
          <Button color="primary">FAQ</Button>
        </a>
        <Button onClick={startTour} color="primary">
          Tour
        </Button>
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
