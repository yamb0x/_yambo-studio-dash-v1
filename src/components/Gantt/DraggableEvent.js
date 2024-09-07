import React, { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

// Function to generate a random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function DraggableEvent({ booking, project, weekWidth, index }) {
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

  // Generate a random color for each booking
  const backgroundColor = useMemo(() => getRandomColor(), []);

  const EVENT_HEIGHT = 50; // Height of each event
  const EVENT_MARGIN = 5; // Margin between events
  const INITIAL_OFFSET = 60; // Initial offset to leave space for day labels

  return (
    <Box
      ref={drag}
      sx={{
        position: 'absolute',
        left: (startOffset * weekWidth) / 7,
        width: (duration * weekWidth) / 7,
        height: EVENT_HEIGHT,
        backgroundColor: backgroundColor, // Random color
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
        top: INITIAL_OFFSET + index * (EVENT_HEIGHT + EVENT_MARGIN), // Calculate vertical position based on index
        zIndex: 10, // Ensure widgets are above the day labels
      }}
    >
      <Typography variant="caption">{booking.artistName}</Typography>
    </Box>
  );
}

export default DraggableEvent;
