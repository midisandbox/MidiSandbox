import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import avril14thThumbnail from '../assets/imgs/thumbnails/avril-14th-thumbnail.png';
import defaultThumbnail from '../assets/imgs/thumbnails/default-thumbnail.png';
const DEFAULT_TEMPLATE_ID = '28aeb3df-d5c6-49b4-961d-2a326f28bd2c';
const AVRIL_14TH_TEMPLATE_ID = '40d405dc-fc88-44c9-a8d3-575314e4e802';
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
          Play, practice, and educate with a sandbox full of midi widgets.
        </Typography>
        <Typography variant="h4" color="primary" sx={{}}>
          <Link
            to={`/play/${DEFAULT_TEMPLATE_ID}`}
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
        <Typography sx={{ mb: 20 }} variant="h2">
          Templates
        </Typography>
        <Grid sx={{ mb: 2, maxWidth: '800px' }} container rowSpacing={4}>
          <Grid item xs={6} sx={{ p: 4 }}>
            <Link
              to={`/play/${DEFAULT_TEMPLATE_ID}`}
              style={{
                textDecoration: 'none',
              }}
            >
              <Box>
                <img
                  width="100%"
                  src={defaultThumbnail}
                  alt="default template"
                />
                <Typography
                  variant="body1"
                  sx={{ textAlign: 'center', fontSize: '1.5rem' }}
                >
                  Default
                </Typography>
              </Box>
            </Link>
          </Grid>
          <Grid item xs={6} sx={{ p: 4 }}>
            <Link
              to={`/play/${AVRIL_14TH_TEMPLATE_ID}`}
              style={{
                textDecoration: 'none',
              }}
            >
              <Box>
                <img
                  width="100%"
                  src={avril14thThumbnail}
                  alt="avril 14th template"
                />
                <Typography
                  variant="body1"
                  sx={{ textAlign: 'center', fontSize: '1.5rem' }}
                >
                  Avril 14th
                </Typography>
              </Box>
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
