import { Container, Sprite, _ReactPixi } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useTypedSelector } from '../../../redux/store';
import accidentalFlat from '../../../assets/imgs/accidentalFlatWhite.svg';
import accidentalSharp from '../../../assets/imgs/accidentalSharpWhite.svg';
import grandStaff from '../../../assets/imgs/grandStaffWhite.svg';
import natural from '../../../assets/imgs/naturalWhite.svg';
import staffLine from '../../../assets/imgs/staffLineWhite.svg';
import wholeNote from '../../../assets/imgs/wholeNoteWhite.svg';
import { useTheme } from '@mui/material/styles';
import {
  majorKeyToChromaticNotesMap,
  noteNameToChromaticNum,
  parseColorToNumber,
} from '../../../utils/utils';
import PixiStageWrapper from '../../utilComponents/PixiStageWrapper';
import KeySignature from './KeySignature';
import StaffNote from './StaffNote';
import { selectGlobalSettings } from '../../../redux/slices/globalSettingsSlice';
import GrandStaffSettings from './GrandStaffSettings';

const accidentalFlatTexture = PIXI.Texture.from(accidentalFlat);
const accidentalSharpTexture = PIXI.Texture.from(accidentalSharp);
const naturalTexture = PIXI.Texture.from(natural);
const wholeNoteTexture = PIXI.Texture.from(wholeNote);
const staffLineTexture = PIXI.Texture.from(staffLine);
const grandStaffTexture = PIXI.Texture.from(grandStaff);

interface GrandStaffProps {
  block: MidiBlockT;
  containerWidth: number;
  containerHeight: number;
}
const GrandStaff = React.memo(
  ({ block, containerWidth, containerHeight }: GrandStaffProps) => {
    const { channelId, staffSettings } = block;
    const muiTheme = useTheme();
    const staffTint = parseColorToNumber(muiTheme.palette.text.primary);
    let staffHeight = (containerHeight * 0.6) / staffSettings.verticalSpacing;
    let staffWidth = staffHeight * 1.3226;
    const maxWidth = containerWidth * 0.95;
    if (staffWidth > maxWidth) {
      staffWidth = maxWidth;
      staffHeight = staffWidth * 0.7561;
    }

    const noteWidth = staffWidth * 0.0935;
    const noteHeight = noteWidth * 0.594;
    const flatWidth = staffWidth * 0.0393;
    const flatHeight = flatWidth * 3;
    const sharpWidth = staffWidth * 0.042;
    const sharpHeight = sharpWidth * 2.355;
    const naturalWidth = staffWidth * 0.0298;
    const naturalHeight = naturalWidth * 3.727;
    const staffLineWidth = staffWidth * 0.1314;
    const staffLineHeight = staffLineWidth * 0.0516;
    const yAxisNoteStep = (staffHeight * 0.089606) / 2;
    const flatSpriteProps: _ReactPixi.ISprite = {
      width: flatWidth,
      height: flatHeight,
      texture: accidentalFlatTexture,
      anchor: [0.5, 0.45],
      tint: staffTint,
    };
    const sharpSpriteProps: _ReactPixi.ISprite = {
      width: sharpWidth,
      height: sharpHeight,
      texture: accidentalSharpTexture,
      anchor: [0.5, 0.5],
      tint: staffTint,
    };
    const { globalKeySignature } = useTypedSelector(selectGlobalSettings);

    const renderNotes = () => {
      let notes: JSX.Element[] = [];
      for (let i = 12; i < 108; i++) {
        const chromaticNoteNum = i % 12;
        const keyUsesSharps = ['C', 'G', 'D', 'A', 'E', 'B', 'F#'].includes(
          globalKeySignature
        );
        const noteInKey =
          majorKeyToChromaticNotesMap[
            noteNameToChromaticNum[globalKeySignature as NoteName]
          ].includes(chromaticNoteNum);
        let showFlat = false;
        let showSharp = false;
        let showNatural = false;

        // determine y position of note
        let chromaticY = 0;
        // white keys
        if ([0, 2, 4, 5, 7, 9, 11].includes(chromaticNoteNum)) {
          if (!noteInKey) showNatural = true;
          if (chromaticNoteNum === 0) chromaticY = 0;
          // C
          else if (chromaticNoteNum === 2) chromaticY = 1;
          // D
          else if (chromaticNoteNum === 4) chromaticY = 2;
          // E
          else if (chromaticNoteNum === 5) chromaticY = 3;
          // F
          else if (chromaticNoteNum === 7) chromaticY = 4;
          // G
          else if (chromaticNoteNum === 9) chromaticY = 5;
          // A
          else if (chromaticNoteNum === 11) chromaticY = 6; // B
        }
        // black keys
        else {
          if (keyUsesSharps) {
            if (!noteInKey) showSharp = true;
            if (chromaticNoteNum === 1) chromaticY = 0;
            // C#/Db
            else if (chromaticNoteNum === 3) chromaticY = 1;
            // D#/Eb
            else if (chromaticNoteNum === 6) chromaticY = 3;
            // F#/Gb
            else if (chromaticNoteNum === 8) chromaticY = 4;
            // G#/Ab
            else if (chromaticNoteNum === 10) chromaticY = 5; // A#/Bb
          } else {
            if (!noteInKey) showFlat = true;
            if (chromaticNoteNum === 1) chromaticY = 1;
            // C#/Db
            else if (chromaticNoteNum === 3) chromaticY = 2;
            // D#/Eb
            else if (chromaticNoteNum === 6) chromaticY = 4;
            // F#/Gb
            else if (chromaticNoteNum === 8) chromaticY = 5;
            // G#/Ab
            else if (chromaticNoteNum === 10) chromaticY = 6; // A#/Bb
          }
        }
        const octaveOffset =
          (Math.floor((i - 12) / 12) - Math.floor(48 / 12)) * 7;
        const yValue = -chromaticY - octaveOffset + 1;
        const notePosition = [4 * sharpWidth, yValue * yAxisNoteStep] as [
          number,
          number
        ];

        notes.push(
          <StaffNote
            key={`staff-note-${i}`}
            noteNum={i}
            channelId={channelId}
            yValue={yValue}
            yAxisNoteStep={yAxisNoteStep}
            noteSpriteProps={{
              width: noteWidth,
              height: noteHeight,
              texture: wholeNoteTexture,
              position: notePosition,
              anchor: [0.5, 0.5],
              tint: staffTint,
            }}
            staffLineSpriteProps={{
              width: staffLineWidth,
              height: staffLineHeight,
              texture: staffLineTexture,
              anchor: [0.5, 0.5],
              tint: staffTint,
            }}
            sharpSpriteProps={
              showSharp
                ? {
                    width: sharpWidth,
                    height: sharpHeight,
                    texture: accidentalSharpTexture,
                    position: [
                      notePosition[0] - sharpWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                    tint: staffTint,
                  }
                : null
            }
            flatSpriteProps={
              showFlat
                ? {
                    width: flatWidth,
                    height: flatHeight,
                    texture: accidentalFlatTexture,
                    position: [
                      notePosition[0] - flatWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                    tint: staffTint,
                  }
                : null
            }
            naturalSpriteProps={
              showNatural
                ? {
                    width: naturalWidth,
                    height: naturalHeight,
                    texture: naturalTexture,
                    position: [
                      notePosition[0] - naturalWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                    tint: staffTint,
                  }
                : null
            }
          />
        );
      }
      return notes;
    };

    return (
      <PixiStageWrapper
        width={containerWidth}
        height={containerHeight}
        backgroundColor={parseColorToNumber(muiTheme.palette.background.paper)}
      >
        <Container position={[containerWidth / 2, containerHeight / 2]}>
          <Sprite
            width={staffWidth}
            height={staffHeight}
            anchor={[0.5, 0.5]}
            texture={grandStaffTexture}
            tint={staffTint}
          ></Sprite>
          <KeySignature
            channelId={channelId}
            selectedKey={globalKeySignature}
            flatSpriteProps={flatSpriteProps}
            sharpSpriteProps={sharpSpriteProps}
            staffWidth={staffWidth}
            yAxisNoteStep={yAxisNoteStep}
            flatWidth={flatWidth}
            sharpWidth={sharpWidth}
          />
          {renderNotes()}
        </Container>
      </PixiStageWrapper>
    );
  }
);
const exportObj: WidgetModule = {
  name: 'Grand Staff',
  Component: GrandStaff,
  SettingComponent: GrandStaffSettings,
  ButtonsComponent: null,
  defaultSettings: {}, // pianoSettings is handled on its own (not using widgetSettings)
  includeBlockSettings: ['Midi Input', 'Block Theme'],
  orderWeight: 5, // used to determine the ordering of the options in the Widget selector
};

export default exportObj;
