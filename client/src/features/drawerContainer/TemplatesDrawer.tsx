import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import CreateIcon from '@mui/icons-material/Create';
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { selectGlobalSettings } from '../../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { selectAllBlockLayouts } from '../blockLayout/blockLayoutSlice';
import {
  setOneBlockTemplate,
  selectAllBlockTemplates,
} from '../blockTemplate/blockTemplateSlice';
import { selectAllMidiBlocks } from '../midiBlock/midiBlockSlice';
import DividerWithText from '../utilComponents/DividerWithText';
import TemplateItem from './TemplateItem';
import { selectActiveTemplate } from '../blockTemplate/blockTemplateSlice';
import { useEffect } from 'react';

export default function TemplatesDrawer() {
  const dispatch = useAppDispatch();
  const midiBlocks = useTypedSelector(selectAllMidiBlocks);
  const blockLayout = useTypedSelector(selectAllBlockLayouts);
  const globalSettings = useTypedSelector(selectGlobalSettings);
  const templates = useTypedSelector(selectAllBlockTemplates);
  const activeTemplate = useTypedSelector(selectActiveTemplate);
  const [newTemplateName, setTemplateName] = useState('');
  const [activeTemplateName, setActiveTemplateName] = useState(
    activeTemplate ? activeTemplate.name : ''
  );
  const [showNewNameInput, setShowNewNameInput] = useState(false);
  const [showActiveNameInput, setShowActiveNameInput] = useState(false);

  useEffect(() => {
    setActiveTemplateName(activeTemplate ? activeTemplate.name : '');
  }, [activeTemplate]);

  // saves a new template, or updates existing template
  const handleTemplateSave =
    (updateActiveTemplate: boolean = false) =>
    () => {
      if (newTemplateName.length > 0 || updateActiveTemplate) {
        // midiBlock and blockLayout ids must be updated to include template id
        const tempId =
          updateActiveTemplate && activeTemplate ? activeTemplate.id : uuidv4();
        const tempName =
          updateActiveTemplate && activeTemplate
            ? activeTemplateName
            : newTemplateName;
        dispatch(
          setOneBlockTemplate({
            id: tempId,
            name: tempName,
            midiBlocks: midiBlocks.map((x) => ({
              ...x,
              id: `${x.id}_${tempId}`,
            })),
            blockLayout: blockLayout.map((x) => ({
              ...x,
              i: `${x.i}_${tempId}`,
            })),
            globalSettings: globalSettings,
          })
        );
        handleNewNameClose();
        handleActiveNameClose();
      }
    };

  const handleNewNameClose = () => {
    setTemplateName('');
    setShowNewNameInput(false);
  };

  const handleActiveNameClose = () => {
    setShowActiveNameInput(false);
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
      <Grid item xs={12}>
        {showNewNameInput ? (
          <TemplateNameInput
            name={newTemplateName}
            handleSave={handleTemplateSave()}
            handleClose={handleNewNameClose}
            handleChange={setTemplateName}
          />
        ) : showActiveNameInput ? (
          <TemplateNameInput
            name={activeTemplateName}
            handleSave={handleTemplateSave(true)}
            handleClose={handleActiveNameClose}
            handleChange={setActiveTemplateName}
          />
        ) : (
          <Box sx={{ display: 'flex' }}>
            <Button
              onClick={() => setShowNewNameInput(true)}
              sx={{ width: '100%', height: '40px', mr: 2 }}
              variant="contained"
              startIcon={<SaveAltIcon />}
            >
              New Template
            </Button>
            {activeTemplate && (
              <Button
                onClick={() => setShowActiveNameInput(true)}
                sx={{ width: '100%', height: '40px' }}
                variant="contained"
                startIcon={<CreateIcon />}
              >
                Update Current
              </Button>
            )}
          </Box>
        )}
      </Grid>
      {templates.length > 0 && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <DividerWithText>Load Template</DividerWithText>
        </Grid>
      )}
      {templates.map((template) => (
        <Grid key={template.id} item xs={12}>
          <TemplateItem
            template={template}
            activeTemplateId={activeTemplate?.id}
          />
        </Grid>
      ))}
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
      variant="outlined"
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
      sx={{ width: '100%' }}
      InputProps={{
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
