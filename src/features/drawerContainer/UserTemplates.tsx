import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  List,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateTemplateMutation,
  DeleteTemplateMutation,
  ListTemplatesQuery,
  UpdateTemplateMutation,
} from '../../API';
import { selectGlobalSettings } from '../../redux/slices/globalSettingsSlice';
import { useNotificationDispatch } from '../../utils/hooks';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import {
  createTemplate,
  deleteTemplate,
  updateTemplate,
} from '../../graphql/mutations';
import { listTemplates } from '../../graphql/queries';
import {
  mapCreateTemplateMutation,
  mapListTemplatesQuery,
  mapUpdateTemplateMutation,
} from '../../models/template';
import { SandboxUrlParams } from '../../pages/Sandbox';
import { getDefaultTemplate } from '../../utils/utils';
import {
  selectAllBlockLayouts,
  setAllBlockLayouts,
} from '../../redux/slices/blockLayoutSlice';
import {
  selectAllMidiBlocks,
  selectDefaultInputChannel,
  setAllMidiBlocks,
} from '../../redux/slices/midiBlockSlice';
import { callGraphQL } from '../../utils/amplifyUtils';
import DotsSvg from '../utilComponents/DotSvg';
import TemplateItem from './TemplateItem';

export default function UserTemplates() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const dispatch = useAppDispatch();
  const notificationDispatch = useNotificationDispatch();
  const { templateId: urlTemplateId } = useParams<SandboxUrlParams>();
  // selectors
  const midiBlocks = useTypedSelector(selectAllMidiBlocks);
  const blockLayout = useTypedSelector(selectAllBlockLayouts);
  const globalSettings = useTypedSelector(selectGlobalSettings);
  const { defaultInputId, defaultChannelId } = useTypedSelector(
    selectDefaultInputChannel
  );
  // state
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [newTemplateName, setTemplateName] = useState('');
  const [showNewNameInput, setShowNewNameInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getTemplates() {
      setLoading(true);
      try {
        const templateResp = await callGraphQL<ListTemplatesQuery>(
          listTemplates
        );
        setTemplates(
          mapListTemplatesQuery(templateResp).sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        );
      } catch (error) {
        notificationDispatch(
          'An error occurred while fetching your templates',
          'error',
          error
        );
      }
      setLoading(false);
    }
    getTemplates();
  }, [dispatch, notificationDispatch]);

  const constructTemplate = (id: string, name: string) => {
    const newBlockIds = midiBlocks.map((x) => uuidv4());
    return {
      id,
      name,
      defaultInputId,
      defaultChannelId,
      midiBlocks: midiBlocks.map((x, i) => ({
        ...x,
        id: newBlockIds[i],
      })),
      blockLayout: blockLayout.map((x, i) => ({
        ...x,
        i: newBlockIds[i],
      })),
      globalSettings: globalSettings,
    };
  };

  const handleTemplateCreate = async () => {
    if (newTemplateName.length > 0) {
      try {
        // id will be set to dynamoDB id once posted
        const createResp = await callGraphQL<CreateTemplateMutation>(
          createTemplate,
          {
            input: {
              template: JSON.stringify(constructTemplate('', newTemplateName)),
            },
          }
        );
        const template = mapCreateTemplateMutation(createResp);
        if (template) {
          setTemplates([template, ...templates]);
          navigate(`/play/${template.id}`);
        } else {
          throw new Error(`unexpected response: ${JSON.stringify(createResp)}`);
        }
      } catch (error) {
        notificationDispatch(
          'An error occurred while creating a template',
          'error',
          error
        );
      }

      handleNewNameClose();
    }
  };

  const handleTemplateOverwrite = async (templateId: string) => {
    const templateIndex = templates.findIndex((x) => x.id === templateId);
    if (templateIndex !== -1) {
      const updateResp = await callGraphQL<UpdateTemplateMutation>(
        updateTemplate,
        {
          input: {
            id: templates[templateIndex].id,
            template: JSON.stringify(
              constructTemplate(
                templates[templateIndex].id,
                templates[templateIndex].name
              )
            ),
          },
        }
      );
      const updatedTemplate = mapUpdateTemplateMutation(updateResp);
      if (updatedTemplate) {
        const newList = [...templates];
        newList[templateIndex] = updatedTemplate;
        setTemplates(newList);
      } else {
        notificationDispatch(
          'An error occurred while updating your template. Please try refreshing the page or contact support for help.',
          'error',
          `Update template mutation failed! ${JSON.stringify(updateResp)}`,
          8000
        );
      }
    } else {
      notificationDispatch(
        'An error occurred while updating your template. Please try refreshing the page or contact support for help.',
        'error',
        `Unable to update template ${templateId}: template not found in list.`,
        8000
      );
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    const deleteResp = await callGraphQL<DeleteTemplateMutation>(
      deleteTemplate,
      { input: { id: templateId } }
    );
    if (deleteResp.data?.deleteTemplate?.id) {
      setTemplates(
        templates.filter((x) => x.id !== deleteResp.data?.deleteTemplate?.id)
      );
    } else {
      notificationDispatch(
        'An error occurred while deleting your template. Please try refreshing the page or contact support for help.',
        'error',
        `Delete template mutation failed! ${JSON.stringify(deleteResp)}`,
        8000
      );
    }
  };

  const handleNewNameClose = () => {
    setTemplateName('');
    setShowNewNameInput(false);
  };

  return (
    <Grid sx={{ mb: 2 }} container rowSpacing={1}>
      <Grid item xs={12}>
        <Box sx={{ pl: 1, pr: 1, height: '40px' }}>
          {showNewNameInput ? (
            <TemplateNameInput
              name={newTemplateName}
              handleSave={handleTemplateCreate}
              handleClose={handleNewNameClose}
              handleChange={setTemplateName}
            />
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                onClick={() => setShowNewNameInput(true)}
                sx={{
                  width: '100%',
                  height: '100%',
                  ml: 1,
                  mr: 2,
                }}
                variant="contained"
              >
                Save Template
              </Button>
              <Button
                onClick={() => {
                  let {
                    midiBlocks: defaultBlocks,
                    blockLayout: defaultLayout,
                  } = getDefaultTemplate(muiTheme);
                  dispatch(setAllMidiBlocks(defaultBlocks));
                  dispatch(setAllBlockLayouts(defaultLayout));
                  navigate('/play');
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  mr: 1,
                }}
                variant="contained"
              >
                Start Fresh
              </Button>
            </Box>
          )}
        </Box>
      </Grid>
      {loading ? (
        <Box sx={{ width: '100%', textAlign: 'center', mt: 15 }}>
          <DotsSvg
            animate={true}
            color={muiTheme.palette.primary.main}
            width={75}
          />
        </Box>
      ) : (
        <List sx={{ width: '100%' }} component="nav" aria-label="template list">
          {templates.map((template) => (
            <TemplateItem
              key={template.id}
              selected={urlTemplateId === template.id}
              template={template}
              handleTemplateDelete={handleTemplateDelete}
              handleTemplateOverwrite={handleTemplateOverwrite}
            />
          ))}
        </List>
      )}
    </Grid>
  );
}

interface TemplateNameInputProps {
  name: string;
  handleSave: Function;
  handleClose: Function;
  handleChange: (value: string) => void;
}
function TemplateNameInput({
  name,
  handleSave,
  handleClose,
  handleChange,
}: TemplateNameInputProps) {
  return (
    <TextField
      autoFocus
      size="small"
      placeholder="Enter template name"
      value={name}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleSave();
        } else if (e.key === 'Escape') {
          handleClose();
        }
      }}
      sx={{ width: '100%', height: '100%', pl: 1, pr: 1 }}
      InputProps={{
        sx: { pb: 1.5, pl: 2, pr: 2 },
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              sx={{ p: 1, mr: 1 }}
              aria-label="save template"
              onClick={() => handleSave()}
              edge="end"
              color="primary"
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              sx={{ p: 1 }}
              aria-label="cancel"
              onClick={() => handleClose()}
              edge="end"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
