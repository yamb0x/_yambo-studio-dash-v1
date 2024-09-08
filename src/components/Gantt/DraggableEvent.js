import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

function DraggableEvent({ booking, project, weekWidth, index, onUpdate, startDate }) {
  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const startOffset = bookingStart.diff(startDate, 'days');
  const adjustedStartOffset = startOffset - (Math.floor(startOffset / 7) * 2); // Adjust for weekends
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;
  const adjustedDuration = calculateWorkingDays(bookingStart, bookingEnd);

  const eventRef = useRef(null);

  useEffect(() => {
    const element = eventRef.current;
    if (!element) return;

    const handleDragStart = (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify(booking));
      e.dataTransfer.effectAllowed = 'move';
    };

    element.addEventListener('dragstart', handleDragStart);

    return () => {
      element.removeEventListener('dragstart', handleDragStart);
    };
  }, [booking]);

  function calculateWorkingDays(start, end) {
    let days = 0;
    let current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      if (current.day() !== 0 && current.day() !== 6) {
        days++;
      }
      current.add(1, 'day');
    }
    return days;
  }

  const totalCost = adjustedDuration * booking.dailyRate;

  return (
    <Box
      ref={eventRef}
      draggable="true"
      sx={{
        position: 'absolute',
        left: `${(adjustedStartOffset / 5) * weekWidth}px`,
        top: index * 40 + 10,
        width: `${(adjustedDuration / 5) * weekWidth}px`,
        height: 'auto',
        minHeight: 30,
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        cursor: 'move',
        zIndex: 1000,
        overflow: 'hidden',
        padding: '2px 4px',
      }}
    >
      <Typography variant="body2" noWrap>
        {booking.artistName} ({bookingStart.format('DD/MM')} - {bookingEnd.format('DD/MM')})
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
        Working Days: {adjustedDuration} | Rate: ${booking.dailyRate.toFixed(2)} | Total: ${totalCost.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
