import { Box } from '@mui/system';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import React, { useEffect, useRef, useState } from 'react';

import alvinRow from '../../temp/Alvin-Row.mxl';
import { OSMDSettingsT, BlockTheme } from '../../utils/helpers';
import { useTheme } from '@mui/material/styles';
// alvin row
// https://drive.google.com/uc?id=1zRm6Qc3s2MOk-TlEByOJUGBeijw4aV9-&export=download

interface OSMDViewProps {
  containerWidth: number;
  containerHeight: number;
  osmdSettings: OSMDSettingsT;
  blockTheme: BlockTheme;
}
const OSMDView = React.memo(
  ({
    containerWidth,
    containerHeight,
    osmdSettings,
    blockTheme,
  }: OSMDViewProps) => {
    const muiTheme = useTheme();
    const osmd = useRef<OSMD>();
    const [osmdLoadingState, setOsmdLoadingState] = useState<
      'uninitiated' | 'loading' | 'complete'
    >('uninitiated');
    const backgroundColor =
      blockTheme === 'Light'
        ? muiTheme.custom.lightBackground
        : muiTheme.custom.darkBackground;
    const textColor =
      blockTheme === 'Light'
        ? muiTheme.custom.lightText
        : muiTheme.custom.darkText;

    useEffect(() => {
      setOsmdLoadingState('loading');
      osmd.current = new OSMD('osmd-container', {
        autoResize: false,
        backend: 'svg', // 'svg' or 'canvas'. NOTE: renderSingleHorizontalStaffline is currently not working with 'canvas'
        drawingParameters: 'compacttight', // more compact spacing, less padding
        defaultColorMusic: textColor,
        colorStemsLikeNoteheads: true,
        drawTitle: osmdSettings.drawTitle, // included in "compacttight"
        renderSingleHorizontalStaffline: osmdSettings.horizontalStaff,
      });
      osmd.current.EngravingRules.PageBackgroundColor = backgroundColor;
      osmd.current.load(alvinRow).then((result) => {
        setOsmdLoadingState('complete');
      });
    }, [
      osmdSettings.horizontalStaff,
      osmdSettings.drawTitle,
      backgroundColor,
      textColor,
    ]);
    const osmdDependencies = [
      osmdSettings.horizontalStaff,
      osmdSettings.drawTitle,
      backgroundColor,
      textColor,
    ];

    // rerender on container size change
    useEffect(() => {
      if (osmdLoadingState === 'complete' && osmd && osmd.current) {
        if (osmd.current.IsReadyToRender()) {
          osmd.current.zoom = osmdSettings.zoom;
          osmd.current.render();
        } else {
          console.error('OSMD tried to render() but it is not ready!');
        }
      }
    }, [osmdLoadingState, containerWidth, containerHeight, osmdSettings.zoom]);

    // const rerenderOsmd = () => {
    //   if (osmd && osmd.current) {
    //     osmd.current.render();
    //   }
    // };

    return (
      <Box
        sx={{
          height: '100%',
          backgroundColor: backgroundColor,
          overflow: 'scroll',
          pt: 2,
          pl: 2,
        }}
      >
        {/* <button onClick={rerenderOsmd}>rerender</button> */}
        <div
          id="osmd-container"
          key={`osmd-container-${osmdDependencies.join('-')}`}
        />
      </Box>
    );
  }
);

export default OSMDView;
