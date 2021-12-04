import { Graphics, PixiRef } from '@inlet/react-pixi';
import { SxProps } from '@mui/system';
import { Layout } from 'react-grid-layout';

export type UpdateLayoutPayload = { id: string; changes: Layout }[];

export type SxPropDict = { [key: string]: SxProps };

export type GraphicsT = PixiRef<typeof Graphics>; // PIXI.Graphics