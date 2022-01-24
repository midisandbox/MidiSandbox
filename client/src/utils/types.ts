import { Graphics, PixiRef } from '@inlet/react-pixi';
import { SxProps } from '@mui/system';
import { Layout } from 'react-grid-layout';
import { KeyOption, KeyData } from './helpers';

export type UpdateLayoutPayload = { id: string; changes: Layout }[];

export type SxPropDict = { [key: string]: SxProps };

export type GraphicsT = PixiRef<typeof Graphics>; // PIXI.Graphics

export interface MidiInputT {
  id: string;
  manufacturer: string;
  name: string;
  eventsSuspended: boolean;
  octaveOffset: number;
  connection: string;
  state: string;
  type: string;
  version: string;
  channelIds: string[];
  pedalOn: boolean;
  reversePedal: boolean;
}

export interface MidiChannelT {
  id: string;
  inputId: string;
  number: number;
  eventsSuspended: boolean;
  octaveOffset: number;
  noteIds: string[];
  selectedKey: KeyOption;
  selectedKeyUsesSharps: boolean;
  keyData: KeyData;
  totalNoteCount: number;
  notesOn: number[];
}
export interface MidiNoteT {
  id: string;
  inputId: string;
  channelId: string;
  name: string;
  noteNumber: number;
  accidental: string | undefined;
  identifier: string;
  octave: number;
  noteOn: boolean;
  count: number;
  attack: number;
  release: number;
  velocity: number;
  timestamp: number;
}
export interface AddNewMidiInputsPayload {
  inputs: MidiInputT[];
  channels: MidiChannelT[];
  notes: MidiNoteT[];
}