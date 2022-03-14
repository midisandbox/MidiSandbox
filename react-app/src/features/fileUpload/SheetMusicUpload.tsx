import { asUploadButton } from '@rpldy/upload-button';
import Uploady, { BatchItem, UPLOADER_EVENTS } from '@rpldy/uploady';
import React, { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../../app/store';
import { addUploadedFile, REMOTE_FOLDER } from './fileUploadSlice';

function SheetMusicUpload() {
  const dispatch = useAppDispatch();
  const listeners = useMemo(
    () => ({
      [UPLOADER_EVENTS.ITEM_FINISH]: (item: BatchItem) => {
        console.log('item: ', item);
        if (item.uploadResponse.data.status === 1000) {
          const { filename, uuidFilename } = item.uploadResponse.data.result;
          dispatch(
            addUploadedFile({
              id: uuidv4(),
              filename,
              uuidFilename,
              folder: REMOTE_FOLDER.SHEET_MUSIC,
            })
          );
        } else {
          console.error(
            'Upload response did not return success status!',
            item.uploadResponse
          );
        }
      },
    }),
    [dispatch]
  );

  return (
    <Uploady
      listeners={listeners}
      destination={{
        url: `${process.env.REACT_APP_API_BASE_URL}/${REMOTE_FOLDER.SHEET_MUSIC}`,
      }}
    >
      <DivUploadButton />
    </Uploady>
  );
}

const DivUploadButton = asUploadButton((props: any) => {
  return (
    <div {...props}>
      Upload New MusicXML
    </div>
  );
});

export default SheetMusicUpload;
