import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, Tooltip } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';
import { Storage } from 'aws-amplify';

import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationDispatch } from '../../../app/hooks';
import { useAppDispatch } from '../../../app/store';
import { SxPropDict } from '../../../types/types';
import FileSelector from '../../drawerContainer/FileSelector';
import { themeModes, updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';
export interface OSMDViewProps {
  blockId: string;
  osmdFile: any;
  channelId: string;
  hover: boolean;
  osmdSettings: OSMDSettingsT;
  colorSettings: ColorSettingsT;
  themeMode: typeof themeModes[number];
}

export function errorLoadingOrRenderingSheet(
  e: Error,
  loadingOrRenderingString: string
) {
  console.warn(
    `Error ${loadingOrRenderingString} sheet: ${e} \nStackTrace: \n${e.stack}`
  );
}

export const useOSMDStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      overflow: 'scroll',
      padding: theme.spacing(2),
      paddingRight: theme.spacing(5),
    },
    osmdButtonCont: {
      position: 'absolute',
      textAlign: 'center',
      display: 'flex',
      bottom: theme.spacing(1),
      left: 0,
      right: 0,
      justifyContent: 'center',
    },
    buttonGroup: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    buttonGroupItem: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      border: '0 !important',
    },
    buttonGroupText: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.secondary.contrastText,
      margin: '0 -2px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  })
);

export const withOSMDFile = (
  WrappedComponent: React.FunctionComponent<OSMDViewProps>
) => {
  const WithOSMDFile = (props: OSMDViewProps) => {
    const { blockId, osmdSettings } = props;
    const [osmdFile, setOsmdFile] = useState<any>(null);
    const notificationDispatch = useNotificationDispatch();

    useEffect(() => {
      if (osmdSettings.selectedFile) {
        Storage.get(osmdSettings.selectedFile.key, {
          level: 'public',
          cacheControl: 'no-cache',
          download: true,
        })
          .then((result) => {
            const reader = new FileReader();
            reader.onload = (res: any) => {
              setOsmdFile(res?.target?.result);
            };
            reader.readAsBinaryString(result.Body as Blob);
          })
          .catch((err) => {
            notificationDispatch(
              `An error occurred while loading your file. Please try refreshing the page or contact support for help.`,
              'error',
              `Storage.get failed! ${err}`,
              8000
            );
          });
      }
    }, [osmdSettings.selectedFile, notificationDispatch]);

    if (osmdFile === null) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            <OSMDFileSelector osmdSettings={osmdSettings} blockId={blockId} />
          </Box>
        </Box>
      );
    }
    return <WrappedComponent {...props} osmdFile={osmdFile} />;
  };
  return WithOSMDFile;
};

interface OSMDBlockButtonsProps {
  styles: SxPropDict;
  block: MidiBlockT;
}
export const OSMDBlockButtons = React.memo(
  ({ styles, block }: OSMDBlockButtonsProps) => {
    const dispatch = useAppDispatch();
    const onRefreshClick = () => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            osmdSettings: {
              ...block.osmdSettings,
              rerenderId: uuidv4(),
            },
          },
        })
      );
    };
    return (
      <Tooltip arrow title="Refresh" placement="left">
        <Button
          color="primary"
          variant="contained"
          sx={styles.block_icon}
          onClick={onRefreshClick}
          aria-label="refresh"
        >
          <RefreshOutlinedIcon />
        </Button>
      </Tooltip>
    );
  }
);

export const OSMDFileSelector = ({
  blockId,
  osmdSettings,
}: {
  blockId: string;
  osmdSettings: OSMDSettingsT;
}) => {
  const dispatch = useAppDispatch();
  return (
    <FileSelector
      selectLabel="Select MusicXML File"
      folder="mxl"
      blockId={blockId}
      onSelectChange={(value) => {
        if (!Array.isArray(value)) {
          dispatch(
            updateOneMidiBlock({
              id: blockId,
              changes: {
                osmdSettings: {
                  ...osmdSettings,
                  selectedFile: value,
                },
              },
            })
          );
        }
      }}
      selectValue={
        osmdSettings.selectedFile ? osmdSettings.selectedFile.key : ''
      }
    />
  );
};
