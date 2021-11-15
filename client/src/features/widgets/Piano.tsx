import { Container, Sprite, Stage, _ReactPixi } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Provider as ReduxProvider, ReactReduxContext } from 'react-redux';
import blackPianoKey from '../../assets/imgs/blackPianoKey.svg';
import whitePianoKey from '../../assets/imgs/whitePianoKey.svg';
import { noteNumbers } from '../../utils/helpers';
import { selectNoteByBlockId } from '../midiListener/midiNoteSlice';
import { useTypedSelector } from '../../app/store';

const whiteKeyTexture = PIXI.Texture.from(whitePianoKey, {
  resourceOptions: { scale: 1 },
});
const blackKeyTexture = PIXI.Texture.from(blackPianoKey, {
  resourceOptions: { scale: 1 },
});

export interface PianoProps {
  blockId: string;
  containerWidth: number;
  containerHeight: number;
}
const Piano = React.memo(
  ({ blockId, containerWidth, containerHeight }: PianoProps) => {
    // iterate over the note numbers and compute their position/texture for rendering PianoKeySprite
    const renderKeys = () => {
      let output = [];
      let prevWhiteKeyEnd = 0;
      const whiteKeyWidth = 50; // TODO: retrieve this value from a setting in future
      const blackKeyWidth = whiteKeyWidth * 0.74;
      const accidentalOffset1 = 0.45;
      const accidentalOffset2 = 0.259;
      const accidentalOffset3 = 0.333;
      // TODO: start on a different noteNum depending on a setting
      for (let noteNum of noteNumbers) {
        const chromaticNum = noteNum % 12;
        let keyWidth,
          keyHeight,
          texture,
          xVal,
          zIndex = 0;
        if (prevWhiteKeyEnd >= containerWidth) break;
        if ([1, 3, 6, 8, 10].includes(chromaticNum)) {
          texture = blackKeyTexture;
          keyWidth = blackKeyWidth;
          keyHeight = containerHeight * 0.7;
          zIndex = 1;
          if ([1, 6].includes(chromaticNum)) {
            xVal = prevWhiteKeyEnd - whiteKeyWidth * accidentalOffset1;
          } else if ([3, 10].includes(chromaticNum)) {
            xVal = prevWhiteKeyEnd - whiteKeyWidth * accidentalOffset2;
          } else if ([8].includes(chromaticNum)) {
            xVal = prevWhiteKeyEnd - whiteKeyWidth * accidentalOffset3;
          }
        } else {
          texture = whiteKeyTexture;
          keyWidth = whiteKeyWidth;
          keyHeight = containerHeight;
          xVal = prevWhiteKeyEnd;
          prevWhiteKeyEnd += keyWidth;
        }

        output.push(
          <PianoKeySprite
            blockId={blockId}
            noteNum={noteNum}
            key={`note-${noteNum}`}
            spriteProps={{
              texture: texture,
              width: keyWidth,
              height: keyHeight,
              zIndex: zIndex,
              x: xVal,
              y: 0,
            }}
          />
        );
      }

      return output;
    };

    return (
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Stage
            width={containerWidth}
            height={containerHeight}
            options={{
              backgroundColor: 0xffffff,
            }}
          >
            <ReduxProvider store={store}>
              <Container sortableChildren>{renderKeys()}</Container>
            </ReduxProvider>
          </Stage>
        )}
      </ReactReduxContext.Consumer>
    );
  }
);

interface PianoKeySpriteProps {
  blockId: string;
  noteNum: number;
  spriteProps: _ReactPixi.ISprite;
}
function PianoKeySprite({
  blockId,
  noteNum,
  spriteProps,
}: PianoKeySpriteProps) {
  const note = useTypedSelector((state) =>
    selectNoteByBlockId(state, blockId, noteNum)
  );
  if (!note) return null;

  let computedProps = { ...spriteProps };
  if (note.noteon) {
    computedProps.tint = 0xe91e63;
    computedProps.texture = whiteKeyTexture;
  } else {
    computedProps.tint = 0xffffff;
    computedProps.texture = spriteProps.texture;
  }

  return <Sprite {...computedProps} />;
}

export default Piano;
