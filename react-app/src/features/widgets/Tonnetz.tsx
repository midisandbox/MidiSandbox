import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as PIXI from 'pixi.js';
import React, { useCallback } from 'react';
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
  selectKeyPrevalenceById,
} from '../midiListener/midiListenerSlice';
import PixiStageWrapper from './PixiStageWrapper';
import PixiViewport from '../utilComponents/PixiViewport';

const noteTextStyle = new PIXI.TextStyle({
  align: 'center',
  fontFamily: fontFamily,
  strokeThickness: 0.5,
  letterSpacing: 2,
});
const circleTexture = PIXI.Texture.from(circleSvg);
const staffLineWhiteTexture = PIXI.Texture.from(staffLineWhite);

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
    noteTextStyle.fontSize = (circleSize * 2.5) / 5;

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
          const chromaticNote = getChromaticNumForNode(xIndex, yIndex);
          let { name: nodeText, accidental } =
            Utilities.getNoteDetails(chromaticNote);
          if (accidental) nodeText += accidental;
          const nodeColor = getNoteColorNum(chromaticNote, colorSettings);
          const lineColor = getNoteColorNum(3, colorSettings);
          const position: _ReactPixi.PointLike = [xVal + xIndent, yVal];
          // line-right
          lines.push(
            <TonnetzLine
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
              key={`node-${xVal}-${yVal}-${startingNote}`}
              position={position}
              circleSize={circleSize}
              nodeColor={nodeColor}
              nodeText={nodeText}
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

const getChromaticNumForNode = (xIndex: number, yIndex: number) => {
  const numOddIntervals = Math.floor(0.5 + yIndex / 2);
  const numEvenIntervals = Math.floor(yIndex / 2);
  const yValue = numOddIntervals * 4 + numEvenIntervals * 9;
  return (yValue + xIndex * 7) % 12;
};

interface TonnetzNodeProps {
  position: _ReactPixi.PointLike;
  circleSize: number;
  nodeColor: number;
  nodeText: string;
}
const TonnetzNode = React.memo(
  ({ position, circleSize, nodeColor, nodeText }: TonnetzNodeProps) => {
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
            tint: nodeColor,
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
