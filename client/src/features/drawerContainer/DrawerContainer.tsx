import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import BlockSettingsDrawer, {
  BlockSettingsDrawerData
} from './BlockSettingsDrawer';
import { closeDrawer, selectDrawerContainer } from './drawerContainerSlice';

const drawerWidth = 350;

interface DrawerContainerProps {
  children?: React.ReactNode;
}
export default function DrawerContainer({ children }: DrawerContainerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { open, drawerId, drawerData } = useTypedSelector((state) =>
    selectDrawerContainer(state)
  );

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Main open={open}>{children}</Main>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        transitionDuration={0}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        {drawerId === 'BLOCK_SETTINGS' && drawerData && (
          <BlockSettingsDrawer
            handleDrawerClose={handleDrawerClose}
            drawerData={drawerData as BlockSettingsDrawerData}
          />
        )}
      </Drawer>
    </Box>
  );
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  marginRight: -drawerWidth,
  ...(open && {
    marginRight: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
  justifyContent: 'flex-start',
}));
