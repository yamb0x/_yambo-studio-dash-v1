import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

const RESIZE_HANDLE_WIDTH = 10;

function DraggableEvent({ booking, project, weekWidth, dayWidth, rowHeight, onUpdate, startDate, onDragStart, artistColumnWidth, timelineIndicatorWidth }) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const eventRef = useRef(null);

  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);

  const startOffset = bookingStart.diff(startDate, 'days');
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;

  const getLeftPosition = () => {
    const workingDaysOffset = Math.floor(startOffset / 7) * 2; // Account for weekends
    return (startOffset - workingDaysOffset) * dayWidth;
  };

  const getWidth = () => {
    const workingDaysDuration = Math.ceil(duration / 7) * 5; // Ensure we cover full weeks
    return workingDaysDuration * dayWidth;
  };

  useEffect(() => {
    const element = eventRef.current;
    if (!element) return;

    const handleDragStart = (e) => {
      if (isResizing) {
        e.preventDefault();
        return;
      }
      onDragStart(booking);
    };

    const handleMouseDown = (e) => {
      const rect = element.getBoundingClientRect();
      const isLeftEdge = e.clientX - rect.left < RESIZE_HANDLE_WIDTH;
      const isRightEdge = rect.right - e.clientX < RESIZE_HANDLE_WIDTH;

      if (isLeftEdge) {
        setIsResizing(true);
        setResizeDirection('left');
      } else if (isRightEdge) {
        setIsResizing(true);
        setResizeDirection('right');
      }
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const rect = element.getBoundingClientRect();
      if (resizeDirection === 'left') {
        const newStartOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newStartDate = startDate.clone().add(startOffset + newStartOffset, 'days');
        if (newStartDate.isBefore(bookingEnd)) {
          onUpdate(project.id, {
            ...booking,
            startDate: newStartDate.format('YYYY-MM-DD'),
          });
        }
      } else if (resizeDirection === 'right') {
        const newEndOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newEndDate = startDate.clone().add(startOffset + newEndOffset, 'days');
        if (newEndDate.isAfter(bookingStart)) {
          onUpdate(project.id, {
            ...booking,
            endDate: newEndDate.format('YYYY-MM-DD'),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('dragstart', handleDragStart);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [booking, onDragStart, isResizing, resizeDirection, onUpdate, project.id, startDate, startOffset, dayWidth, bookingStart, bookingEnd]);

  return (
    <Box
      ref={eventRef}
      draggable={!isResizing}
      sx={{
        position: 'absolute',
        left: `${getLeftPosition()}px`,
        top: '5px',
        width: `${getWidth()}px`,
        height: `${rowHeight - 10}px`,
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        cursor: isResizing ? (resizeDirection === 'left' ? 'w-resize' : 'e-resize') : 'move',
        zIndex: 1000,
        overflow: 'hidden',
        padding: '2px 4px',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: `${RESIZE_HANDLE_WIDTH}px`,
          cursor: 'ew-resize',
        },
        '&::before': {
          left: 0,
        },
        '&::after': {
          right: 0,
        },
      }}
    >
      <Typography variant="body2" noWrap>
        {booking.artistName} ({bookingStart.format('DD/MM')} - {bookingEnd.format('DD/MM')})
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
        Days: {duration} | Rate: ${booking.dailyRate?.toFixed(2) || 'N/A'} | Total: ${(duration * (booking.dailyRate || 0)).toFixed(2)}
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
