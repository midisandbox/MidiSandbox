import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/system';

export const useBlockSettingStyles = makeStyles((theme: Theme) =>
  createStyles({
    select: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
    checkbox: {
      marginBottom: theme.spacing(0),
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

export const useMsStyles = makeStyles((theme: Theme) =>
  createStyles({
    iconButton: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      borderRadius: '50%',
      width: theme.spacing(10),
      height: theme.spacing(10),
      minWidth: 0,
      padding: 0,
    },
  })
);

export const blockSettingMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    sx: {
      ml: 1,
    },
  },
};
