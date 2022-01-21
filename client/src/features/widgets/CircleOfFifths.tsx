import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useTheme } from '@mui/material/styles';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useTypedSelector, useAppDispatch } from '../../app/store';
import innerSlice from '../../assets/imgs/innerCircleOf5thSlice.svg';
import outerSlice from '../../assets/imgs/outerCircleOf5thSlice.svg';
import { fontFamily } from '../../assets/styles/customTheme';
import { ChromaticNoteNumber, getNoteColor, ColorSettingsT, BlockTheme } from '../../utils/helpers';
import {
  resetKeyData,
  selectKeyPrevalenceById,
} from '../midiListener/midiChannelSlice';
import PixiStageWrapper from './PixiStageWrapper';
import { parseColorToNumber } from '../../utils/helpers';
import { IconButton } from '@mui/material';
import { SxPropDict } from '../../utils/types';

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
const innerSliceTexture = PIXI.Texture.from(innerSlice);
const outerSliceTexture = PIXI.Texture.from(outerSlice);

interface CircleOfFifthsProps {
  channelId: string;
  colorSettings: ColorSettingsT;
  containerWidth: number;
  containerHeight: number;
  blockTheme: BlockTheme;
}
const CircleOfFifths = React.memo(
  ({
    channelId,
    colorSettings,
    containerWidth,
    containerHeight,
    blockTheme
  }: CircleOfFifthsProps) => {
    const muiTheme = useTheme();
    const keyPrevalence = useTypedSelector((state) =>
      selectKeyPrevalenceById(state, channelId)
    );
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
        let innerNoteNum = ((i * 5 + 3) % 12) as ChromaticNoteNumber;
        let outerNoteNum = ((i * 5 + 6) % 12) as ChromaticNoteNumber;
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
              spriteProps={{
                alpha: Math.max(0.2, keyPrevalence[innerNoteNum]),
                anchor: [0.5, 0],
                x: 0,
                y: 2,
                pivot: [0, -5],
                height: innerSliceHeight,
                width: innerSliceWidth,
                texture: innerSliceTexture,
                tint: getNoteColor(innerNoteNum, colorSettings),
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
              spriteProps={{
                alpha: Math.max(0.2, keyPrevalence[outerNoteNum]),
                anchor: [0.5, 0],
                x: 0,
                y: innerSliceHeight,
                height: outerSliceHeight,
                width: outerSliceWidth,
                texture: outerSliceTexture,
                tint: getNoteColor(outerNoteNum, colorSettings),
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
        backgroundColor={blockTheme === 'Light'
        ? parseColorToNumber(muiTheme.custom.lightBackground)
        : parseColorToNumber(muiTheme.custom.darkBackground)}
      >
        {renderPie()}
      </PixiStageWrapper>
    );
  }
);

interface CircleNoteProps {
  spriteProps: _ReactPixi.ISprite;
  textProps: _ReactPixi.IText;
}
function CircleNote({ spriteProps, textProps }: CircleNoteProps) {
  let computedSpriteProps = { ...spriteProps };
  let computedTextProps = { ...textProps };
  return (
    <>
      <Sprite {...computedSpriteProps} />
      <Text {...computedTextProps} />
    </>
  );
}

interface CircleOfFifthsBlockButtonsProps {
  channelId: string;
  styles: SxPropDict;
}
export const CircleOfFifthsBlockButtons = React.memo(
  ({ styles, channelId }: CircleOfFifthsBlockButtonsProps) => {
    const dispatch = useAppDispatch();
    const onRefreshClick = () => {
      dispatch(resetKeyData({ channelId }));
    };
    return (
      <IconButton
        color="default"
        sx={styles.block_icon}
        onClick={onRefreshClick}
        aria-label="settings"
      >
        <RefreshOutlinedIcon />
      </IconButton>
    );
  }
);

export default CircleOfFifths;
