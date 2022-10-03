import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Checkbox,
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
import { formatBytes, SUPPORT_EMAIL } from '../../utils/helpers';
import {
  addUploadedFile,
  BucketFolder,
  getFilenameFromKey,
  removeOneUploadedFile,
  selectFilesInFolder,
  selectTotalFileSize,
} from '../fileUpload/fileUploadSlice';
import useAuth from '../userAuth/amplifyUtils';
import DotsSvg from '../utilComponents/DotSvg';
interface FileSelectorProps {
  selectLabel: string;
  blockId: string;
  folder: BucketFolder;
  onSelectChange: (value: UploadedFileT | UploadedFileT[] | null) => void;
  selectValue?: string;
  multiSelectValue?: string[];
  multi?: boolean;
  showLoginLink?: boolean;
}
function FileSelector({
  selectLabel,
  blockId,
  folder,
  onSelectChange,
  selectValue = '',
  multiSelectValue = [],
  multi = false,
  showLoginLink = true,
}: FileSelectorProps) {
  const muiTheme = useTheme();
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const { currentUser } = useAuth();
  const fileList = useTypedSelector((state) =>
    selectFilesInFolder(state, folder)
  );
  const totalFileSize = useTypedSelector(selectTotalFileSize);
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
        let errorMsg,
          errorLog = '';
        const totalFileSizeLimit = 500000000; // bytes
        const singleFileSizeLimit = 30000000; // bytes
        // validate file size
        if (uploadFile.size > singleFileSizeLimit) {
          errorMsg = `Your file's size (${formatBytes(
            uploadFile.size
          )}) exceeds the ${formatBytes(
            singleFileSizeLimit
          )} limit. Please try converting your file to a more compressed format such as an mp3, or email ${SUPPORT_EMAIL} for help.`;
        } else if (totalFileSize > totalFileSizeLimit) {
          errorMsg = `You have exceeded your total upload limit of ${formatBytes(
            totalFileSizeLimit
          )} (currently ${formatBytes(
            totalFileSize
          )}). Please delete some of your old files, or email ${SUPPORT_EMAIL} for additional storage space.`;
        }

        if (!errorMsg) {
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
                    size: uploadFile.size,
                  },
                })
              );
            })
            .catch((err) => {
              errorMsg = `An error occurred while uploading your file. Please try refreshing the page or contact support for help.`;
              errorLog = `Storage.put failed! ${JSON.stringify(err)}`;
            });
        }

        setIsLoading(false);
        if (errorMsg) {
          notificationDispatch(errorMsg, 'error', errorLog, 30000);
        }
      }
    },
    [
      currentUser,
      notificationDispatch,
      blockId,
      dispatch,
      folder,
      totalFileSize,
    ]
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
    if (!showLoginLink) return null;
    let loadedFiles = '';
    if (multi) {
      loadedFiles = multiSelectValue
        .map((key) => getFilenameFromKey(key))
        .join(', ');
    } else {
      loadedFiles = getFilenameFromKey(selectValue);
    }
    return (
      <Box>
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '325px',
            whiteSpace: 'nowrap',
            mb: 2,
          }}
        >
          {`Loaded File(s): `}
          <Typography color="secondary" component="span" fontWeight={500}>
            {`${loadedFiles}`}
          </Typography>
        </Box>
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
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '320px', margin: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            <MenuItem id="upload-file-menu-item" value={''} sx={{ padding: 0 }}>
              <Box
                sx={{ width: '100%', pt: 1.5, pb: 1.5, pl: 4, pr: 4 }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                Upload New File
              </Box>
            </MenuItem>
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
                {multi && (
                  <Checkbox checked={multiSelectValue.includes(file.key)} />
                )}
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
