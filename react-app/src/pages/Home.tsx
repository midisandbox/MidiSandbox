import { Box, Button, Typography } from '@mui/material';
function Home() {
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
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{ fontWeight: 800, textAlign: 'center', fontSize: '7rem' }}
          variant="h1"
        >
          Midi Sandbox
        </Typography>
        <Typography
          sx={{
            marginTop: '2rem',
            marginBottom: '4rem',
          }}
          variant="h4"
        >
          A collection of midi responsive widgets
          <br />
          made for musicians, teachers, and students.
        </Typography>
        <Typography variant="h4" color="primary" sx={{}}>
          <Button
            sx={{
              fontSize: '1.5rem',
              pt: 1,
              pb: 1,
              pr: 6,
              pl: 6,
              borderRadius: 1,
            }}
          >
            Play
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
