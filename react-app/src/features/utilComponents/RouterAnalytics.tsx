import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';

const RouterAnalytics = () => {
  const location = useLocation();

  useEffect(
    function () {
      const path = location.pathname + location.search;
      ReactGA.set({ page: path });
      ReactGA.send({ hitType: 'pageview', page: path });
    },
    [location]
  );
  return null;
};
export default RouterAnalytics;
