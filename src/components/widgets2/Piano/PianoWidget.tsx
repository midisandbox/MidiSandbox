import { Container, Sprite, Text, _ReactPixi } from '@inlet/react-pixi';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import useSize from '@react-hook/size';
import * as PIXI from 'pixi.js';
import React, { useMemo } from 'react';
import { useTypedSelector } from '../../../redux/store';
import blackPianoKey from '../../../assets/imgs/blackPianoKey.svg';
import whitePianoKey from '../../../assets/imgs/whitePianoKey.svg';
import whitePianoKeyBordered from '../../../assets/imgs/whitePianoKeyBordered.svg';
import { fontFamily } from '../../../styles/customTheme';
import { getNoteOnColors } from '../../../utils/utils';
import {
  selectNotesOnByChannelId,
  selectNotesPressedByChannelId,
} from '../../../redux/slices/midiListenerSlice';
import PixiStageWrapper from '../../widgets/PixiStageWrapper';
import PianoSettings from './PianoSettings';
// import PixiStageWrapper from '../../widgets/PixiStageWrapper';

const whiteKeyTexture = PIXI.Texture.from(whitePianoKey);
const whiteKeyBorderedTexture = PIXI.Texture.from(whitePianoKeyBordered);
const blackKeyTexture = PIXI.Texture.from(blackPianoKey);

interface PianoProps {
  block: MidiBlockT;
  channelId: string;
  colorSettings: ColorSettingsT;
  containerWidth: number;
  containerHeight: number;
}
const Piano = React.memo(
  ({ block, colorSettings, containerWidth, containerHeight }: PianoProps) => {
    const muiTheme = useTheme();
    const sizeTarget = React.useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [width, height] = useSize(sizeTarget);
    const pianoTextStyle = useMemo(() => {
      let size = 7.5 + block.pianoSettings.keyWidth * 100;
      return new PIXI.TextStyle({
        align: 'center',
        fontFamily: fontFamily,
        fontSize: `${size}px`,
        strokeThickness: 0.5,
        letterSpacing: 2,
      });
    }, [block.pianoSettings.keyWidth]);

    // iterate over the note numbers and compute their position/texture for rendering PianoKeySprite
    const renderKeys = () => {
      let output = [];
      let prevWhiteKeyEnd = 0;
      const whiteKeyWidth = block.pianoSettings.keyWidth * width;
      const blackKeyWidth = whiteKeyWidth * 0.74;
      const accidentalOffset1 = 0.45;
      const accidentalOffset2 = 0.259;
      const accidentalOffset3 = 0.333;
      let noteNum = block.pianoSettings.startNote;
      while (prevWhiteKeyEnd <= containerWidth) {
        const chromaticNum = noteNum % 12;
        let keyWidth,
          keyHeight,
          texture,
          xVal = 0,
          zIndex = 0,
          isBlackKey = false;
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
          const octave = (noteNum - 12) / 12;
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
            channelId={block.channelId}
            noteNum={noteNum}
            isBlackKey={isBlackKey}
            noteOnColors={getNoteOnColors([noteNum], colorSettings, muiTheme)}
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

        noteNum += 1;
      }

      return output;
    };

    return (
      <Box ref={sizeTarget}>
        <PixiStageWrapper
          width={containerWidth}
          height={containerHeight}
          backgroundColor={0x000000}
        >
          <Container sortableChildren>{renderKeys()}</Container>
        </PixiStageWrapper>
      </Box>
    );
  }
);

interface PianoKeySpriteProps {
  channelId: string;
  noteNum: number;
  noteOnColors: NoteOnColors;
  isBlackKey: boolean;
  spriteProps: _ReactPixi.ISprite;
}
function PianoKeySprite({
  channelId,
  noteNum,
  noteOnColors,
  isBlackKey,
  spriteProps,
}: PianoKeySpriteProps) {
  const { pressedColor, sustainedColor } = noteOnColors;
  const noteOn = useTypedSelector((state) =>
    selectNotesOnByChannelId(state, channelId, [noteNum])
  );
  const notePressed = useTypedSelector((state) =>
    selectNotesPressedByChannelId(state, channelId, [noteNum])
  );
  let computedProps = { ...spriteProps };
  if (noteOn) {
    computedProps.tint = notePressed ? pressedColor : sustainedColor;
    if (isBlackKey) {
      computedProps.texture = whiteKeyBorderedTexture;
    }
  } else {
    computedProps.tint = 0xffffff;
    computedProps.texture = spriteProps.texture;
  }

  return <Sprite {...computedProps} />;
}

const exportObj: WidgetModule = {
  name: 'Piano',
  Component: Piano,
  SettingComponent: PianoSettings,
  defaultSettings: {}, // pianoSettings is handled on its own (not using widgetSettings)
  includeBlockSettings: ['Midi Input', 'Color'],
};

export default exportObj;
