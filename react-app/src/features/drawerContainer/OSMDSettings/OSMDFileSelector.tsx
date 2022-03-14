import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { asUploadButton } from '@rpldy/upload-button';
import Uploady, { BatchItem, UPLOADER_EVENTS } from '@rpldy/uploady';
import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useTypedSelector } from '../../../app/store';
import {
  blockSettingMenuProps,
  useBlockSettingStyles,
} from '../../../assets/styles/styleHooks';
import {
  REMOTE_FOLDER,
  selectAllSheetMusicFiles,
  uploadSheetMusicFile,
} from '../../fileUpload/fileUploadSlice';
import { MidiBlockT, updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';

interface OSMDFileSelectorProps {
  block: MidiBlockT;
}
function OSMDFileSelector({ block }: OSMDFileSelectorProps) {
  const classes = useBlockSettingStyles();
  const dispatch = useAppDispatch();
  const sheetMusicFiles = useTypedSelector(selectAllSheetMusicFiles);

  const handleFileSelectChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    if (value !== '') {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            osmdSettings: {
              ...block.osmdSettings,
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
                id: uuidv4(),
                filename,
                uuidFilename,
                folder: REMOTE_FOLDER.SHEET_MUSIC,
              },
              blockId: block.id,
            })
          );
          handleClose();
        } else {
          console.error(
            'Upload response did not return success status!',
            item.uploadResponse
          );
        }
      },
    }),
    [dispatch, block.id]
  );

  // handle menu open/close
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <FormControl className={classes.select} size="small" fullWidth>
        <InputLabel id="select-musicXML-label">Select MusicXML File</InputLabel>
        <Select
          labelId="select-musicXML-label"
          id="select-musicXML-select"
          value={block.osmdSettings.selectedFileId}
          label="Select MusicXML File"
          onChange={handleFileSelectChange}
          open={open}
          onClose={(e: any) => {
            const className = e.target?.className;
            if (className && className.includes('MuiBackdrop')) {
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
            <MenuItem key={file.id} value={file.id}>
              {file.filename}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

const DivUploadButton = asUploadButton((props: any) => {
  return <div {...props}>Upload New MusicXML</div>;
});

export default OSMDFileSelector;
