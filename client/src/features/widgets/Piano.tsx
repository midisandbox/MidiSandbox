import { Graphics, Stage } from '@inlet/react-pixi';
import React, { useCallback } from 'react';
import { useTypedSelector } from '../../app/store';
import { GraphicsT } from '../../utils/types';
import { selectNotesByBlockId } from '../midiListener/midiNoteSlice';
import { useTheme } from '@mui/material/styles';
import { convertHexColorToNumber, noteNumbers } from '../../utils/helpers';

export interface PianoProps {
  blockId: string;
  containerWidth: number;
  containerHeight: number;
}
// TODO:
// select individual notes from redux inside Rectangle component
// create a Graphics template? see The Geometry List - https://pixijs.io/guides/basics/graphics.html
const Piano = React.memo(
  ({ blockId, containerWidth, containerHeight }: PianoProps) => {
    const muiTheme = useTheme();
    // const notes = useTypedSelector((state) =>
    //   selectNotesByBlockId(state, blockId)
    // );
    return (
      <Stage
        width={containerWidth}
        height={containerHeight}
        options={{
          backgroundColor: convertHexColorToNumber(
            muiTheme.palette.background.paper
          ),
        }}
      >
        {noteNumbers.map((num) => (
          <Rectangle
            key={`note-${num}`}
            color={num % 2 === 0 ? 0x000000 : 0xffffff}
            x={num * (containerWidth / 127)}
            y={0}
            width={containerWidth / 127}
            height={containerHeight}
          />
        ))}
      </Stage>
    );
  }
);

export interface RectangleProps {
  color: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
function Rectangle({ color, x, y, width, height }: RectangleProps) {
  const draw = useCallback(
    (g: GraphicsT) => {
      g.clear();
      g.beginFill(color);
      g.drawRect(x, y, width, height);
      g.endFill();
    },
    [color, x, y, width, height]
  );

  return <Graphics draw={draw} />;
}

export default Piano;
