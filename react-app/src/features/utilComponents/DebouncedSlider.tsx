import { Box, Slider, Typography } from '@mui/material';
import React, { useState } from 'react';

interface DebouncedSliderT {
  value: number | number[];
  min: number;
  max: number;
  label: string;
  onCommitChange: (newVal: number | number[]) => void;
  valuePrefix?: string;
  valueSuffix?: string;
}
function DebouncedSlider({
  value,
  min,
  max,
  label,
  onCommitChange,
  valuePrefix = '',
  valueSuffix = '',
}: DebouncedSliderT) {
  const [val, setVal] = useState(value);
  return (
    <Box sx={{ mr: 3 }}>
      <Typography variant="body1" id={label} gutterBottom>
        {label}:
        <Typography color="secondary" component="span" fontWeight={500}>
          {' '}
          {`${valuePrefix}${val}${valueSuffix}`}
        </Typography>
      </Typography>
      <Slider
        value={val}
        onChange={(event: Event, newValue: number | number[]) =>
          setVal(newValue)
        }
        onChangeCommitted={(
          event: React.SyntheticEvent | Event,
          committedValue: number | Array<number>
        ) => onCommitChange(committedValue)}
        aria-labelledby={label}
        min={min}
        max={max}
      />
    </Box>
  );
}
export default DebouncedSlider;
