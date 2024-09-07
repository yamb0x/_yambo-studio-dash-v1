import React, { useCallback } from 'react';
import { Resizable } from 'react-resizable';
import Draggable from 'react-draggable';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useArtists } from '../../contexts/ArtistContext';

import 'react-resizable/css/styles.css';

function DraggableEvent({ booking, project, weekWidth, index, onUpdate }) {
  const { artists } = useArtists();

  const projectStart = moment(project.startDate);
  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;

  const startOffset = bookingStart.diff(projectStart, 'days');
  const position = { x: (startOffset * weekWidth) / 7, y: 0 };

  const handleDrag = useCallback((e, ui) => {
    const { x } = ui;
    const newStartOffset = Math.round(x / (weekWidth / 7));
    const newStartDate = moment(project.startDate).add(newStartOffset, 'days');
    const newEndDate = moment(newStartDate).add(duration - 1, 'days');
    
    onUpdate(project.id, {
      ...booking,
      startDate: newStartDate.format('YYYY-MM-DD'),
      endDate: newEndDate.format('YYYY-MM-DD'),
    });
  }, [booking, project.id, project.startDate, weekWidth, duration, onUpdate]);

  const handleResize = useCallback((e, { size }) => {
    const newWidth = size.width;
    const newDuration = Math.round((newWidth / weekWidth) * 7);
    const newEndDate = moment(booking.startDate).add(newDuration - 1, 'days');
    
    onUpdate(project.id, {
      ...booking,
      endDate: newEndDate.format('YYYY-MM-DD'),
    });
  }, [booking, project.id, weekWidth, onUpdate]);

  const width = duration * (weekWidth / 7);

  return (
    <Draggable
      axis="x"
      bounds="parent"
      position={position}
      onStop={handleDrag}
      grid={[weekWidth / 7, 0]}
    >
      <Resizable
        width={width}
        height={70}
        onResize={handleResize}
        draggableOpts={{ grid: [weekWidth / 7, 0] }}
        minConstraints={[weekWidth / 7, 70]}
        maxConstraints={[weekWidth * 52, 70]}
        handle={<div className="react-resizable-handle react-resizable-handle-e" />}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
          }}
        >
          <Typography variant="caption">{booking.artistName}</Typography>
          <Typography variant="caption">{bookingStart.format('MMM D')} - {bookingEnd.format('MMM D')}</Typography>
          <Typography variant="caption">Debug: {startOffset} days from project start</Typography>
        </Box>
      </Resizable>
    </Draggable>
  );
}

export default DraggableEvent;
