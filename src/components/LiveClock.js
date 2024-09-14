import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { formatInTimeZone } from 'date-fns-tz';

function LiveClock({ timezone }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedTime = React.useMemo(() => {
    try {
      return formatInTimeZone(time, timezone, 'HH:mm:ss');
    } catch (error) {
      console.error(`Error formatting time for timezone ${timezone}:`, error);
      return 'Error';
    }
  }, [time, timezone]);

  return (
    <Typography variant="body2">
      {formattedTime}
    </Typography>
  );
}

export default LiveClock;
