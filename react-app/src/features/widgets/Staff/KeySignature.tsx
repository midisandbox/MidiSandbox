import { Sprite, _ReactPixi } from '@inlet/react-pixi';
import React from 'react';
import { KeyOption } from '../../../utils/helpers';

interface KeySignatureProps {
  channelId: string;
  flatSpriteProps: _ReactPixi.ISprite;
  sharpSpriteProps: _ReactPixi.ISprite;
  staffWidth: number;
  yAxisNoteStep: number;
  flatWidth: number;
  sharpWidth: number;
  selectedKey: KeyOption;
}
function KeySignature({
  channelId,
  flatSpriteProps,
  sharpSpriteProps,
  staffWidth,
  yAxisNoteStep,
  flatWidth,
  sharpWidth,
  selectedKey,
}: KeySignatureProps) {
  let keyAccidentals: JSX.Element[] = [];
  const xOffset = -staffWidth * 0.1978;
  if (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'b-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset, -6 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'b-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset, 8 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'e-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth, -9 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'e-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth, 5 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['Eb', 'Ab', 'Db', 'Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'a-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 2, -5 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'a-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 2, 9 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['Ab', 'Db', 'Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'d-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 3, -8 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'d-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 3, 6 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['Db', 'Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'g-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 4, -4 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'g-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 4, 10 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['Gb'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'c-flat-treble'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 5, -7 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'c-flat-bass'}
        {...flatSpriteProps}
        position={[xOffset + flatWidth * 5, 7 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  // sharps
  if (['G', 'D', 'A', 'E', 'B', 'F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'f-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset, -9 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'f-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset, 5 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['D', 'A', 'E', 'B', 'F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'c-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth, -6 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'c-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth, 8 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['A', 'E', 'B', 'F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'g-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 2, -10 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'g-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 2, 4 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['E', 'B', 'F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'d-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 3, -7 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'d-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 3, 7 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['B', 'F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'a-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 4, -4 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'a-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 4, 10 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }
  if (['F#'].includes(selectedKey)) {
    keyAccidentals = keyAccidentals.concat([
      <Sprite
        key={'e-sharp-treble'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 5, -8 * yAxisNoteStep]}
      ></Sprite>,
      <Sprite
        key={'e-sharp-bass'}
        {...sharpSpriteProps}
        position={[xOffset + sharpWidth * 5, 6 * yAxisNoteStep]}
      ></Sprite>,
    ]);
  }

  return <>{[keyAccidentals]}</>;
}

export default KeySignature;
