import React from 'react';
import { useGetSheetMusicQuery } from '../../api/apiSlice';
import { OSMDViewProps } from './OSMDUtils';
import OSMDView from './OSMDView';

const OSMDViewWrapper = (props: OSMDViewProps) => {
  const { data, error, isLoading } = useGetSheetMusicQuery(
    '04c6f1b0-79d4-45cc-a7dc-1200aedfd9ce__Alvin-Row-V3.xml'
  );
  let osmdFile = null;
  if (data?.result) {
    osmdFile = atob(data.result);
  }

  if (osmdFile === null) return null;
  return <OSMDView {...props} osmdFile={osmdFile} />;
};

export default  OSMDViewWrapper