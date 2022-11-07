import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlockTemplate } from '../../utils/helpers';

interface TemplateItemProps {
  template: BlockTemplate;
  selected: boolean;
  handleTemplateDelete: (id: string) => void;
  handleTemplateOverwrite: (id: string) => void;
}
function TemplateItem({
  template,
  selected,
  handleTemplateDelete,
  handleTemplateOverwrite,
}: TemplateItemProps) {
  const navigate = useNavigate();

  const theme = useTheme();
  const [dropMenuAnchorEl, setDropMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const openDropMenu = Boolean(dropMenuAnchorEl);

  const closeDropMenu = () => {
    setDropMenuAnchorEl(null);
  };

  return (
    <ListItem
      key={template.id}
      secondaryAction={
        <>
          <IconButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              setDropMenuAnchorEl(e.currentTarget);
            }}
            id="template-menu"
            edge="end"
            aria-controls={openDropMenu ? 'basic-menu' : undefined}
            aria-expanded={openDropMenu ? 'true' : undefined}
            aria-label="template menu"
            aria-haspopup="true"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="template-menu-dropdown"
            anchorEl={dropMenuAnchorEl}
            open={openDropMenu}
            onClose={closeDropMenu}
            MenuListProps={{
              'aria-labelledby': 'template-menu',
            }}
          >
            <MenuItem
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.host}/play/${template.id}`
                );
                closeDropMenu();
              }}
            >
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Link</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleTemplateOverwrite(template.id);
                closeDropMenu();
              }}
            >
              <ListItemIcon>
                <SaveAltIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Overwrite</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleTemplateDelete(template.id)}
              sx={{ color: theme.palette.error.main }}
            >
              <ListItemIcon sx={{ color: theme.palette.error.main }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      }
      disablePadding
    >
      <ListItemButton
        selected={selected}
        onClick={() =>
          (window.location.href = `${window.location.origin}/play/${template.id}`)
        }
      >
        <ListItemText primary={template.name} />
      </ListItemButton>
    </ListItem>
  );
}

export default TemplateItem;
