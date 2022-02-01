import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import DotsSvg from './DotSvg';

function LoadingOverlay({animate}: {animate?: boolean}) {
  const muiTheme = useTheme();
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: muiTheme.custom.loadingOverlayBackground,
      }}
    >
      <DotsSvg animate={animate === undefined ? true : animate} color={muiTheme.palette.primary.dark} width={75}/>
    </Box>
  );
}

export default LoadingOverlay;
