import React, { useMemo, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 200;
const CHART_HEIGHT = 400;
const DAY_WIDTH = WEEK_WIDTH / 7; // Define DAY_WIDTH based on WEEK_WIDTH

function GanttChart({ project }) {
  const { projects, updateBooking } = useProjects();

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === project.id) || project;
  }, [projects, project.id]);

  const startDate = moment(currentProject.startDate);
  const endDate = moment(currentProject.endDate);
  const duration = endDate.diff(startDate, 'weeks') + 1;

  const handleUpdate = (projectId, updatedBooking) => {
    updateBooking(projectId, updatedBooking);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData('bookingId');
    if (bookingId) {
      const booking = currentProject.bookings.find(b => b.id.toString() === bookingId);
      if (booking) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newStartOffset = Math.round(x / DAY_WIDTH);
        const newStartDate = moment(currentProject.startDate).add(newStartOffset, 'days');
        const duration = moment(booking.endDate).diff(moment(booking.startDate), 'days');
        const newEndDate = newStartDate.clone().add(duration, 'days');

        handleUpdate(currentProject.id, {
          ...booking,
          startDate: newStartDate.format('YYYY-MM-DD'),
          endDate: newEndDate.format('YYYY-MM-DD'),
        });
      }
    }
  }, [currentProject, handleUpdate]);

  const renderWeeks = () => {
    return Array.from({ length: duration }, (_, index) => {
      const weekStart = startDate.clone().add(index, 'weeks');
      const weekEnd = weekStart.clone().add(4, 'days');
      return (
        <Box
          key={index}
          sx={{
            width: WEEK_WIDTH,
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography variant="body2">Week {index + 1}</Typography>
          <Typography variant="caption">
            {weekStart.format('D MMM')} - {weekEnd.format('D MMM')}
          </Typography>
        </Box>
      );
    });
  };

  const renderDays = () => {
    const days = ['M', 'T', 'W', 'T', 'F'];
    return Array.from({ length: duration }, (_, weekIndex) => (
      <Box
        key={weekIndex}
        sx={{
          width: WEEK_WIDTH,
          height: CHART_HEIGHT,
          display: 'flex',
          borderRight: '1px solid #ccc',
          flexShrink: 0,
        }}
      >
        {days.map((day, dayIndex) => (
          <Box
            key={`${weekIndex}-${dayIndex}`}
            sx={{
              width: DAY_WIDTH,
              height: '100%',
              borderRight: dayIndex < 4 ? '1px solid #eee' : 'none',
              display: 'flex',
              justifyContent: 'center',
              pt: 1,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption">{day}</Typography>
          </Box>
        ))}
      </Box>
    ));
  };

  const renderBookings = () => {
    return (currentProject.bookings || []).map((booking, index) => (
      <DraggableEvent
        key={booking.id}
        booking={booking}
        project={currentProject}
        weekWidth={WEEK_WIDTH}
        index={index}
        onUpdate={handleUpdate}
      />
    ));
  };

  const renderDeliveries = () => {
    return (project.deliveries || []).map((delivery, index) => {
      const deliveryDate = moment(delivery.date);
      const offsetDays = deliveryDate.diff(startDate, 'days');
      return (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: `${offsetDays * DAY_WIDTH}px`,
            top: 0,
            width: '2px', // Back to 2px width
            height: CHART_HEIGHT,
            background: 'linear-gradient(to bottom, rgba(255,0,0,0.2), rgba(255,0,0,1))', // Gradient effect
            zIndex: 1000,
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: CHART_HEIGHT / 2, // Position text in the middle of the line
              left: '50%',
              transform: 'translateX(-50%) rotate(-90deg)',
              transformOrigin: 'left center', // Adjust origin for center alignment
              whiteSpace: 'nowrap',
              fontSize: '0.875rem', // Smaller text (14px if base font size is 16px)
              color: 'red',
              fontWeight: 300, // Light weight font
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // Add a semi-transparent background
              padding: '2px 4px', // Add some padding
              borderRadius: '2px', // Rounded corners for the background
            }}
          >
            {delivery.name}
          </Typography>
        </Box>
      );
    });
  };

  return (
    <Box 
      id="gantt-chart" 
      sx={{ overflowX: 'auto', overflowY: 'hidden' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc', minWidth: WEEK_WIDTH * duration }}>
        {renderWeeks()}
      </Box>
      <Box sx={{ display: 'flex', height: CHART_HEIGHT, position: 'relative', minWidth: WEEK_WIDTH * duration }}>
        {renderDays()}
        {renderBookings()}
        {renderDeliveries()}
      </Box>
    </Box>
  );
}

export default GanttChart;
