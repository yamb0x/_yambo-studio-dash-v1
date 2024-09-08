import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';

const RESIZE_HANDLE_WIDTH = 10; // Width of the resize handle in pixels

function DraggableEvent({ booking, project, weekWidth, dayWidth, rowHeight, onUpdate, startDate, onDragStart }) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const eventRef = useRef(null);

  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const projectStart = moment(startDate);

  const startOffset = calculateWorkingDayOffset(projectStart, bookingStart);
  const duration = calculateWorkingDays(bookingStart, bookingEnd);

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
      
      onDragStart({...booking, duration});

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
      if (resizeDirection === 'left') {
        const newStartOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newStartDate = calculateWorkingDayDate(projectStart, startOffset + newStartOffset);
        if (newStartDate.isBefore(bookingEnd)) {
          onUpdate(project.id, {
            ...booking,
            startDate: newStartDate.format('YYYY-MM-DD'),
          });
        }
      } else if (resizeDirection === 'right') {
        const newEndOffset = Math.round((e.clientX - rect.left) / dayWidth);
        const newEndDate = calculateWorkingDayDate(projectStart, startOffset + newEndOffset);
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
  }, [booking, onDragStart, duration, isResizing, resizeDirection, onUpdate, project.id, startDate, startOffset, weekWidth, bookingStart, bookingEnd, projectStart]);

  function calculateWorkingDayOffset(start, end) {
    let days = 0;
    let current = start.clone().startOf('day');
    while (current.isBefore(end, 'day')) {
      if (current.day() !== 0 && current.day() !== 6) {
        days++;
      }
      current.add(1, 'day');
    }
    return days;
  }

  function calculateWorkingDays(start, end) {
    let days = 0;
    let current = start.clone().startOf('day');
    while (current.isSameOrBefore(end, 'day')) {
      if (current.day() !== 0 && current.day() !== 6) {
        days++;
      }
      current.add(1, 'day');
    }
    return days;
  }

  function calculateWorkingDayDate(baseDate, offset) {
    let date = baseDate.clone().startOf('day');
    let daysAdded = 0;
    while (daysAdded < offset) {
      date.add(1, 'day');
      if (date.day() !== 0 && date.day() !== 6) {
        daysAdded++;
      }
    }
    return date;
  }

  return (
    <Box
      ref={eventRef}
      draggable={!isResizing}
      sx={{
        position: 'absolute',
        left: `${(startOffset / 5) * weekWidth}px`,
        top: index * 40 + 10,
        width: `${(duration / 5) * weekWidth}px`,
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
        Working Days: {duration} | Rate: ${booking.dailyRate.toFixed(2)} | Total: ${(duration * booking.dailyRate).toFixed(2)}
      </Typography>
    </Box>
  );
}

export default DraggableEvent;
