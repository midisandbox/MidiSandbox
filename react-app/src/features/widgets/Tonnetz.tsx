import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as PIXI from 'pixi.js';
import React, { useCallback, useMemo } from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import circleSvg from '../../assets/imgs/circle.svg';
import staffLineWhite from '../../assets/imgs/staffLineWhite.svg';
import triangleWhite from '../../assets/imgs/equilateralTriangleWhite.svg';
import outerSlice from '../../assets/imgs/outerCircleOf5thSlice.svg';
import { fontFamily } from '../../assets/styles/customTheme';
import {
  calculateColorDiff,
  ChromaticNoteNumber,
  ColorSettingsT,
  getNoteColorNum,
  getNoteColorNumStr,
  hexToRgb,
  parseColorToNumber,
  rgbToHex,
} from '../../utils/helpers';
import { SxPropDict } from '../../utils/types';
import {
  resetKeyData,
  selectChromaticNotesOn,
  selectKeyPrevalenceById,
} from '../midiListener/midiListenerSlice';
import PixiStageWrapper from './PixiStageWrapper';
import PixiViewport from '../utilComponents/PixiViewport';
import { ITextStyle, TextStyleAlign } from 'pixi.js';

const circleTexture = PIXI.Texture.from(circleSvg);
const staffLineWhiteTexture = PIXI.Texture.from(staffLineWhite);
const triangleWhiteTexture = PIXI.Texture.from(triangleWhite);
// const defaultTextStyle: Partial<ITextStyle> = ;

interface TonnetzProps {
  channelId: string;
  colorSettings: ColorSettingsT;
  containerWidth: number;
  containerHeight: number;
}
const Tonnetz = React.memo(
  ({
    channelId,
    colorSettings,
    containerWidth,
    containerHeight,
  }: TonnetzProps) => {
    const muiTheme = useTheme();
    const circleSize = 45;
    const nodeGap = circleSize * 2.5;

    const getLineOnColor = (
      chromaticNums?: [ChromaticNoteNumber, ChromaticNoteNumber]
    ) => {
      if (chromaticNums && colorSettings.style === 'Color Palette') {
        console.log(
          'asdf',
          calculateColorDiff(
            hexToRgb(getNoteColorNumStr(chromaticNums[0], colorSettings)),
            hexToRgb(getNoteColorNumStr(chromaticNums[1], colorSettings))
          )
        );
        return parseColorToNumber(
          rgbToHex(
            calculateColorDiff(
              hexToRgb(getNoteColorNumStr(chromaticNums[0], colorSettings)),
              hexToRgb(getNoteColorNumStr(chromaticNums[1], colorSettings))
            )
          )
        );
      }
      return getNoteColorNum(0, colorSettings);
    };

    const renderSprites = () => {
      let nodes = [],
        lines = [],
        triangles = [];
      let xIndex = 0,
        xVal = 0,
        yIndex = 0,
        yVal = 0;
      let startingNote = 0;
      while (xVal < containerWidth) {
        while (yVal < containerHeight) {
          const oddYIndex = yIndex % 2 === 0;
          const xIndent = oddYIndex ? 0 : nodeGap / 2;
          const chromaticNum: ChromaticNoteNumber = getChromaticNumForNode(
            xIndex,
            yIndex
          );
          let { name: nodeText, accidental } =
            Utilities.getNoteDetails(chromaticNum);
          if (accidental) nodeText += accidental;
          const noteOnColor = getNoteColorNum(chromaticNum, colorSettings);
          const noteOffColor = parseColorToNumber(muiTheme.palette.divider);

          const lineOffColor = parseColorToNumber(muiTheme.palette.divider);
          const position: _ReactPixi.PointLike = [xVal + xIndent, yVal];
          const lineSpriteProps: _ReactPixi.ISprite = {
            alpha: 1,
            anchor: [0, 0],
            angle: 0,
            x: position[0] + circleSize / 2,
            y: position[1] + circleSize / 2,
            width: nodeGap,
            texture: staffLineWhiteTexture,
          };

          // line-right
          let chromaticNums: [ChromaticNoteNumber, ChromaticNoteNumber] = [
            chromaticNum,
            ((chromaticNum + 7) % 12) as ChromaticNoteNumber,
          ];
          lines.push(
            <TonnetzLine
              key={`line-right-${xIndex}-${yIndex}`}
              chromaticNums={chromaticNums}
              channelId={channelId}
              lineOnColor={getLineOnColor(chromaticNums)}
              lineOffColor={lineOffColor}
              spriteProps={{ ...lineSpriteProps }}
            />
          );
          // line-bot-right
          chromaticNums = [
            chromaticNum,
            ((chromaticNum + 4) % 12) as ChromaticNoteNumber,
          ];
          lines.push(
            <TonnetzLine
              key={`line-bot-right-${xIndex}-${yIndex}`}
              chromaticNums={chromaticNums}
              channelId={channelId}
              lineOnColor={getLineOnColor(chromaticNums)}
              lineOffColor={lineOffColor}
              spriteProps={{ ...lineSpriteProps, angle: 60 }}
            />
          );
          // line-bot-left
          chromaticNums = [
            chromaticNum,
            ((chromaticNum + 9) % 12) as ChromaticNoteNumber,
          ];
          lines.push(
            <TonnetzLine
              key={`line-bot-left-${xIndex}-${yIndex}`}
              chromaticNums={chromaticNums}
              channelId={channelId}
              lineOnColor={getLineOnColor(chromaticNums)}
              lineOffColor={lineOffColor}
              spriteProps={{ ...lineSpriteProps, angle: 120 }}
            />
          );
          nodes.push(
            <TonnetzNode
              key={`node-${xIndex}-${yIndex}`}
              position={position}
              circleSize={circleSize}
              noteOnColor={noteOnColor}
              noteOffColor={noteOffColor}
              nodeText={nodeText}
              chromaticNum={chromaticNum}
              channelId={channelId}
            />
          );

          yVal += nodeGap / 2 + circleSize;
          yIndex++;
        }
        yIndex = 0;
        yVal = 0;
        xVal += nodeGap;
        xIndex++;
      }

      return lines.concat(nodes);
    };

    return (
      <PixiStageWrapper
        key={`tonnetz-${containerWidth}-${containerHeight}`}
        width={containerWidth}
        height={containerHeight}
        backgroundColor={parseColorToNumber(muiTheme.palette.background.paper)}
      >
        {/* <PixiViewport width={containerWidth} height={containerHeight}> */}
        {renderSprites()}
        {/* </PixiViewport> */}
      </PixiStageWrapper>
    );
  }
);

const getChromaticNumForNode = (
  xIndex: number,
  yIndex: number
): ChromaticNoteNumber => {
  const numOddIntervals = Math.floor(0.5 + yIndex / 2);
  const numEvenIntervals = Math.floor(yIndex / 2);
  const yValue = numOddIntervals * 4 + numEvenIntervals * 9;
  return ((yValue + xIndex * 7) % 12) as ChromaticNoteNumber;
};

interface TonnetzNodeProps {
  position: _ReactPixi.PointLike;
  circleSize: number;
  noteOnColor: number;
  noteOffColor: number;
  nodeText: string;
  chromaticNum: ChromaticNoteNumber;
  channelId: string;
}
const TonnetzNode = React.memo(
  ({
    position,
    circleSize,
    noteOnColor,
    noteOffColor,
    nodeText,
    channelId,
    chromaticNum,
  }: TonnetzNodeProps) => {
    const noteOn = useTypedSelector((state) =>
      selectChromaticNotesOn(state, channelId, [chromaticNum])
    );
    const noteTextStyle = useMemo(
      () =>
        new PIXI.TextStyle({
          align: 'center',
          fontFamily: fontFamily,
          strokeThickness: 0.5,
          letterSpacing: 2,
          fontSize: (circleSize * 2.5) / 5,
        }),
      [circleSize]
    );
    noteTextStyle.fill = noteOn ? '#000000' : '#ffffff';

    return (
      <Container position={position}>
        {/* circle */}
        <Sprite
          {...{
            alpha: 1,
            anchor: [0, 0],
            x: 0,
            y: 0,
            zIndex: 1,
            height: circleSize,
            width: circleSize,
            texture: circleTexture,
            tint: noteOn ? noteOnColor : noteOffColor,
          }}
        />
        {/* text */}
        <Text
          {...{
            anchor: 0.5,
            angle: 0,
            x: circleSize / 2,
            y: circleSize / 2,
            style: noteTextStyle,
            zIndex: 2,
            text: nodeText,
          }}
        />
      </Container>
    );
  }
);

interface TonnetzLineProps {
  channelId: string;
  spriteProps: _ReactPixi.ISprite;
  chromaticNums: [ChromaticNoteNumber, ChromaticNoteNumber]; // the two nodes that the line is connected to
  lineOnColor: number;
  lineOffColor: number;
}
const TonnetzLine = React.memo(
  ({
    spriteProps,
    channelId,
    chromaticNums,
    lineOnColor,
    lineOffColor,
  }: TonnetzLineProps) => {
    const notesOn = useTypedSelector((state) =>
      selectChromaticNotesOn(state, channelId, chromaticNums)
    );
    return (
      <Sprite
        {...spriteProps}
        {...{
          tint: notesOn ? lineOnColor : lineOffColor,
          height: notesOn ? 5 : 2,
        }}
      />
    );
  }
);

export default Tonnetz;
