import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
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

  const debugInfo = `
    Days Booked: ${daysBooked}
    Artist: ${artistName}
    Daily Rate: $${dailyRate.toFixed(2)}
    Total Days: ${totalDays}
    Total Costs: $${totalCosts.toFixed(2)}
  `;

  console.log('Booking data:', booking); // Add this line for debugging

  return (
    <Tooltip title={debugInfo} arrow placement="top">
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
          height: 30,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'move',
          zIndex: 1000,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography variant="body2" noWrap>
          {booking.artistName} ({bookingStart.format('DD/MM')} - {bookingEnd.format('DD/MM')})
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default React.memo(DraggableEvent);
