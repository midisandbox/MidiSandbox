import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import { useTheme } from '@mui/material/styles';
import * as PIXI from 'pixi.js';
import React, { useMemo } from 'react';
import { Utilities } from 'webmidi/dist/esm/webmidi.esm';
import { useTypedSelector } from '../../app/store';
import circleSvg from '../../assets/imgs/circle.svg';
import triangleWhite from '../../assets/imgs/equilateralTriangleWhite.svg';
import staffLineWhite from '../../assets/imgs/staffLineWhite.svg';
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
  TonnetzSettingsT,
} from '../../utils/helpers';
import { selectChromaticNotesOn } from '../midiListener/midiListenerSlice';
import PixiStageWrapper from './PixiStageWrapper';

const circleTexture = PIXI.Texture.from(circleSvg);
const staffLineWhiteTexture = PIXI.Texture.from(staffLineWhite);
const triangleWhiteTexture = PIXI.Texture.from(triangleWhite);

interface TonnetzProps {
  channelId: string;
  tonnetzSettings: TonnetzSettingsT;
  colorSettings: ColorSettingsT;
  containerWidth: number;
  containerHeight: number;
}
const Tonnetz = React.memo(
  ({
    channelId,
    tonnetzSettings,
    colorSettings,
    containerWidth,
    containerHeight,
  }: TonnetzProps) => {
    const muiTheme = useTheme();
    const circleSize = 45 * tonnetzSettings.zoom;
    const nodeGap = circleSize * 2.5;

    const getLineOnColor = (
      chromaticNums?: [ChromaticNoteNumber, ChromaticNoteNumber]
    ) => {
      if (chromaticNums && colorSettings.style === 'Color Palette') {
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

    const getTriangleOnColor = (
      chromaticNums?: [
        ChromaticNoteNumber,
        ChromaticNoteNumber,
        ChromaticNoteNumber
      ]
    ) => {
      if (chromaticNums && colorSettings.style === 'Color Palette') {
        let mergeColor = calculateColorDiff(
          hexToRgb(getNoteColorNumStr(chromaticNums[0], colorSettings)),
          hexToRgb(getNoteColorNumStr(chromaticNums[1], colorSettings)),
          0.5
        );
        mergeColor = calculateColorDiff(
          mergeColor,
          hexToRgb(getNoteColorNumStr(chromaticNums[2], colorSettings)),
          0.33
        );
        return parseColorToNumber(rgbToHex(mergeColor));
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
      while (xVal < containerWidth) {
        while (yVal < containerHeight) {
          const isOddYIndex = yIndex % 2 === 0;
          const xIndent = isOddYIndex ? 0 : nodeGap / 2;
          const position: _ReactPixi.PointLike = [xVal + xIndent, yVal];
          const chromaticNum: ChromaticNoteNumber = getChromaticNumForNode(
            xIndex,
            yIndex
          );

          // add triangles to bot and bot-right of node
          let triangleChromaticNums: [
            ChromaticNoteNumber,
            ChromaticNoteNumber,
            ChromaticNoteNumber
          ] = [
            chromaticNum,
            ((chromaticNum + 4) % 12) as ChromaticNoteNumber,
            ((chromaticNum + 9) % 12) as ChromaticNoteNumber,
          ];
          let triangleSpriteProps: _ReactPixi.ISprite = {
            alpha: 1,
            anchor: [0, 0],
            angle: 0,
            x: xVal + xIndent - circleSize * 0.79,
            y: position[1] + circleSize / 2,
            width: nodeGap,
            height: nodeGap * 0.9,
            texture: triangleWhiteTexture,
          };
          // bot triangle
          triangles.push(
            <TonnetzTriangle
              key={`bot-triangle-${xIndex}-${yIndex}`}
              chromaticNums={triangleChromaticNums}
              channelId={channelId}
              onColor={getTriangleOnColor(triangleChromaticNums)}
              offColor={parseColorToNumber(muiTheme.palette.background.paper)}
              spriteProps={triangleSpriteProps}
            />
          );
          // bot-right triangle
          triangleChromaticNums = [
            chromaticNum,
            ((chromaticNum + 4) % 12) as ChromaticNoteNumber,
            ((chromaticNum + 7) % 12) as ChromaticNoteNumber,
          ];
          triangleSpriteProps = {
            ...triangleSpriteProps,
            angle: 180,
            x: nodeGap * 1.5 + xVal + xIndent - circleSize * 0.79,
            y: nodeGap + position[1] + circleSize / 3 - 5,
          };
          triangles.push(
            <TonnetzTriangle
              key={`bot-right-triangle-${xIndex}-${yIndex}`}
              chromaticNums={triangleChromaticNums}
              channelId={channelId}
              onColor={getTriangleOnColor(triangleChromaticNums)}
              offColor={parseColorToNumber(muiTheme.palette.background.paper)}
              spriteProps={triangleSpriteProps}
            />
          );

          // add lines connected to node
          const lineOffColor = parseColorToNumber(muiTheme.palette.divider);
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
              spriteProps={lineSpriteProps}
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

          // add node with text
          let { name: nodeText, accidental } =
            Utilities.getNoteDetails(chromaticNum);
          if (accidental) nodeText += accidental;
          const noteOnColor = getNoteColorNum(chromaticNum, colorSettings);
          const noteOffColor = parseColorToNumber(muiTheme.palette.divider);
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

      return triangles.concat(lines, nodes);
    };

    return (
      <PixiStageWrapper
        key={`tonnetz-${containerWidth}-${containerHeight}`}
        width={containerWidth}
        height={containerHeight}
        backgroundColor={parseColorToNumber(muiTheme.palette.background.paper)}
      >
        {renderSprites()}
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
    const noteTextStyle = useMemo(() => {
      return new PIXI.TextStyle({
        align: 'center',
        fontFamily: fontFamily,
        strokeThickness: 0.5,
        letterSpacing: 2,
        fontSize: (circleSize * 2.5) / 5,
      });
    }, [circleSize]);
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
          height: notesOn ? 8 : 5,
        }}
      />
    );
  }
);

interface TonnetzTriangleProps {
  channelId: string;
  spriteProps: _ReactPixi.ISprite;
  chromaticNums: [
    ChromaticNoteNumber,
    ChromaticNoteNumber,
    ChromaticNoteNumber
  ]; // the three nodes that the triangle is connected to
  onColor: number;
  offColor: number;
}
const TonnetzTriangle = React.memo(
  ({
    spriteProps,
    channelId,
    chromaticNums,
    onColor,
    offColor,
  }: TonnetzTriangleProps) => {
    const notesOn = useTypedSelector((state) =>
      selectChromaticNotesOn(state, channelId, chromaticNums)
    );
    return (
      <Sprite
        {...spriteProps}
        {...{
          alpha: 0.5,
          tint: notesOn ? onColor : offColor,
        }}
      />
    );
  }
);

export default Tonnetz;
