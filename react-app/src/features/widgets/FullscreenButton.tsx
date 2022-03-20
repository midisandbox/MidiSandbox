import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { Box, IconButton } from '@mui/material';
import React from 'react';

function FullscreenButton() {
  const launchFullScreen = (element: any) => {
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  };

  const exitFullScreen = () => {
    const _document = document as any;
    if (_document.exitFullscreen) {
      _document.exitFullscreen();
    } else if (_document.webkitExitFullscreen) {
      _document.webkitExitFullscreen();
    } else if (_document.mozCancelFullScreen) {
      _document.mozCancelFullScreen();
    } else if (_document.msExitFullscreen) {
      _document.msExitFullscreen();
    }
  };

  const toggleFullscreen = (e: React.MouseEvent<HTMLButtonElement>) => {
    const screenTop = window.screenTop ? window.screenTop : window.screenY;
    if (screenTop === 0) {
      exitFullScreen();
    } else {
      launchFullScreen(document.documentElement);
      // launchFullScreen(document.getElementById("videoElement")); // any individual element
    }
  };

  return (
    <Box>
      <IconButton onClick={toggleFullscreen} sx={{ p: 0.5 }}>
        <FullscreenIcon />
      </IconButton>
    </Box>
  );
}

export default FullscreenButton;
