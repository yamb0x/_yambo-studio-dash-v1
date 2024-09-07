import React, { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useArtists } from '../../contexts/ArtistContext'; // Make sure to import this

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
  const { artists } = useArtists(); // Use the ArtistContext to get the daily rate
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

  const EVENT_HEIGHT = 70; // Increased height to accommodate more text
  const EVENT_MARGIN = 5; // Margin between events
  const INITIAL_OFFSET = 60; // Initial offset to leave space for day labels

  // Find the artist in the artists array to get the daily rate
  const artist = artists.find(a => a.id === booking.artistId);
  const dailyRate = artist ? artist.dailyRate : 'N/A';

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        fontSize: '0.75rem',
        overflow: 'hidden',
        padding: '4px',
        top: INITIAL_OFFSET + index * (EVENT_HEIGHT + EVENT_MARGIN), // Calculate vertical position based on index
        zIndex: 10, // Ensure widgets are above the day labels
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        {booking.artistName}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
        Rate: ${dailyRate}/day
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
        Duration: {duration} days
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
