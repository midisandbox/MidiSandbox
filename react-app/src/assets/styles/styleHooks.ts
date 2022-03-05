import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';

export const useBlockSettingStyles = makeStyles((theme: Theme) =>
  createStyles({
    select: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
    checkbox: {
      marginBottom: theme.spacing(2),
    },
    buttonGroupItem: {
      pl: 0.5,
      pr: 0.5,
      pt: 0.5,
      pb: 0.5,
      border: '0 !important',
      minWidth: '0 !important',
    },
    buttonGroupText: {
      display: 'flex',
      alignItems: 'center',
      margin: '0 -2px',
      pl: 1,
      pr: 1,
    },
  })
);

export const blockSettingMenuProps = {
  PaperProps: {
    sx: {
      ml: 1,
    },
  },
};

export const useTabStyles = makeStyles((theme: Theme) => ({
  tabsRoot: {
    minHeight: theme.spacing(10),
    height: theme.spacing(10),
  },
  tabRoot: {
    minHeight: theme.spacing(10),
    height: theme.spacing(10),
    p: 1
  },
}));
