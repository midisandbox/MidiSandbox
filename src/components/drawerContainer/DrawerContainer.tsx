import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import BlockSettingsTab, {
  BlockSettingsTabData,
} from './settingsTabs/BlockSettingsTab';
import {
  closeDrawer,
  drawerWidth,
  selectDrawerContainer,
  updateDrawerTab,
} from '../../redux/slices/drawerContainerSlice';
import { DefaultDrawerFooter } from './DrawerFooter';
import GlobalSettingsTab from './settingsTabs/GlobalSettingsTab';
import TemplatesTab from './templatesTab/TemplatesTab';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import { isMobileView } from '../../utils/utils';
const headerHeight = 12; // spacing units

interface DrawerContainerProps {
  children?: React.ReactNode;
}
export default function DrawerContainer({ children }: DrawerContainerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabClasses = useTabStyles();
  const { open, drawerId, drawerData, tabValue, footerHeight } =
    useTypedSelector((state) => selectDrawerContainer(state));

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleTabChange = (e: React.SyntheticEvent, newValue: number) => {
    dispatch(updateDrawerTab(newValue));
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Main open={open} shrinkMainOnDrawerOpen={!isMobileView()}>
        {children}
      </Main>
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
        <DrawerHeader sx={{ height: theme.spacing(headerHeight) }}>
          <IconButton
            color="primary"
            sx={{ height: '100%', borderRadius: 0 }}
            onClick={handleDrawerClose}
          >
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            classes={{
              root: tabClasses.tabsRoot,
            }}
            sx={{ height: theme.spacing(headerHeight) }}
            aria-label="setting tabs"
          >
            {['Widget', 'Global', 'Templates'].map((x, i) => (
              <Tab
                className={`tab-${x}`}
                key={`tab-${i}`}
                classes={{
                  root: tabClasses.tabRoot,
                }}
                label={x}
                {...a11yProps(0)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Tabs>
        </DrawerHeader>
        <Box
          sx={{
            position: 'absolute',
            top: theme.spacing(headerHeight),
            pt: 3,
            bottom: footerHeight,
            width: '100%',
            borderTop: `1px solid ${theme.palette.divider}`,
            overflow: 'auto !important',
            overflowX: 'hidden',
          }}
        >
          <TabPanel value={tabValue} index={0}>
            {drawerId === 'BLOCK_SETTINGS' && (
              <BlockSettingsTab
                drawerData={drawerData as BlockSettingsTabData}
              />
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <GlobalSettingsTab />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <TemplatesTab />
          </TabPanel>
        </Box>
        <DefaultDrawerFooter />
      </Drawer>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const Main = styled('main', {
  shouldForwardProp: (prop) =>
    !['open', 'shrinkMainOnDrawerOpen'].includes(prop as any),
})<{
  open?: boolean;
  shrinkMainOnDrawerOpen: boolean;
}>(({ theme, open, shrinkMainOnDrawerOpen }) => ({
  flexGrow: 1,
  marginRight: -drawerWidth,
  ...(open &&
    shrinkMainOnDrawerOpen && {
      marginRight: 0,
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0),
  justifyContent: 'flex-start',
}));

const useTabStyles = makeStyles((theme: Theme) => ({
  tabsRoot: {
    minHeight: theme.spacing(headerHeight),
    height: theme.spacing(headerHeight),
    flexGrow: 1,
  },
  tabRoot: {
    minHeight: theme.spacing(headerHeight),
    height: theme.spacing(headerHeight),
    padding: theme.spacing(1),
    flexGrow: 1,
  },
}));
