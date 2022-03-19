import DeleteIcon from '@mui/icons-material/Delete';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useAppDispatch } from '../../app/store';
import {
  BlockTemplate,
  removeOneBlockTemplate,
  setActiveTemplate,
} from '../blockTemplate/blockTemplateSlice';

interface TemplateItemProps {
  template: BlockTemplate;
  activeTemplateId: string | undefined;
}
function TemplateItem({ template, activeTemplateId }: TemplateItemProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openDeleteMenu = Boolean(deleteAnchorEl);

  const loadTemplate = () => {
    dispatch(setActiveTemplate(template));
  };

  const deleteTemplate = () => {
    dispatch(removeOneBlockTemplate(template.id));
  };

  const closeDeleteMenu = () => {
    setDeleteAnchorEl(null);
  };

  return (
    <ButtonGroup sx={{ width: '100%' }} disableElevation variant="contained">
      <Button
        sx={{
          flexGrow: 1,
          ...(activeTemplateId === template.id && {
            backgroundColor: `${theme.palette.primary.main}15`,
          }),
        }}
        variant="outlined"
        onClick={loadTemplate}
      >
        {template.name}
      </Button>
      <Button
        variant="outlined"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          setDeleteAnchorEl(e.currentTarget);
        }}
        id="delete-template"
        aria-controls={openDeleteMenu ? 'basic-menu' : undefined}
        aria-expanded={openDeleteMenu ? 'true' : undefined}
        aria-label="delete template"
        aria-haspopup="true"
      >
        <DeleteIcon />
      </Button>
      <Menu
        id="delete-template-menu"
        anchorEl={deleteAnchorEl}
        open={openDeleteMenu}
        onClose={closeDeleteMenu}
        MenuListProps={{
          'aria-labelledby': 'delete-template',
        }}
      >
        <MenuItem onClick={deleteTemplate}>Confirm Delete</MenuItem>
        <MenuItem onClick={closeDeleteMenu}>Cancel</MenuItem>
      </Menu>
    </ButtonGroup>
  );
}

export default TemplateItem;
