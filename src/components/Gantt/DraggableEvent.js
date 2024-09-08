import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Link } from '@mui/material';
import moment from 'moment';

function DraggableEvent({ booking, project, weekWidth, dayWidth, rowHeight, onUpdate, startDate, onDragStart, artistColumnWidth, timelineIndicatorWidth, projectStartDate, color, artistName }) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const eventRef = useRef(null);
  const [eventWidth, setEventWidth] = useState(0);
  const [eventLeft, setEventLeft] = useState(0);

  const bookingStart = moment(booking.startDate);
  const bookingEnd = moment(booking.endDate);
  const numberOfDays = bookingEnd.diff(bookingStart, 'days') + 1;
  const dailyRate = booking.dailyRate || 0;
  const totalCost = dailyRate * numberOfDays;

  useEffect(() => {
    const startOffset = bookingStart.diff(startDate, 'days');
    setEventLeft(artistColumnWidth + (startOffset * dayWidth));
    setEventWidth(numberOfDays * dayWidth);
  }, [booking, startDate, artistColumnWidth, dayWidth, numberOfDays]);

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

  const handleArtistClick = (e) => {
    e.stopPropagation(); // Prevent dragging when clicking the link
  };

  const formatUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
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
        backgroundColor: color,
        border: `1px solid ${color}`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: 'none',
        padding: '2px',
        overflow: 'hidden',
      }}
    >
      <Link
        href={formatUrl(booking.artistWebsite)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleArtistClick}
        sx={{
          textDecoration: 'underline',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          '&:hover': {
            color: '#0056b3',
          },
        }}
      >
        {artistName}
      </Link>
      <Typography variant="caption" sx={{ color: '#000', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
        {`$${dailyRate} x ${numberOfDays} = $${totalCost}`}
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
