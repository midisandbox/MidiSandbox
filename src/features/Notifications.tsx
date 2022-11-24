import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import {
  removeNotification,
  selectAllNotifications,
} from '../redux/slices/notificationSlice';
import { useAppDispatch, useTypedSelector } from '../redux/store';

export default function Notifications() {
  const dispatch = useAppDispatch();
  const notifications = useTypedSelector(selectAllNotifications);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 2,
        top: 8,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ maxWidth: 550 }}>
        {notifications.map((notification) => (
          <Collapse key={notification.id} in={true}>
            <Alert
              severity={notification.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => dispatch(removeNotification(notification.id))}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {notification.msg}
            </Alert>
          </Collapse>
        ))}
      </Box>
    </Box>
  );
}
