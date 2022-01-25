import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import DotsSvg from './DotSvg';
import { BlockTheme } from '../../utils/helpers';

function LoadingOverlay({animate, theme}: {animate?: boolean, theme: BlockTheme}) {
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
        backgroundColor: theme === 'Light' ? '#ffffff8a' : '#4e4e4e94',
      }}
    >
      <DotsSvg animate={animate === undefined ? true : animate} color={muiTheme.palette.primary.dark} width={75}/>
    </Box>
  );
}

export default LoadingOverlay;
