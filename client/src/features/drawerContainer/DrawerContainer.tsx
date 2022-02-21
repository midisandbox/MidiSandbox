import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Tab, Tabs } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { useTabStyles } from '../../assets/styles/styleHooks';
import BlockSettingsDrawer, {
  BlockSettingsDrawerData,
} from './BlockSettingsDrawer';
import { closeDrawer, selectDrawerContainer } from './drawerContainerSlice';
import GlobalSettingsDrawer from './GlobalSettingsDrawer';
import TemplatesDrawer from './TemplatesDrawer';

const drawerWidth = 350;

interface DrawerContainerProps {
  children?: React.ReactNode;
}
export default function DrawerContainer({ children }: DrawerContainerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabClasses = useTabStyles();
  const { open, drawerId, drawerData } = useTypedSelector((state) =>
    selectDrawerContainer(state)
  );
  const [tabValue, setTabValue] = useState(0);

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleTabChange = (e: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        <DrawerHeader sx={{ mb: 4 }}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              classes={{
                root: tabClasses.tabsRoot,
              }}
              aria-label="setting tabs"
            >
              {['Block', 'Global', 'Templates'].map((x, i) => (
                <Tab
                  key={`tab-${i}`}
                  classes={{
                    root: tabClasses.tabRoot,
                  }}
                  label={x}
                  {...a11yProps(0)}
                />
              ))}
            </Tabs>
          </Box>
        </DrawerHeader>
        <TabPanel value={tabValue} index={0}>
          {drawerId === 'BLOCK_SETTINGS' && (
            <BlockSettingsDrawer
              drawerData={drawerData as BlockSettingsDrawerData}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <GlobalSettingsDrawer />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <TemplatesDrawer />
        </TabPanel>
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
