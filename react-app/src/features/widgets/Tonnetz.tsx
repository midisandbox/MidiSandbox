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
import outerSlice from '../../assets/imgs/outerCircleOf5thSlice.svg';
import { fontFamily } from '../../assets/styles/customTheme';
import {
  ChromaticNoteNumber,
  ColorSettingsT,
  getNoteColorNum,
  parseColorToNumber,
} from '../../utils/helpers';
import { SxPropDict } from '../../utils/types';
import {
  resetKeyData,
  selectChromaticNoteOn,
  selectKeyPrevalenceById,
} from '../midiListener/midiListenerSlice';
import PixiStageWrapper from './PixiStageWrapper';
import PixiViewport from '../utilComponents/PixiViewport';
import { ITextStyle, TextStyleAlign } from 'pixi.js';

const circleTexture = PIXI.Texture.from(circleSvg);
const staffLineWhiteTexture = PIXI.Texture.from(staffLineWhite);
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
    const lineThick = 2;

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
          const lineColor = parseColorToNumber(muiTheme.palette.divider);
          const position: _ReactPixi.PointLike = [xVal + xIndent, yVal];
          // line-right
          lines.push(
            <TonnetzLine
              key={`line-right-${xIndex}-${yIndex}`}
              spriteProps={{
                alpha: 1,
                anchor: [0, 0],
                angle: 0,
                x: position[0] + circleSize / 2,
                y: position[1] + circleSize / 2,
                height: lineThick,
                width: nodeGap,
                texture: staffLineWhiteTexture,
                tint: lineColor,
              }}
            />
          );
          // line-bot-right
          lines.push(
            <TonnetzLine
              key={`line-bot-right-${xIndex}-${yIndex}`}
              spriteProps={{
                alpha: 1,
                anchor: [0, 0],
                angle: 60,
                x: position[0] + circleSize / 2,
                y: position[1] + circleSize / 2,
                height: lineThick,
                width: nodeGap,
                texture: staffLineWhiteTexture,
                tint: lineColor,
              }}
            />
          );
          // line-bot-left
          lines.push(
            <TonnetzLine
              key={`line-bot-left-${xIndex}-${yIndex}`}
              spriteProps={{
                alpha: 1,
                anchor: [0, 0],
                angle: 120,
                x: position[0] + circleSize / 2,
                y: position[1] + circleSize / 2,
                height: lineThick,
                width: nodeGap,
                texture: staffLineWhiteTexture,
                tint: lineColor,
              }}
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
      selectChromaticNoteOn(state, channelId, chromaticNum)
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
  spriteProps: _ReactPixi.ISprite;
}
const TonnetzLine = React.memo(({ spriteProps }: TonnetzLineProps) => {
  return <Sprite {...spriteProps} />;
});

export default Tonnetz;
