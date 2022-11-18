import { Stage } from '@inlet/react-pixi';
import { Box } from '@mui/system';
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
        <>
          {/* add this box to cover the pixi stage and enable touch events for scrolling */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          ></Box>
          <Stage
            key={`pixi-state-${backgroundColor}`}
            width={width}
            height={height}
            options={{
              backgroundColor: backgroundColor,
            }}
          >
            <ReduxProvider store={store}>{children}</ReduxProvider>
          </Stage>
        </>
      )}
    </ReactReduxContext.Consumer>
  );
};
export default PixiStageWrapper;
