import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { selectGlobalSettings } from '../../app/globalSettingsSlice';
import { useAppDispatch, useTypedSelector } from '../../app/store';
import { selectAllBlockLayouts } from '../blockLayout/blockLayoutSlice';
import {
  addNewBlockTemplate,
  selectAllBlockTemplates,
} from '../blockTemplate/blockTemplateSlice';
import { selectAllMidiBlocks } from '../midiBlock/midiBlockSlice';
import DividerWithText from '../utilComponents/DividerWithText';
import TemplateItem from './TemplateItem';

export default function TemplatesDrawer() {
  const dispatch = useAppDispatch();
  const midiBlocks = useTypedSelector(selectAllMidiBlocks);
  const blockLayout = useTypedSelector(selectAllBlockLayouts);
  const globalSettings = useTypedSelector(selectGlobalSettings);
  const templates = useTypedSelector(selectAllBlockTemplates);
  const [templateName, setTemplateName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleNewTemplateSave = () => {
    if (templateName.length > 0) {
      // midiBlock and blockLayout ids must be updated to include template id
      const newTemplateId = uuidv4();
      dispatch(
        addNewBlockTemplate({
          id: newTemplateId,
          name: templateName,
          midiBlocks: midiBlocks.map((x) => ({
            ...x,
            id: `${x.id}_${newTemplateId}`,
          })),
          blockLayout: blockLayout.map((x) => ({
            ...x,
            i: `${x.i}_${newTemplateId}`,
          })),
          globalSettings: globalSettings,
        })
      );
      handleTemplateNameClose();
    }
  };

  const handleTemplateNameClose = () => {
    setTemplateName('');
    setShowInput(false);
  };

  return (
    <Grid sx={{ pl: 3, pr: 3, mb: 2 }} container rowSpacing={2}>
      <Grid item xs={12}>
        {showInput ? (
          <TextField
            autoFocus
            variant="outlined"
            size="small"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                handleNewTemplateSave();
              } else if (e.key === 'Escape') {
                handleTemplateNameClose();
              }
            }}
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    sx={{ p: 1, mr: 1 }}
                    aria-label="save template"
                    onClick={handleNewTemplateSave}
                    edge="end"
                    color="primary"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    sx={{ p: 1 }}
                    aria-label="cancel"
                    onClick={handleTemplateNameClose}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Button
            onClick={() => setShowInput(true)}
            sx={{ width: '100%', height: '40px' }}
            variant="contained"
            startIcon={<SaveAltIcon />}
          >
            Save New Template
          </Button>
        )}
      </Grid>
      {templates.length > 0 && (
        <Grid item xs={12} sx={{ mt: 2 }}>
          <DividerWithText>Load Template</DividerWithText>
        </Grid>
      )}
      {templates.map((template) => (
        <Grid key={template.id} item xs={12}>
          <TemplateItem template={template} />
        </Grid>
      ))}
    </Grid>
  );
}
