import { Stage } from '@inlet/react-pixi';
import React from 'react';
import { Provider as ReduxProvider, ReactReduxContext } from 'react-redux';

interface PixiStageWrapperProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  backgroundColor: number;
}
const PixiStageWrapper = ({
  width,
  height,
  children,
  backgroundColor,
}: PixiStageWrapperProps) => {
  return (
    <ReactReduxContext.Consumer>
      {({ store }) => (
        <Stage
          width={width}
          height={height}
          options={{
            backgroundColor: backgroundColor,
          }}
        >
          <ReduxProvider store={store}>{children}</ReduxProvider>
        </Stage>
      )}
    </ReactReduxContext.Consumer>
  );
};
export default PixiStageWrapper;
