import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useTypedSelector } from '../../app/store';
import blackPianoKey from '../../assets/imgs/blackPianoKey.svg';
import whitePianoKey from '../../assets/imgs/whitePianoKey.svg';
import whitePianoKeyBordered from '../../assets/imgs/whitePianoKeyBordered.svg';
import { fontFamily } from '../../assets/styles/customTheme';
import { getNoteColorNum, PianoSettingsT, ColorSettingsT } from '../../utils/helpers';
import { selectNoteOnByChannelId } from '../midiListener/midiListenerSlice';
import PixiStageWrapper from './PixiStageWrapper';

const pianoTextStyle = new PIXI.TextStyle({
  align: 'center',
  fontFamily: fontFamily,
  fontSize: '16px',
  strokeThickness: 0.5,
  letterSpacing: 2,
});
const whiteKeyTexture = PIXI.Texture.from(whitePianoKey);
const whiteKeyBorderedTexture = PIXI.Texture.from(whitePianoKeyBordered);
const blackKeyTexture = PIXI.Texture.from(blackPianoKey);

interface PianoProps {
  channelId: string;
  pianoSettings: PianoSettingsT;
  colorSettings: ColorSettingsT;
  containerWidth: number;
  containerHeight: number;
}
const Piano = React.memo(
  ({
    channelId,
    pianoSettings,
    colorSettings,
    containerWidth,
    containerHeight,
  }: PianoProps) => {
    // iterate over the note numbers and compute their position/texture for rendering PianoKeySprite
    const renderKeys = () => {
      let output = [];
      let prevWhiteKeyEnd = 0;
      const whiteKeyWidth = pianoSettings.keyWidth;
      const blackKeyWidth = whiteKeyWidth * 0.74;
      const accidentalOffset1 = 0.45;
      const accidentalOffset2 = 0.259;
      const accidentalOffset3 = 0.333;
      for (let noteNum = pianoSettings.startNote; noteNum <= 127; noteNum++) {
        const chromaticNum = noteNum % 12;
        const noteOnColor = getNoteColorNum(noteNum, colorSettings);
        let keyWidth,
          keyHeight,
          texture,
          xVal = 0,
          zIndex = 0,
          isBlackKey = false;
        if (prevWhiteKeyEnd >= containerWidth) break;
        if ([1, 3, 6, 8, 10].includes(chromaticNum)) {
          isBlackKey = true;
          texture = blackKeyTexture;
          keyWidth = blackKeyWidth;
          keyHeight = containerHeight * 0.65;
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
          prevWhiteKeyEnd += keyWidth + 2;
        }

        if (chromaticNum === 0) {
          const { octave } = Utilities.getNoteDetails(noteNum) as any;
          output.push(
            <Text
              key={`note-text-${noteNum}`}
              text={`C${octave}`}
              anchor={0.5}
              x={xVal + 0.5 * keyWidth}
              y={containerHeight - 16}
              style={pianoTextStyle}
              zIndex={1}
            />
          );
        }

        output.push(
          <PianoKeySprite
            key={`note-${noteNum}`}
            channelId={channelId}
            noteNum={noteNum}
            isBlackKey={isBlackKey}
            noteOnColor={noteOnColor}
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
      <PixiStageWrapper
        width={containerWidth}
        height={containerHeight}
        backgroundColor={0x000000}
      >
        <Container sortableChildren>{renderKeys()}</Container>
      </PixiStageWrapper>
    );
  }
);

interface PianoKeySpriteProps {
  channelId: string;
  noteNum: number;
  noteOnColor: number;
  isBlackKey: boolean;
  spriteProps: _ReactPixi.ISprite;
}
function PianoKeySprite({
  channelId,
  noteNum,
  noteOnColor,
  isBlackKey,
  spriteProps,
}: PianoKeySpriteProps) {
  const noteOn = useTypedSelector((state) =>
  selectNoteOnByChannelId(state, channelId, noteNum)
  );

  let computedProps = { ...spriteProps };
  if (noteOn) {
    computedProps.tint = noteOnColor;
    if (isBlackKey) {
      computedProps.texture = whiteKeyBorderedTexture;
    }
  } else {
    computedProps.tint = 0xffffff;
    computedProps.texture = spriteProps.texture;
  }

  return <Sprite {...computedProps} />;
}

export default Piano;
