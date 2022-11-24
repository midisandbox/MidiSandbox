import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Storage } from 'aws-amplify';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GetTemplateQuery } from '../API';
import { setAllGlobalSettings } from '../redux/slices/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../redux/store';
import BlockLayout from '../components/BlockLayout';
import { setAllBlockLayouts } from '../redux/slices/blockLayoutSlice';
import DrawerContainer from '../components/drawerContainer/DrawerContainer';
import {
  setAllMidiBlocks,
  setDefaultInputChannel,
} from '../redux/slices/midiBlockSlice';
import ModalContainer from '../components/modalContainer/ModalContainer';
import Notifications from '../components/Notifications';
import useAuth, { callGraphQL } from '../utils/amplifyUtils';
import { getTemplate } from '../graphql/queries';
import { mapGetTemplateQuery } from '../models/template';
import {
  extractSubstring,
  getDefaultMidiBlock,
  getDefaultTemplate,
} from '../utils/utils';

import _ from 'lodash';
import { useNotificationDispatch } from '../utils/hooks';
import { openDrawer } from '../components/drawerContainer/drawerContainerSlice';
import {
  BucketFolder,
  setAllUploadedFiles,
  storageFolders,
} from '../redux/slices/fileUploadSlice';
import { updateJoyrideTour } from '../redux/slices/joyrideTourSlice';
import JoyrideTourWrapper from '../components/JoyrideTourWrapper';
import { selectDefaultInputChannel } from '../redux/slices/midiBlockSlice';
import { selectUserActivity } from '../redux/slices/userActivitySlice';
import {
  selectAllMidiInputs,
  selectInitialInputsLoaded,
} from '../redux/slices/midiListenerSlice';

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
  const defaultInputFound = inputs.find((x) => x.id === defaultInputId);
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
    if (
      initialDefaultInputLoaded &&
      initialInputsLoaded &&
      !defaultInputFound &&
      !defaultInputId.includes('/midi/')
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
    defaultInputFound,
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
                  size: x.size ? x.size : 0,
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
      <JoyrideTourWrapper />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default Sandbox;
