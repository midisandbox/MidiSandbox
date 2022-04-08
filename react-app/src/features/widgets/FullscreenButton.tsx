import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton } from '@mui/material';
import React from 'react';

interface FullscreenButtonProps {
  width?: number;
  height?: number;
}
function FullscreenButton({ width, height }: FullscreenButtonProps) {
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
    if (document.fullscreenElement) {
      exitFullScreen();
    } else {
      launchFullScreen(document.documentElement);
      // launchFullScreen(document.getElementById("videoElement")); // any individual element
    }
  };

  return (
    <IconButton
      onClick={toggleFullscreen}
      sx={{
        p: 0.5,
        ...(width && { width }),
        ...(height && { height }),
        borderRadius: 0,
      }}
      color="primary"
    >
      {document.fullscreenElement ? <FullscreenExitIcon />: <FullscreenIcon />}
    </IconButton>
  );
}

export default FullscreenButton;
