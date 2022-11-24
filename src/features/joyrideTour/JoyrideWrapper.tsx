import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  Placement,
  STATUS,
  TooltipRenderProps,
} from 'react-joyride';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import { selectJoyrideTour, updateJoyrideTour } from './joyrideTourSlice';
import { useTheme } from '@mui/material/styles';
import { Box, Button } from '@mui/material';
import { openDrawer } from '../drawerContainer/drawerContainerSlice';
import { selectAllMidiBlocks } from '../midiBlock/midiBlockSlice';
import { updateUserActivity } from '../../redux/slices/userActivitySlice';

function JoyrideWrapper() {
  const joyrideTour = useTypedSelector(selectJoyrideTour);
  const blocks = useTypedSelector(selectAllMidiBlocks);
  const dispatch = useAppDispatch();
  const muiTheme = useTheme();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      const updatedStep = index + (action === ACTIONS.PREV ? -1 : 1);
      if (joyrideTour.tour === 'GET_STARTED') {
        if (updatedStep === 2) {
          dispatch(
            openDrawer({
              drawerId: 'BLOCK_SETTINGS',
              drawerData: { blockId: blocks[0].id },
              tabValue: 0,
            })
          );
        }
      }

      // Update state to advance the tour
      dispatch(
        updateJoyrideTour({
          stepIndex: updatedStep,
        })
      );
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Need to set our running state to false, so we can restart if we click start again.
      dispatch(updateJoyrideTour({ tour: '', stepIndex: 0 }));
      if (joyrideTour.tour === 'GET_STARTED') {
        dispatch(updateUserActivity({ tourComplete: true }));
      }
    }
  };

  if (!joyrideTour.tour) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      run={joyrideTour.tour ? true : false}
      stepIndex={joyrideTour.stepIndex}
      steps={tourSteps[joyrideTour.tour]}
      showSkipButton
      disableOverlayClose
      hideBackButton
      continuous
      disableScrolling
      spotlightClicks
      tooltipComponent={CustomTooltip}
      spotlightPadding={4}
      styles={{
        options: {
          arrowColor: muiTheme.palette.background.paper,
          backgroundColor: muiTheme.palette.background.paper,
          overlayColor: 'rgba(150, 150, 150, 1)',
          primaryColor: muiTheme.palette.primary.main,
          textColor: muiTheme.palette.text.primary,
          zIndex: 1200,
        },
      }}
    />
  );
}

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  skipProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  const muiTheme = useTheme();
  return (
    <Box
      {...tooltipProps}
      sx={{
        background: muiTheme.palette.background.paper,
        pt: 5,
        pl: 5,
        pr: 5,
      }}
    >
      {step.title && <Box>{step.title}</Box>}
      <Box>{step.content}</Box>
      <Box sx={{ display: 'flex', pt: 4, pb: 2 }}>
        {/* {index > 0 && <Button disableFocusRipple {...backProps}>Back</Button>} */}
        {
          <Button disableFocusRipple {...skipProps}>
            {isLastStep ? 'Done' : 'Skip'}
          </Button>
        }
        {continuous && !isLastStep && (
          <Button
            disableFocusRipple
            {...primaryProps}
            sx={{ marginLeft: 'auto' }}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

const tourSteps = {
  '': [],
  GET_STARTED: [
    {
      target: '#global-input-select',
      content: (
        <div>
          <Box sx={{ textAlign: 'center', pb: 2 }}>Welcome!</Box>
          Get started by selecting your midi
          <br />
          device in the global settings.
        </div>
      ),
      disableBeacon: true,
      placement: 'left' as Placement,
    },
    {
      target: '.block-settings-btn-0',
      content: (
        <div>
          Hover over a widget and click the gear
          <br />
          icon to configure its settings.
        </div>
      ),
      disableBeacon: true,
      placement: 'left' as Placement,
      hideNext: true,
    },
    {
      target: '.widget-selector',
      content: <div>Select a widget and configure its settings.</div>,
      disableBeacon: true,
      placement: 'left' as Placement,
      hideNext: true,
    },
    {
      target: '.tab-Templates',
      content: (
        <div>
          Create templates to save your
          <br />
          layout and midi settings.
        </div>
      ),
      disableBeacon: true,
      hideNext: true,
    },
  ],
};

export default JoyrideWrapper;
