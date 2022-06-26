import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Storage } from 'aws-amplify';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useNotificationDispatch } from '../../../app/hooks';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../assets/styles/styleHooks';
import { OSMDSettingsT } from '../../../utils/helpers';
import {
  addUploadedFile,
  removeOneUploadedFile,
  selectAllMxlFiles,
  UploadedFileT,
} from '../../fileUpload/fileUploadSlice';
import { updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';
import useAuth from '../../userAuth/amplifyUtils';
import DotsSvg from '../../utilComponents/DotSvg';

interface OSMDFileSelectorProps {
  blockId: string;
  osmdSettings: OSMDSettingsT;
}
function OSMDFileSelector({ blockId, osmdSettings }: OSMDFileSelectorProps) {
  const muiTheme = useTheme();
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const { currentUser } = useAuth();
  const xmlFiles = useTypedSelector(selectAllMxlFiles);
  const deleteButtonWidth = 45;
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (currentUser) {
        setIsLoading(true);
        const uploadFile = acceptedFiles[0];
        const fileKey = `${currentUser.getUsername()}/mxl/${uuidv4()}/${
          uploadFile.name
        }`;
        Storage.put(fileKey, uploadFile)
          .then((result) => {
            dispatch(
              addUploadedFile({
                blockId: blockId,
                uploadedFile: {
                  key: result.key,
                  filename: uploadFile.name,
                  folder: 'mxl',
                  lastModified: Date.now(),
                },
              })
            );
            setIsLoading(false);
          })
          .catch((err) => {
            notificationDispatch(
              `An error occurred while uploading your file. Please try refreshing the page or contact support for help.`,
              'error',
              `Storage.put failed! ${JSON.stringify(err)}`,
              8000
            );
            setIsLoading(false);
          });
      }
    },
    [currentUser, notificationDispatch, blockId, dispatch]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleFileSelectChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    if (value !== '') {
      dispatch(
        updateOneMidiBlock({
          id: blockId,
          changes: {
            osmdSettings: {
              ...osmdSettings,
              selectedFileKey: value,
            },
          },
        })
      );
      handleClose();
    }
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
      Storage.remove(file.key)
        .then((result) => {
          dispatch(removeOneUploadedFile(file.key));
        })
        .catch((err) =>
          notificationDispatch(
            `An error occurred while deleting ${file.filename}. Please try refreshing the page or contact support for help.`,
            'error',
            `Storage.remove failed! ${JSON.stringify(err)}`,
            8000
          )
        );
    };

  function renderValue(option: string | null) {
    const fileOption = xmlFiles.find((x) => x.key === option);
    if (isLoading)
      return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <DotsSvg
            animate={true}
            color={muiTheme.palette.secondary.main}
            width={50}
          />
        </Box>
      );
    return <span>{fileOption?.filename}</span>;
  }

  if (!currentUser) {
    return (
      <Box>
        Please{' '}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Typography
            color="primary"
            sx={{ display: 'inline-block', textDecoration: 'underline' }}
          >
            login
          </Typography>
        </Link>{' '}
        to upload your own files.
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '320px', margin: 'auto' }}>
      <FormControl className={classes.select} size="small" fullWidth>
        <InputLabel id="select-musicXML-label">Select MusicXML File</InputLabel>
        <Select
          displayEmpty
          labelId="select-musicXML-label"
          id="select-musicXML-select"
          value={osmdSettings.selectedFileKey}
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
          <MenuItem id="upload-file-menu-item" value={''} sx={{ padding: 0 }}>
            <Box sx={{ pt: 1.5, pb: 1.5, pl: 4, pr: 4 }} {...getRootProps()}>
              <input {...getInputProps()} />
              Upload New File
            </Box>
          </MenuItem>
          {xmlFiles.map((file) => (
            <MenuItem
              key={file.key}
              value={file.key}
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
    </Box>
  );
}

export default OSMDFileSelector;
