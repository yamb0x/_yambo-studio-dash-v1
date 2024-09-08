import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

const RESIZE_HANDLE_WIDTH = 10; // Width of the resize handle in pixels

function DraggableEvent({ booking, project, weekWidth, index, onUpdate, startDate, onDragStart }) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const eventRef = useRef(null);

  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const startOffset = bookingStart.diff(startDate, 'days');
  const adjustedStartOffset = startOffset - (Math.floor(startOffset / 7) * 2); // Adjust for weekends
  const duration = bookingEnd.diff(bookingStart, 'days') + 1;
  const adjustedDuration = calculateWorkingDays(bookingStart, bookingEnd);

  useEffect(() => {
    const element = eventRef.current;
    if (!element) return;

    const handleDragStart = (e) => {
      if (isResizing) {
        e.preventDefault();
        return;
      }

      e.dataTransfer.setData('text/plain', JSON.stringify(booking));
      e.dataTransfer.effectAllowed = 'move';
      
      const dragImage = document.createElement('div');
      dragImage.style.opacity = '0';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      onDragStart({...booking, duration: adjustedDuration});

      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
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
      const dayWidth = weekWidth / 5;

      if (resizeDirection === 'left') {
        const newStartOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newStartDate = startDate.clone().add(adjustedStartOffset + newStartOffset, 'days');
        if (newStartDate.isBefore(bookingEnd)) {
          onUpdate(project.id, {
            ...booking,
            startDate: newStartDate.format('YYYY-MM-DD'),
          });
        }
      } else if (resizeDirection === 'right') {
        const newEndOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newEndDate = startDate.clone().add(adjustedStartOffset + newEndOffset, 'days');
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
  }, [booking, onDragStart, adjustedDuration, isResizing, resizeDirection, onUpdate, project.id, startDate, adjustedStartOffset, weekWidth, bookingStart, bookingEnd]);

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

  function getWorkingDateRange(start, end) {
    let firstWorkingDay = start.clone();
    let lastWorkingDay = end.clone();

    while (firstWorkingDay.day() === 0 || firstWorkingDay.day() === 6) {
      firstWorkingDay.add(1, 'day');
    }

    while (lastWorkingDay.day() === 0 || lastWorkingDay.day() === 6) {
      lastWorkingDay.subtract(1, 'day');
    }

    return { firstWorkingDay, lastWorkingDay };
  }

  const { firstWorkingDay, lastWorkingDay } = getWorkingDateRange(bookingStart, bookingEnd);
  const totalCost = adjustedDuration * booking.dailyRate;

  return (
    <Box
      ref={eventRef}
      draggable={!isResizing}
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
        {booking.artistName} ({firstWorkingDay.format('DD/MM')} - {lastWorkingDay.format('DD/MM')})
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.8 }}>
        Working Days: {adjustedDuration} | Rate: ${booking.dailyRate.toFixed(2)} | Total: ${totalCost.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
