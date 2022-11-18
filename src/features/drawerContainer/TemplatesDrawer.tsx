import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import useAuth from '../userAuth/amplifyUtils';
import UserTemplates from './UserTemplates';

export default function TemplatesDrawer() {
  const { currentUser } = useAuth();
  return (
    <div>
      {currentUser ? (
        <UserTemplates />
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          Please{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography
              color="primary"
              sx={{ display: 'inline-block', textDecoration: 'underline' }}
            >
              login
            </Typography>
          </Link>{' '}
          to save your own templates.
        </Box>
      )}
    </div>
  );
}
