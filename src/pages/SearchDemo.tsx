import { Search } from '@mui/icons-material';
import { Box, InputAdornment, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';

function SearchDemo() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(45deg, #222E2D 0%, rgba(225, 5, 34, 0) 70%) repeat scroll 0% 0%, linear-gradient(135deg, #1B292C 10%, rgba(49, 5, 209, 0) 80%) repeat scroll 0% 0%, linear-gradient(225deg, #332A38 10%, rgba(10, 219, 216, 0) 80%) repeat scroll 0% 0%, rgba(0, 0, 0, 0) linear-gradient(315deg, #2F2E23 100%, rgba(9, 245, 5, 0) 70%) repeat scroll 0% 0%',
      }}
    >
      <TextField
        sx={{
          width: '500px',
          margin: 'auto',
          border: 'none',
          '& .MuiOutlinedInput-root.Mui-focused': {
            '& > fieldset': {
              borderColor: '#fffce7',
            },
          },
          '& .MuiInputLabel-root': { color: '#fffce7' }, //styles the label
          '& .MuiOutlinedInput-root': {
            '& > fieldset': { borderColor: '#fffce7' },
          },
        }}
        size="small"
        label=""
        variant="outlined"
        placeholder="Search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: (
            <IconButton
              sx={{ color: '#fffce7', m: 1, p: 1 }}
              aria-label=""
              component="label"
            >
              <Search />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
}

export default SearchDemo;
