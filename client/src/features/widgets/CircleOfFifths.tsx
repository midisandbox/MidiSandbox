import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import innerSlice from '../../assets/imgs/innerCircleOf5thSlice.svg';
import outerSlice from '../../assets/imgs/outerCircleOf5thSlice.svg';
import { fontFamily } from '../../assets/styles/customTheme';
import PixiStageWrapper from './PixiStageWrapper';

const innerSliceTextStyle = new PIXI.TextStyle({
  align: 'center',
  fontFamily: fontFamily,
  strokeThickness: 0.5,
  letterSpacing: 2,
});
const outerSliceTextStyle = new PIXI.TextStyle({
  align: 'center',
  fontFamily: fontFamily,
  strokeThickness: 0.5,
  letterSpacing: 2,
});
const innerSliceTexture = PIXI.Texture.from(innerSlice, {
  resourceOptions: { scale: 1 },
});
const outerSliceTexture = PIXI.Texture.from(outerSlice, {
  resourceOptions: { scale: 1 },
});

interface CircleOfFifthsProps {
  blockId: string;
  containerWidth: number;
  containerHeight: number;
}
const CircleOfFifths = React.memo(
  ({ blockId, containerWidth, containerHeight }: CircleOfFifthsProps) => {
    const pieHeight = containerHeight - 20;
    const innerSliceHeight = 0.31 * pieHeight;
    const innerSliceWidth = 0.16 * pieHeight;
    const outerSliceHeight = 0.19 * pieHeight;
    const outerSliceWidth = 0.255 * pieHeight;
    innerSliceTextStyle.fontSize = 0.28 * innerSliceWidth;
    outerSliceTextStyle.fontSize = 0.22 * outerSliceWidth;

    const getSliceNoteNames = (innerNoteNum: number, outerNoteNum: number) => {
      let { name: innerSliceText, accidental: innerNoteAccidental } =
        Utilities.getNoteDetails(innerNoteNum);
      let { name: outerSliceText, accidental: outerNoteAccidental } =
        Utilities.getNoteDetails(outerNoteNum);
      if (innerNoteAccidental) innerSliceText += innerNoteAccidental;
      if (outerNoteAccidental) outerSliceText += outerNoteAccidental;
      // change note/accidental for certain notes
      if (innerNoteNum === 3) innerSliceText = 'e♭';
      else if (innerNoteNum === 10) innerSliceText = 'b♭';
      if (outerNoteNum === 10) outerSliceText = 'B♭';
      else if (outerNoteNum === 3) outerSliceText = 'E♭';
      else if (outerNoteNum === 8) outerSliceText = 'A♭';
      else if (outerNoteNum === 1) outerSliceText = 'D♭';
      else if (outerNoteNum === 6) outerSliceText = 'G♭';
      innerSliceText = innerSliceText.toLowerCase();
      return { innerSliceText, outerSliceText };
    };

    const renderPie = () => {
      let result = [];
      for (let i = 0; i < 12; i++) {
        // render bottom slice (at 6 o'clock) then continue counterclockwise
        let innerNoteNum = (i * 5 + 3) % 12;
        let outerNoteNum = (i * 5 + 6) % 12;
        const { innerSliceText, outerSliceText } = getSliceNoteNames(
          innerNoteNum,
          outerNoteNum
        );

        result.push(
          <Container
            position={[containerWidth / 2, containerHeight / 2]}
            angle={i * -30}
            key={`slice-${i}`}
          >
            <CircleNote
              blockId={blockId}
              innerSlice={true}
              noteNum={innerNoteNum}
              spriteProps={{
                anchor: [0.5, 0],
                x: 0,
                y: 2,
                pivot: [0, -5],
                height: innerSliceHeight,
                width: innerSliceWidth,
                texture: innerSliceTexture,
              }}
              textProps={{
                anchor: 0.5,
                angle: i * 30,
                x: 0,
                y: innerSliceHeight / 1.25,
                style: innerSliceTextStyle,
                zIndex: 1,
                text: innerSliceText,
              }}
            />
            <CircleNote
              blockId={blockId}
              innerSlice={false}
              noteNum={outerNoteNum}
              spriteProps={{
                anchor: [0.5, 0],
                x: 0,
                y: innerSliceHeight,
                height: outerSliceHeight,
                width: outerSliceWidth,
                texture: outerSliceTexture,
              }}
              textProps={{
                anchor: 0.5,
                angle: i * 30,
                x: 0,
                y: innerSliceHeight + outerSliceHeight / 1.8,
                style: outerSliceTextStyle,
                zIndex: 1,
                text: outerSliceText,
              }}
            />
          </Container>
        );
      }
      return result;
    };

    return (
      <PixiStageWrapper
        width={containerWidth}
        height={containerHeight}
        backgroundColor={0x000000}
      >
        {renderPie()}
      </PixiStageWrapper>
    );
  }
);

interface CircleNoteProps {
  blockId: string;
  noteNum: number;
  innerSlice: boolean;
  spriteProps: _ReactPixi.ISprite;
  textProps: _ReactPixi.IText;
}
function CircleNote({
  blockId,
  noteNum,
  innerSlice,
  spriteProps,
  textProps,
}: CircleNoteProps) {
  // const note = useTypedSelector((state) =>
  //   selectNoteByBlockId(state, blockId, noteNum)
  // );
  // if (!note) return null;
  let computedSpriteProps = { ...spriteProps };
  let computedTextProps = { ...textProps };
  return (
    <>
      <Sprite {...computedSpriteProps} />
      <Text {...computedTextProps} />
    </>
  );
}

export default CircleOfFifths;
