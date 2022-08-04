import { Box, Link } from '@mui/material';
import React from 'react';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
function BrowserWarning() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          maxWidth: '500px',
          margin: 'auto',
          textAlign: 'center',
        }}
      >
        <SentimentVeryDissatisfiedIcon
          sx={{
            fontSize: '5rem',
            marginBottom: '16px',
          }}
        />
        <Box sx={{ mb: 2 }}>
          Midi Sandbox is only supported by Chromium based browsers such as
          Chrome, Edge, and Brave. Firefox coming soon...
        </Box>
        <Box sx={{ mb: 4 }}>Mobile devices not supported.</Box>
        <Link href="https://midisandbox.com">Home</Link>
      </Box>
    </Box>
  );
}

export default BrowserWarning;
