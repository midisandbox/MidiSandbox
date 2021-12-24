import { Sprite, _ReactPixi } from '@inlet/react-pixi';
import React from 'react';
import { useTypedSelector } from '../../../app/store';
import { selectNoteOnByChannelId } from '../../midiListener/midiNoteSlice';

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
}
const StaffNote = React.memo(
  ({
    noteSpriteProps,
    staffLineSpriteProps,
    sharpSpriteProps,
    flatSpriteProps,
    naturalSpriteProps,
    noteNum,
    channelId,
    yValue,
    yAxisNoteStep,
  }: StaffNoteProps) => {
    const noteOn = useTypedSelector((state) =>
      selectNoteOnByChannelId(state, channelId, noteNum)
    );
    const alpha = noteOn ? 1 : 0;

    // add staff lines depending on the note's position in the grand staff
    const staffLines: JSX.Element[] = [];
    if (yValue === 1) {
      // add line for middle C
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
  }
);

export default StaffNote;
