import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';
import GridLayout, { Layout } from 'react-grid-layout';
import { useResizeDetector } from 'react-resize-detector';
import { useAppDispatch, useTypedSelector } from '../../redux/store';
import { UpdateLayoutPayload } from '../../types/types';
import MidiBlock from './MidiBlock';
import {
  selectAllBlockLayouts,
  updateManyBlockLayouts,
} from '../../redux/slices/blockLayoutSlice';

const BlockLayout = () => {
  const { width, ref } = useResizeDetector();
  const theme = useTheme();
  const blockLayouts = useTypedSelector(selectAllBlockLayouts);
  const dispatch = useAppDispatch();

  const onLayoutChange = (updatedLayout: Layout[]) => {
    let updatePayload: UpdateLayoutPayload = [];
    updatedLayout.forEach((layout) => {
      updatePayload.push({ id: layout.i, changes: layout });
    });
    dispatch(updateManyBlockLayouts(updatePayload));
  };

  return (
    <Box ref={ref}>
      <GridLayout
        width={width ? width : 0}
        className="layout"
        draggableHandle=".blockDragHandle"
        margin={[theme.custom.spacingUnit * 2, theme.custom.spacingUnit * 2]}
        cols={12}
        rowHeight={theme.custom.spacingUnit * 2}
        onLayoutChange={onLayoutChange}
        resizeHandle={
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: theme.spacing(5),
              height: theme.spacing(5),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
            }}
          >
            <Box
              sx={{
                width: theme.spacing(3),
                height: theme.spacing(3),
                borderRight: `3px solid ${theme.palette.primary.main}`,
                borderBottom: `3px solid ${theme.palette.primary.main}`,
                boxShadow: '1px 1px 0px #adadadf2',
              }}
            ></Box>
          </Box>
        }
      >
        {blockLayouts.map((blockLayout, i) => (
          <Box
            key={blockLayout.i}
            data-grid={{ ...blockLayout, ...blockLayoutTemplate }}
          >
            <MidiBlock
              blockIndex={i}
              deleteDisabled={blockLayouts.length === 1}
              blockLayout={blockLayout}
            />
          </Box>
        ))}
      </GridLayout>
    </Box>
  );
};

const blockLayoutTemplate: Partial<Layout> = {
  minH: 7,
};

export default BlockLayout;
