import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

function DraggableEvent({ booking, project, weekWidth, style }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'BOOKING',
    item: { id: booking.id, type: 'BOOKING', booking },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const projectStart = moment(project.startDate);
  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);

  const startOffset = bookingStart.diff(projectStart, 'days');
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;

  return (
    <Box
      ref={drag}
      sx={{
        position: 'absolute',
        left: (startOffset * weekWidth) / 7,
        width: (duration * weekWidth) / 7,
        height: 25,
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        fontSize: '0.75rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <Typography variant="caption">{booking.artistName}</Typography>
    </Box>
  );
}

export default DraggableEvent;
