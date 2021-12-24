import { Container, Sprite, _ReactPixi } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import React from 'react';
import { useTypedSelector } from '../../../app/store';
import accidentalFlat from '../../../assets/imgs/accidentalFlat.svg';
import accidentalSharp from '../../../assets/imgs/accidentalSharp.svg';
import clefBass from '../../../assets/imgs/clefBass.svg';
import clefTreble from '../../../assets/imgs/clefTreble.svg';
import grandStaff from '../../../assets/imgs/grandStaff.svg';
import natural from '../../../assets/imgs/natural.svg';
import staffLine from '../../../assets/imgs/staffLine.svg';
import wholeNote from '../../../assets/imgs/wholeNote.svg';
import {
  keyToNoteMap,
  noteNameToNum,
  parseColorToNumber,
} from '../../../utils/helpers';
import { StaffSettingsT } from '../../midiBlock/midiBlockSlice';
import {
  KeyOption,
  selectChannelKey,
} from '../../midiListener/midiChannelSlice';
import { selectNoteOnByChannelId } from '../../midiListener/midiNoteSlice';
import PixiStageWrapper from '../PixiStageWrapper';
import KeySignature from './KeySignature';

const accidentalFlatTexture = PIXI.Texture.from(accidentalFlat);
const accidentalSharpTexture = PIXI.Texture.from(accidentalSharp);
const clefBassTexture = PIXI.Texture.from(clefBass);
const clefTrebleTexture = PIXI.Texture.from(clefTreble);
const naturalTexture = PIXI.Texture.from(natural);
const wholeNoteTexture = PIXI.Texture.from(wholeNote);
const staffLineTexture = PIXI.Texture.from(staffLine);
const grandStaffTexture = PIXI.Texture.from(grandStaff);

interface StaffProps {
  channelId: string;
  staffSettings: StaffSettingsT;
  containerWidth: number;
  containerHeight: number;
}
const Staff = React.memo(
  ({
    channelId,
    staffSettings,
    containerWidth,
    containerHeight,
  }: StaffProps) => {
    const staffWidth = containerWidth * 0.75;
    const staffHeight = staffWidth * 0.7561;
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
    };
    const sharpSpriteProps: _ReactPixi.ISprite = {
      width: sharpWidth,
      height: sharpHeight,
      texture: accidentalSharpTexture,
      anchor: [0.5, 0.5],
    };
    const selectedKey = useTypedSelector((state) =>
      selectChannelKey(state, channelId)
    );

    const renderNotes = () => {
      let notes: JSX.Element[] = [];
      for (let i = 12; i < 84; i++) {
        const keyUsesSharps = ['C', 'G', 'D', 'A', 'E', 'B', 'F#'].includes(
          selectedKey
        );
        const noteInKey = keyToNoteMap[noteNameToNum[selectedKey]].includes(
          i % 12
        );
        let showFlat = false;
        let showSharp = false;
        let showNatural = false;

        // determine y position of note. note 48 is middle C
        let chromaticY = 0;
        // C
        if (i % 12 === 0) {
          chromaticY = 0;
          if (!noteInKey) showNatural = true;
        }
        // C#/Db
        else if (i % 12 === 1) {
          if (keyUsesSharps) {
            chromaticY = 0;
            if (!noteInKey) showSharp = true;
          } else {
            chromaticY = 1;
            if (!noteInKey) showFlat = true;
          }
        }
        // D
        else if (i % 12 === 2) {
          chromaticY = 1;
          if (!noteInKey) showNatural = true;
        }
        // D#/Eb
        else if (i % 12 === 3) {
          if (keyUsesSharps) {
            chromaticY = 1;
            if (!noteInKey) showSharp = true;
          } else {
            chromaticY = 2;
            if (!noteInKey) showFlat = true;
          }
        }
        // E
        else if (i % 12 === 4) {
          chromaticY = 2;
          if (!noteInKey) showNatural = true;
        }
        // F
        else if (i % 12 === 5) {
          chromaticY = 3;
          if (!noteInKey) showNatural = true;
        }
        // F#/Gb
        else if (i % 12 === 6) {
          if (keyUsesSharps) {
            chromaticY = 3;
            if (!noteInKey) showSharp = true;
          } else {
            chromaticY = 4;
            if (!noteInKey) showFlat = true;
          }
        }
        // G
        else if (i % 12 === 7) {
          chromaticY = 4;
          if (!noteInKey) showNatural = true;
        }
        // G#/Ab
        else if (i % 12 === 8) {
          if (keyUsesSharps) {
            chromaticY = 4;
            if (!noteInKey) showSharp = true;
          } else {
            chromaticY = 5;
            if (!noteInKey) showFlat = true;
          }
        }
        // A
        else if (i % 12 === 9) {
          chromaticY = 5;
          if (!noteInKey) showNatural = true;
        }
        // A#/Bb
        else if (i % 12 === 10) {
          if (keyUsesSharps) {
            chromaticY = 5;
            if (!noteInKey) showSharp = true;
          } else {
            chromaticY = 6;
            if (!noteInKey) showFlat = true;
          }
        }
        // A
        else if (i % 12 === 11) {
          chromaticY = 6;
          if (!noteInKey) showNatural = true;
        }
        const octaveOffset = (Math.floor(i / 12) - Math.floor(48 / 12)) * 7;
        const yValue = -chromaticY - octaveOffset + 1;
        const notePosition = [4 * sharpWidth, yValue * yAxisNoteStep] as [
          number,
          number
        ];

        notes.push(
          <StaffNote
            key={`staff-note-${i}`}
            selectedKey={selectedKey}
            noteNum={i}
            channelId={channelId}
            yValue={yValue}
            yAxisNoteStep={yAxisNoteStep}
            noteInKey={noteInKey}
            noteSpriteProps={{
              width: noteWidth,
              height: noteHeight,
              texture: wholeNoteTexture,
              position: notePosition,
              anchor: [0.5, 0.5],
            }}
            staffLineSpriteProps={{
              width: staffLineWidth,
              height: staffLineHeight,
              texture: staffLineTexture,
              anchor: [0.5, 0.5],
            }}
            sharpSpriteProps={
              !showSharp
                ? null
                : {
                    width: sharpWidth,
                    height: sharpHeight,
                    texture: accidentalSharpTexture,
                    position: [
                      notePosition[0] + -sharpWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                  }
            }
            flatSpriteProps={
              !showFlat
                ? null
                : {
                    width: flatWidth,
                    height: flatHeight,
                    texture: accidentalFlatTexture,
                    position: [
                      notePosition[0] + -flatWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                  }
            }
            naturalSpriteProps={
              !showNatural
                ? null
                : {
                    width: naturalWidth,
                    height: naturalHeight,
                    texture: naturalTexture,
                    position: [
                      notePosition[0] + -naturalWidth / 1.5 - noteWidth / 2,
                      notePosition[1],
                    ],
                    anchor: [0.5, 0.5],
                  }
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
        backgroundColor={parseColorToNumber('#ffffff')}
      >
        <Container position={[containerWidth / 2, containerHeight / 2]}>
          <Sprite
            width={staffWidth}
            height={staffHeight}
            anchor={[0.5, 0.5]}
            texture={grandStaffTexture}
          ></Sprite>
          <KeySignature
            channelId={channelId}
            selectedKey={selectedKey}
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

interface StaffNoteProps {
  noteSpriteProps: Omit<_ReactPixi.ISprite, 'position'> & {
    position: [number, number];
  };
  staffLineSpriteProps: _ReactPixi.ISprite;
  sharpSpriteProps: null | _ReactPixi.ISprite;
  flatSpriteProps: null | _ReactPixi.ISprite;
  naturalSpriteProps: null | _ReactPixi.ISprite;
  noteNum: number;
  channelId: string;
  yValue: number;
  yAxisNoteStep: number;
  selectedKey: KeyOption;
  noteInKey: boolean;
}
const StaffNote = ({
  noteSpriteProps,
  staffLineSpriteProps,
  sharpSpriteProps,
  flatSpriteProps,
  naturalSpriteProps,
  noteNum,
  channelId,
  yValue,
  yAxisNoteStep,
  selectedKey,
  noteInKey,
}: StaffNoteProps) => {
  const noteOn = useTypedSelector((state) =>
    selectNoteOnByChannelId(state, channelId, noteNum)
  );
  const alpha = noteOn ? 1 : 0;
  const staffLines: JSX.Element[] = [];
  if (yValue === 1) {
    staffLines.push(
      <Sprite
        key={`middle-staff-line`}
        {...staffLineSpriteProps}
        position={noteSpriteProps.position}
        alpha={alpha}
      />
    );
  } else if (yValue <= -11) {
    for (let i = -11; i >= yValue; i -= 2) {
      staffLines.push(
        <Sprite
          key={`${i}-staff-line`}
          {...staffLineSpriteProps}
          position={[noteSpriteProps.position[0], i * yAxisNoteStep]}
          alpha={alpha}
        />
      );
    }
  } else if (yValue >= 13) {
    for (let i = 13; i <= yValue; i += 2) {
      staffLines.push(
        <Sprite
          key={`${i}-staff-line`}
          {...staffLineSpriteProps}
          position={[noteSpriteProps.position[0], i * yAxisNoteStep]}
          alpha={alpha}
        />
      );
    }
  }

  return (
    <>
      <Sprite {...noteSpriteProps} alpha={alpha} />
      {staffLines}
      {sharpSpriteProps && <Sprite {...sharpSpriteProps} alpha={alpha} />}
      {flatSpriteProps && <Sprite {...flatSpriteProps} alpha={alpha} />}
      {naturalSpriteProps && <Sprite {...naturalSpriteProps} alpha={alpha} />}
    </>
  );
};

export default Staff;
