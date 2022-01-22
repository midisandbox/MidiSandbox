import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import DotsSvg from './DotSvg';

function LoadingOverlay() {
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
        backgroundColor: '#99999982',
      }}
    >
      <DotsSvg color={muiTheme.palette.primary.dark} width={75}/>
    </Box>
  );
}

export default LoadingOverlay;
