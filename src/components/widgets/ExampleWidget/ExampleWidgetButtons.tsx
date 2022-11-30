import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Button, Tooltip } from '@mui/material';
import React from 'react';
import { updateOneMidiBlock } from '../../../redux/slices/midiBlockSlice';
import { useAppDispatch } from '../../../redux/store';
import { useMsStyles } from '../../../styles/styleHooks';
import { exampleWidgetDefaultSettings } from './ExampleWidget';
interface ExampleWidgetBlockButtonsProps {
  block: MidiBlockT;
}
export const ExampleWidgetBlockButtons = React.memo(
  ({ block }: ExampleWidgetBlockButtonsProps) => {
    const dispatch = useAppDispatch();
    const msClasses = useMsStyles();
    const onRefreshClick = () => {
      dispatch(
        updateOneMidiBlock({
          id: block.id,
          changes: {
            widgetSettings: exampleWidgetDefaultSettings,
          },
        })
      );
    };
    return (
      <Tooltip arrow title="Refresh" placement="left">
        <Button
          color="primary"
          variant="contained"
          className={msClasses.widgetSideButton}
          onClick={onRefreshClick}
          aria-label="refresh"
        >
          <RefreshOutlinedIcon />
        </Button>
      </Tooltip>
    );
  }
);
