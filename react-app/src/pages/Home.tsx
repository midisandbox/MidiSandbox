import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Link } from 'react-router-dom';
function Home() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        background:
          'linear-gradient(45deg, #222E2D 0%, rgba(225, 5, 34, 0) 70%) repeat scroll 0% 0%, linear-gradient(135deg, #1B292C 10%, rgba(49, 5, 209, 0) 80%) repeat scroll 0% 0%, linear-gradient(225deg, #332A38 10%, rgba(10, 219, 216, 0) 80%) repeat scroll 0% 0%, rgba(0, 0, 0, 0) linear-gradient(315deg, #2F2E23 100%, rgba(9, 245, 5, 0) 70%) repeat scroll 0% 0%',
      }}
    >
      <Box
        sx={{
          height: window.innerHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h1">Midi Sandbox</Typography>
        <Typography
          sx={{
            marginTop: '2rem',
            marginBottom: '4rem',
          }}
          variant="h4"
        >
          Play, learn, and create with a sandbox full of midi widgets.
        </Typography>
        <Typography variant="h4" color="primary" sx={{}}>
          <Link
            to="/play"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
            }}
          >
            Play
          </Link>
        </Typography>
      </Box>
      <Box
        sx={{
          height: window.innerHeight,
          marginTop: '4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h2">Templates</Typography>
        <Grid sx={{ mb: 2 }} container rowSpacing={1}>
          <Grid item xs={4}>
            temp1
          </Grid>
          <Grid item xs={4}>
            temp2
          </Grid>
          <Grid item xs={4}>
            temp3
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
