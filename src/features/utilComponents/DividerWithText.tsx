import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import React from 'react';
import { SxPropDict } from '../../utils/types';

const DividerWithText = ({
  hideBorder,
  children,
}: {
  hideBorder?: boolean;
  children: React.ReactNode;
}) => {
  const muiTheme = useTheme();
  const borderSx = {
    borderBottom: `1px solid ${muiTheme.palette.text.secondary}`,
    flexGrow: 1,
  } as SxPropDict;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 1,
        mb: 1,
      }}
    >
      {!hideBorder && <Box sx={borderSx} />}
      <Typography
        variant="subtitle2"
        sx={{
          paddingTop: muiTheme.spacing(0.5),
          paddingBottom: muiTheme.spacing(0.5),
          paddingRight: hideBorder ? 0 : muiTheme.spacing(2),
          paddingLeft: hideBorder ? 0 : muiTheme.spacing(2),
          color: muiTheme.palette.text.secondary,
        }}
      >
        {children}
      </Typography>
      {!hideBorder && <Box sx={borderSx} />}
    </Box>
  );
};
export default DividerWithText;
