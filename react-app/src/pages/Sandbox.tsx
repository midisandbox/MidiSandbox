import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Storage } from 'aws-amplify';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTemplateQuery } from '../API';
import { setAllGlobalSettings } from '../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../app/store';
import BlockLayout from '../features/blockLayout/BlockLayout';
import { setAllBlockLayouts } from '../features/blockLayout/blockLayoutSlice';
import DrawerContainer from '../features/drawerContainer/DrawerContainer';
import {
  setAllMidiBlocks,
  setDefaultInputChannel,
} from '../features/midiBlock/midiBlockSlice';
import ModalContainer from '../features/modalContainer/ModalContainer';
import Notifications from '../features/notification/Notifications';
import useAuth, { callGraphQL } from '../features/userAuth/amplifyUtils';
import { getTemplate } from '../graphql/queries';
import { mapGetTemplateQuery } from '../models/template';
import {
  extractSubstring,
  getDefaultMidiBlock,
  getDefaultTemplate,
} from '../utils/helpers';

import _ from 'lodash';
import { useNotificationDispatch } from '../app/hooks';
import { openDrawer } from '../features/drawerContainer/drawerContainerSlice';
import {
  BucketFolder,
  setAllUploadedFiles,
  storageFolders,
} from '../features/fileUpload/fileUploadSlice';
import { updateJoyrideTour } from '../features/joyride/joyrideTourSlice';
import JoyrideWrapper from '../features/joyride/JoyrideWrapper';
import { selectDefaultInputChannel } from '../features/midiBlock/midiBlockSlice';
import { selectUserActivity } from '../features/userActivity/userActivitySlice';
import {
  selectAllMidiInputs,
  selectInitialInputsLoaded,
} from '../features/midiListener/midiListenerSlice';

export type SandboxUrlParams = {
  templateId?: string;
};
const Sandbox = () => {
  const muiTheme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const userActivity = useTypedSelector(selectUserActivity);
  const inputs = useTypedSelector(selectAllMidiInputs);
  const { defaultInputId, initialDefaultInputLoaded } = useTypedSelector(
    selectDefaultInputChannel
  );
  const initialInputsLoaded = useTypedSelector(selectInitialInputsLoaded);
  const { currentUser } = useAuth();
  const { templateId } = useParams<SandboxUrlParams>();
  const [loadedTemplateId, setLoadedTemplateId] = useState('');

  const loadTemplate = useCallback(
    async (templateId: string | undefined) => {
      if (templateId === loadedTemplateId) return;
      let { midiBlocks, blockLayout } = getDefaultTemplate(muiTheme);
      if (templateId) {
        try {
          const templateData = await callGraphQL<GetTemplateQuery>(
            getTemplate,
            { id: templateId },
            GRAPHQL_AUTH_MODE.API_KEY
          );
          const template = mapGetTemplateQuery(templateData);
          if (template) {
            // merge template midi blocks with the default midi block to handle new settings/props
            midiBlocks = template.midiBlocks.map((block) => {
              const mergedBlock = _.merge(
                getDefaultMidiBlock(muiTheme).midiBlock,
                block
              );
              // initialize Notepad via templateEditorState with last saved currentEditorState
              mergedBlock.notepadSettings.templateEditorState =
                mergedBlock.notepadSettings.currentEditorState;
              return mergedBlock;
            });
            blockLayout = template.blockLayout;
            dispatch(setAllGlobalSettings(template.globalSettings));
            dispatch(
              setDefaultInputChannel({
                defaultInputId: template.defaultInputId,
                defaultChannelId: template.defaultChannelId,
              })
            );
            setLoadedTemplateId(templateId);
          } else {
            navigate(`/play`);
            throw new Error('Template not found!');
          }
        } catch (err) {
          console.error('err: ', err);
        }
      }
      dispatch(setAllMidiBlocks(midiBlocks));
      dispatch(setAllBlockLayouts(blockLayout));

      if (!templateId) {
        // if no template found then open the drawer and select the top default block
        dispatch(
          openDrawer({
            drawerId: 'BLOCK_SETTINGS',
            drawerData: { blockId: midiBlocks[0].id },
            tabValue: 0,
          })
        );
        // we want to dispatch this to trigger initialDefaultInputLoaded=true
        dispatch(
          setDefaultInputChannel({
            defaultInputId: '',
            defaultChannelId: '',
          })
        );
      }
    },
    [muiTheme, dispatch, navigate, loadedTemplateId]
  );

  useEffect(() => {
    loadTemplate(templateId);
  }, [templateId, loadTemplate]);

  // once initial load completes, trigger tour if no default input set
  useEffect(() => {
    const defaultInputFound = inputs.find((x) => x.id === defaultInputId);
    if (
      initialDefaultInputLoaded &&
      initialInputsLoaded &&
      !defaultInputFound
    ) {
      dispatch(
        openDrawer({
          drawerId: 'BLOCK_SETTINGS',
          drawerData: { blockId: '' },
          tabValue: 1,
        })
      );
      if (!userActivity.tourComplete) {
        dispatch(
          updateJoyrideTour({
            tour: 'GET_STARTED',
            stepIndex: 0,
          })
        );
      }
    }
  }, [
    defaultInputId,
    initialDefaultInputLoaded,
    inputs,
    initialInputsLoaded,
    dispatch,
    userActivity.tourComplete,
  ]);

  // load user's uploaded files
  useEffect(() => {
    if (currentUser) {
      Storage.list(currentUser.getUsername())
        .then((result) => {
          const files: UploadedFileT[] = [];
          result.forEach((x) => {
            if (x.key) {
              const folder = extractSubstring(
                x.key,
                `${currentUser.getUsername()}/`,
                '/'
              ) as BucketFolder;
              const keyPathArr = x.key.split('/');
              if (storageFolders.includes(folder)) {
                files.push({
                  key: x.key,
                  lastModified: x.lastModified ? x.lastModified.valueOf() : 0,
                  folder: folder,
                  filename: keyPathArr[keyPathArr.length - 1],
                });
              }
            }
          });
          dispatch(setAllUploadedFiles(files));
        })
        .catch((err) => {
          notificationDispatch(
            'An error occurred while loading your files. Please try refreshing the page or contact support for help.',
            'error',
            `Storage.list failed! ${err}`,
            8000
          );
        });
    }
  }, [currentUser, dispatch, notificationDispatch]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Notifications />
      <ModalContainer />
      <JoyrideWrapper />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default Sandbox;
