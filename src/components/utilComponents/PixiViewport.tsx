import React from 'react';
import * as PIXI from 'pixi.js';
import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Viewport } from 'pixi-viewport';

export interface ViewportProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

const PixiViewport = (props: ViewportProps) => {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
};

const PixiComponentViewport = PixiComponent('Viewport', {
  create: (props: PixiComponentViewportProps) => {
    const viewport = new Viewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
    });
    viewport.drag().pinch().wheel().clampZoom({});

    return viewport;
  },
});

export default PixiViewport;
