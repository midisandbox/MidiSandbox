import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Storage } from 'aws-amplify';
import { useCallback, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { GetTemplateQuery } from '../API';
import { setAllGlobalSettings } from '../app/globalSettingsSlice';
import { useAppDispatch } from '../app/store';
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
import {
  storageFolders,
  BucketFolder,
} from '../features/fileUpload/fileUploadSlice';
import {
  setAllUploadedFiles,
  UploadedFileT,
} from '../features/fileUpload/fileUploadSlice';
import { openDrawer } from '../features/drawerContainer/drawerContainerSlice';

export type SandboxUrlParams = {
  templateId?: string;
};
const Sandbox = () => {
  const muiTheme = useTheme();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const { currentUser } = useAuth();

  const { templateId } = useParams<SandboxUrlParams>();

  const loadTemplate = useCallback(
    async (templateId: string | undefined) => {
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
              return _.merge(getDefaultMidiBlock(muiTheme).midiBlock, block);
            });
            blockLayout = template.blockLayout;
            dispatch(setAllGlobalSettings(template.globalSettings));
            dispatch(
              setDefaultInputChannel({
                defaultInputId: template.defaultInputId,
                defaultChannelId: template.defaultChannelId,
              })
            );
          } else {
            history.push(`/play`);
            throw new Error('Template not found!');
          }
        } catch (err) {
          console.error('err: ', err);
        }
      }
      dispatch(setAllMidiBlocks(midiBlocks));
      dispatch(setAllBlockLayouts(blockLayout));
      // if no template found then open the drawer and select the top default block
      if (!templateId) {
        dispatch(
          openDrawer({
            drawerId: 'BLOCK_SETTINGS',
            drawerData: { blockId: midiBlocks[0].id },
            tabValue: 0,
          })
        );
      }
    },
    [muiTheme, dispatch, history]
  );

  useEffect(() => {
    loadTemplate(templateId);
  }, [templateId, loadTemplate]);

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
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(45deg, #222E2D 0%, rgba(225, 5, 34, 0) 70%) repeat scroll 0% 0%, linear-gradient(135deg, #1B292C 10%, rgba(49, 5, 209, 0) 80%) repeat scroll 0% 0%, linear-gradient(225deg, #332A38 10%, rgba(10, 219, 216, 0) 80%) repeat scroll 0% 0%, rgba(0, 0, 0, 0) linear-gradient(315deg, #2F2E23 100%, rgba(9, 245, 5, 0) 70%) repeat scroll 0% 0%',
      }}
    >
      <Notifications />
      <ModalContainer />
      <DrawerContainer>
        <BlockLayout />
      </DrawerContainer>
    </Box>
  );
};

export default Sandbox;
