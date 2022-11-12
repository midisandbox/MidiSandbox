import { Box } from '@mui/material';
import { Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { useNotificationDispatch } from '../../app/hooks';
import { useAppDispatch } from '../../app/store';
import FileSelector from '../drawerContainer/FileSelector';
import { updateOneMidiBlock } from '../midiBlock/midiBlockSlice';
interface ImageUploadProps {
  containerWidth: number;
  containerHeight: number;
  imageSettings: ImageSettingsT;
  imageFile: any;
  blockId: string;
}
function ImageUpload({
  containerHeight,
  containerWidth,
  imageSettings,
  imageFile,
}: ImageUploadProps) {
  return (
    <Box>
      {imageFile ? (
        <Box
          component="img"
          sx={{
            height: containerHeight,
            width: containerWidth,
            objectFit: imageSettings.objectFit,
          }}
          src={imageFile}
        ></Box>
      ) : (
        <Box sx={{}}>Missing image!</Box>
      )}
    </Box>
  );
}

export const withImageFile = (
  WrappedComponent: React.FunctionComponent<ImageUploadProps>
) => {
  const WithImageFile = (props: ImageUploadProps) => {
    const { blockId, imageSettings } = props;
    const [imageFile, setImageFile] = useState<any>(null);
    const notificationDispatch = useNotificationDispatch();

    useEffect(() => {
      if (imageSettings.selectedFile) {
        Storage.get(imageSettings.selectedFile.key, {
          level: 'public',
          cacheControl: 'no-cache',
          // download: true,
        })
          .then((result) => {
            setImageFile(result);
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
    }, [imageSettings.selectedFile, notificationDispatch]);

    if (imageFile === null) {
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
            <ImageFileSelector
              imageSettings={imageSettings}
              blockId={blockId}
            />
          </Box>
        </Box>
      );
    }
    return <WrappedComponent {...props} imageFile={imageFile} />;
  };
  return WithImageFile;
};

export const ImageFileSelector = ({
  blockId,
  imageSettings,
}: {
  blockId: string;
  imageSettings: ImageSettingsT;
}) => {
  const dispatch = useAppDispatch();
  return (
    <FileSelector
      selectLabel="Select Image File"
      folder="img"
      blockId={blockId}
      onSelectChange={(value) => {
        if (!Array.isArray(value)) {
          dispatch(
            updateOneMidiBlock({
              id: blockId,
              changes: {
                imageSettings: {
                  ...imageSettings,
                  selectedFile: value,
                },
              },
            })
          );
        }
      }}
      selectValue={
        imageSettings.selectedFile ? imageSettings.selectedFile.key : ''
      }
    />
  );
};

export default withImageFile(ImageUpload);
