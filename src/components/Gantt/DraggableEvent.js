import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

function DraggableEvent({ booking, project, weekWidth, dayWidth, rowHeight, onUpdate, startDate, onDragStart, artistColumnWidth, timelineIndicatorWidth, projectStartDate }) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const eventRef = useRef(null);
  const [eventWidth, setEventWidth] = useState(0);
  const [eventLeft, setEventLeft] = useState(0);

  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);

  useEffect(() => {
    const startOffset = bookingStart.diff(startDate, 'days');
    const duration = bookingEnd.diff(bookingStart, 'days') + 1;
    setEventLeft(artistColumnWidth + (startOffset * dayWidth));
    setEventWidth(duration * dayWidth);
  }, [booking, startDate, artistColumnWidth, dayWidth]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
      onDragStart(booking);
    }
  };

  const handleMouseMove = (e) => {
    if (!isResizing && !isDragging) return;

    const rect = eventRef.current.parentElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - artistColumnWidth;
    
    if (isResizing) {
      const newWidth = Math.max(dayWidth, offsetX - eventLeft + artistColumnWidth);
      setEventWidth(newWidth);
    } else if (isDragging) {
      const newLeft = Math.max(artistColumnWidth, offsetX);
      setEventLeft(newLeft);
    }
  };

  const handleMouseUp = () => {
    if (isResizing || isDragging) {
      const newStartDate = moment(startDate).add(Math.round((eventLeft - artistColumnWidth) / dayWidth), 'days');
      const newEndDate = moment(newStartDate).add(Math.round(eventWidth / dayWidth) - 1, 'days');

      onUpdate(project.id, {
        ...booking,
        startDate: newStartDate.format('YYYY-MM-DD'),
        endDate: newEndDate.format('YYYY-MM-DD')
      });

      setIsResizing(false);
      setIsDragging(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, eventLeft, eventWidth]);

  const getDateFromPosition = (position) => {
    const dayOffset = Math.round((position - artistColumnWidth) / dayWidth);
    return moment(startDate).add(dayOffset, 'days');
  };

  return (
    <Box
      ref={eventRef}
      draggable={false}
      onMouseDown={handleMouseDown}
      sx={{
        position: 'absolute',
        left: `${eventLeft}px`,
        top: '5px',
        width: `${eventWidth}px`,
        height: `${rowHeight - 10}px`,
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        border: '1px solid #007bff',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'none',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        {getDateFromPosition(eventLeft).format('DD/MM/YYYY')}
      </Typography>
      <Typography variant="caption">
        {booking.startDate} - {booking.endDate}
      </Typography>
      <Box
        className="resize-handle"
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          cursor: 'ew-resize',
        }}
      />
    </Box>
  );
}

export default DraggableEvent;
