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
import { useNotificationDispatch } from '../../app/hooks';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../assets/styles/styleHooks';
import {
  addUploadedFile,
  BucketFolder,
  removeOneUploadedFile,
  selectFilesInFolder,
} from '../fileUpload/fileUploadSlice';
import useAuth from '../userAuth/amplifyUtils';
import DotsSvg from '../utilComponents/DotSvg';
import FileUploadIcon from '@mui/icons-material/FileUpload';
interface FileSelectorProps {
  selectLabel: string;
  blockId: string;
  folder: BucketFolder;
  onSelectChange: (value: UploadedFileT | UploadedFileT[] | null) => void;
  selectValue?: string;
  multiSelectValue?: string[];
  multi?: boolean;
}
function FileSelector({
  selectLabel,
  blockId,
  folder,
  onSelectChange,
  selectValue = '',
  multiSelectValue = [],
  multi = false,
}: FileSelectorProps) {
  const muiTheme = useTheme();
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const { currentUser } = useAuth();
  const fileList = useTypedSelector((state) =>
    selectFilesInFolder(state, folder)
  );
  const deleteButtonWidth = 45;
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      if (currentUser) {
        setIsLoading(true);
        const uploadFile = acceptedFiles[0];
        const fileKey = `${currentUser.getUsername()}/${folder}/${uuidv4()}/${
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
                  folder: folder,
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
    [currentUser, notificationDispatch, blockId, dispatch, folder]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleFileSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const value = e.target.value;
    if (value === '') return;
    let newFileValue: UploadedFileT | UploadedFileT[] | null = null;
    if (Array.isArray(value)) {
      newFileValue = fileList.filter((x) => value.includes(x.key));
    } else {
      let foundFile = fileList.find((x) => x.key === value);
      if (foundFile) newFileValue = foundFile;
    }
    onSelectChange(newFileValue);
    if (!multi) {
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

  function renderValue(option: string | string[] | null) {
    if (isLoading) {
      return (
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <DotsSvg
            animate={true}
            color={muiTheme.palette.secondary.main}
            width={50}
          />
        </Box>
      );
    }

    if (typeof option === 'string') {
      const fileOption = fileList.find((x) => x.key === option);
      return fileOption?.filename;
    } else if (Array.isArray(option)) {
      const fileOptions: string[] = [];
      fileList.forEach((x) => {
        if (option.includes(x.key)) fileOptions.push(x.filename);
      });
      return fileOptions.join(', ');
    } else return '';
  }

  if (!currentUser) {
    return (
      <Box sx={{ color: muiTheme.palette.text.primary }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {multi && (
          <IconButton
            color="primary"
            sx={{ height: '100%', mr: 2, borderRadius: '50%', mt: 3 }}
            {...getRootProps()}
          >
            <Box sx={{ display: 'flex' }}>
              <input {...getInputProps()} />
              <FileUploadIcon />
            </Box>
          </IconButton>
        )}
        <FormControl
          sx={{ textAlign: 'left', margin: 0 }}
          className={classes.select}
          size="small"
          fullWidth
        >
          <InputLabel id={`select-file-label-${blockId}`}>
            {selectLabel}
          </InputLabel>
          <Select
            displayEmpty
            labelId={`select-file-label-${blockId}`}
            id={`select-file-select-${blockId}`}
            multiple={multi}
            value={multi ? multiSelectValue : selectValue}
            label={`${selectLabel}`}
            onChange={handleFileSelectChange}
            open={open}
            renderValue={renderValue}
            onBlur={handleClose}
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
            {!multi && (
              <MenuItem
                id="upload-file-menu-item"
                value={''}
                sx={{ padding: 0 }}
              >
                <Box
                  sx={{ width: '100%', pt: 1.5, pb: 1.5, pl: 4, pr: 4 }}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  Upload New File
                </Box>
              </MenuItem>
            )}
            {fileList.map((file) => (
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
    </Box>
  );
}

export default FileSelector;
