import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { asUploadButton } from '@rpldy/upload-button';
import Uploady, { BatchItem, UPLOADER_EVENTS } from '@rpldy/uploady';
import React, { useMemo, useState } from 'react';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../assets/styles/styleHooks';
import {
  formatBytes,
  OSMDSettingsT,
  REMOTE_FOLDER,
} from '../../../utils/helpers';
import { useDeleteSheetMusicMutation } from '../../api/apiSlice';
import {
  selectAllSheetMusicFiles,
  UploadedFileT,
  uploadSheetMusicFile,
} from '../../fileUpload/fileUploadSlice';
import { updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';

interface OSMDFileSelectorProps {
  blockId: string;
  osmdSettings: OSMDSettingsT;
}
function OSMDFileSelector({ blockId, osmdSettings }: OSMDFileSelectorProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const sheetMusicFiles = useTypedSelector(selectAllSheetMusicFiles);
  const [deleteSheetMusic] = useDeleteSheetMusicMutation();
  const deleteButtonWidth = 45;
  const [uploadError, setUploadError] = useState('');

  const handleFileSelectChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    if (value !== '') {
      dispatch(
        updateOneMidiBlock({
          id: blockId,
          changes: {
            osmdSettings: {
              ...osmdSettings,
              selectedFileId: value,
            },
          },
        })
      );
      handleClose();
    }
  };

  // uploady
  const uploadyDestination = {
    url: `${process.env.REACT_APP_API_BASE_URL}/${REMOTE_FOLDER.SHEET_MUSIC}`,
  };
  const uploadyListeners = useMemo(
    () => ({
      [UPLOADER_EVENTS.ITEM_FINISH]: (item: BatchItem) => {
        if (item.uploadResponse.data.status === 1000) {
          const { filename, uuidFilename } = item.uploadResponse.data.result;
          dispatch(
            uploadSheetMusicFile({
              uploadedFile: {
                filename,
                uuidFilename,
                folder: REMOTE_FOLDER.SHEET_MUSIC,
              },
              blockId: blockId,
            })
          );
          handleClose();
        } else {
          console.error(
            'Upload response did not return success status!',
            item.uploadResponse
          );
          if (item.uploadResponse.data.status === 4013) {
            setTempError(
              `File size must be less than ${formatBytes(
                item.uploadResponse.data.result
              )}`
            );
          } else {
            setTempError(
              `Error uploading file, please make sure it is valid MusicXML.`
            );
          }
        }
      },
    }),
    [dispatch, blockId]
  );

  const setTempError = (msg: string) => {
    setUploadError(msg);
    setTimeout(() => {
      setUploadError('');
    }, 3000);
  };

  // handle menu open/close
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const deleteFile =
    (file: UploadedFileT) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation();
      deleteSheetMusic(file.uuidFilename);
    };

  function renderValue(option: string | null) {
    const fileOption = sheetMusicFiles.find((x) => x.uuidFilename === option);
    return <span>{fileOption?.filename}</span>;
  }
  return (
    <>
      {uploadError && (
        <Alert
          severity="error"
          sx={{ zIndex: 2, position: 'fixed', top: 0 }}
          onClose={() => setUploadError('')}
        >
          {uploadError}
        </Alert>
      )}
      <FormControl className={classes.select} size="small" fullWidth>
        <InputLabel id="select-musicXML-label">Select MusicXML File</InputLabel>
        <Select
          labelId="select-musicXML-label"
          id="select-musicXML-select"
          value={osmdSettings.selectedFileId}
          label="Select MusicXML File"
          onChange={handleFileSelectChange}
          open={open}
          renderValue={renderValue}
          onClose={(e: any) => {
            const className = e.target?.className;
            if (
              className &&
              className.includes &&
              className.includes('MuiBackdrop')
            ) {
              handleClose();
            }
          }}
          onOpen={handleOpen}
          MenuProps={blockSettingMenuProps}
        >
          <MenuItem id="upload-file-menu-item" value={''}>
            <Uploady
              listeners={uploadyListeners}
              destination={uploadyDestination}
            >
              <DivUploadButton />
            </Uploady>
          </MenuItem>
          {sheetMusicFiles.map((file) => (
            <MenuItem
              key={file.uuidFilename}
              value={file.uuidFilename}
              sx={{
                whiteSpace: 'normal',
                marginRight: `${deleteButtonWidth}px`,
                position: 'relative',
              }}
            >
              <Box>{file.filename}</Box>
              <IconButton
                color="error"
                aria-label="delete file"
                component="span"
                onClick={deleteFile(file)}
                sx={{
                  position: 'absolute',
                  right: `-${deleteButtonWidth}px`,
                  borderRadius: 0,
                  height: '100%',
                  width: `${deleteButtonWidth}px`,
                }}
              >
                <DeleteIcon />
              </IconButton>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

const DivUploadButton = asUploadButton((props: any) => {
  return (
    <Box {...props} sx={{ color: 'primary.main' }}>
      Upload New MusicXML
    </Box>
  );
});

export default OSMDFileSelector;
