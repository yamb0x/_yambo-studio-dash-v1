import React from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

function DraggableEvent({ booking, project, weekWidth, index, onUpdate }) {
  const startDate = moment(project.startDate);
  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const startOffset = bookingStart.diff(startDate, 'days');
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;

  // Calculate debug information
  const daysBooked = duration;
  const artistName = booking.artistName;
  const dailyRate = parseFloat(booking.dailyRate) || 0; // Ensure dailyRate is a number
  const totalDays = duration;
  const totalCosts = dailyRate * totalDays;

  return (
    <Box
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('bookingId', booking.id);
      }}
      sx={{
        position: 'absolute',
        left: `${(startOffset / 7) * weekWidth}px`,
        top: index * 40 + 10,
        width: `${(duration / 7) * weekWidth}px`,
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
        Days: {daysBooked} | Rate: ${dailyRate.toFixed(2)} | Total: ${totalCosts.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
