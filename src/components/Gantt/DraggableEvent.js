import React, { useState, useCallback } from 'react';
import { Resizable } from 'react-resizable';
import Draggable from 'react-draggable';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import moment from 'moment';
import { useArtists } from '../../contexts/ArtistContext';

import 'react-resizable/css/styles.css';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  zIndex: 1,
  '&.react-resizable-handle-w': {
    left: 0,
    cursor: 'w-resize',
  },
  '&.react-resizable-handle-e': {
    right: 0,
    cursor: 'e-resize',
  },
}));

function DraggableEvent({ booking, project, weekWidth, index, onUpdate }) {
  const { artists } = useArtists();

  const [width, setWidth] = useState((moment(booking.endDate).diff(moment(booking.startDate), 'days') + 1) * (weekWidth / 7));
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const projectStart = moment(project.startDate);
  const bookingStart = moment(booking.startDate);

  const startOffset = bookingStart.diff(projectStart, 'days');
  const duration = moment(booking.endDate).diff(bookingStart, 'days') + 1;

  const backgroundColor = getRandomColor();

  const EVENT_HEIGHT = 70;
  const EVENT_MARGIN = 5;
  const INITIAL_OFFSET = 60;

  const artist = artists.find(a => a.id === booking.artistId);
  const dailyRate = artist ? artist.dailyRate : 'N/A';

  const handleResize = useCallback((e, { size, handle }) => {
    const newWidth = size.width;
    setWidth(newWidth);
    const newDuration = Math.round((newWidth / weekWidth) * 7);
    
    if (handle === 'w') {
      // Resizing from the left (start date)
      const newStartDate = moment(booking.endDate).subtract(newDuration - 1, 'days');
      onUpdate(project.id, {
        ...booking,
        startDate: newStartDate.format('YYYY-MM-DD'),
      });
    } else {
      // Resizing from the right (end date)
      const newEndDate = moment(booking.startDate).add(newDuration - 1, 'days');
      onUpdate(project.id, {
        ...booking,
        endDate: newEndDate.format('YYYY-MM-DD'),
      });
    }
  }, [booking, project.id, weekWidth, onUpdate]);

  const handleDrag = useCallback((e, { x }) => {
    setPosition({ x, y: 0 });
    const newStartOffset = Math.round((x / weekWidth) * 7);
    const newStartDate = moment(project.startDate).add(startOffset + newStartOffset, 'days');
    const newEndDate = moment(newStartDate).add(duration - 1, 'days');
    onUpdate(project.id, {
      ...booking,
      startDate: newStartDate.format('YYYY-MM-DD'),
      endDate: newEndDate.format('YYYY-MM-DD'),
    });
  }, [booking, duration, project.id, project.startDate, startOffset, weekWidth, onUpdate]);

  return (
    <Draggable
      axis="x"
      bounds="parent"
      position={position}
      onDrag={handleDrag}
      grid={[weekWidth / 7, 0]}
    >
      <Resizable
        width={width}
        height={EVENT_HEIGHT}
        onResize={handleResize}
        draggableOpts={{ grid: [weekWidth / 7, 0] }}
        minConstraints={[weekWidth / 7, EVENT_HEIGHT]}
        maxConstraints={[weekWidth * 52, EVENT_HEIGHT]}
        handle={(h, ref) => (
          <ResizeHandle className={`react-resizable-handle react-resizable-handle-${h}`} ref={ref} />
        )}
        handleSize={[8, 8]}
      >
        <Box
          sx={{
            position: 'absolute',
            left: (startOffset * weekWidth) / 7,
            width: width,
            height: EVENT_HEIGHT,
            backgroundColor: backgroundColor,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
            fontSize: '0.75rem',
            overflow: 'hidden',
            padding: '4px',
            top: INITIAL_OFFSET + index * (EVENT_HEIGHT + EVENT_MARGIN),
            zIndex: 10,
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
      </Resizable>
    </Draggable>
  );
}

export default DraggableEvent;
