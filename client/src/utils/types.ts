import { Layout } from 'react-grid-layout';
import { SxProps } from '@mui/system';

export type UpdateLayoutPayload = { id: string; changes: Layout }[];

export type SxPropDict = {[key: string]: SxProps};