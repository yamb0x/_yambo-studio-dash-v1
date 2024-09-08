import React, { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 250; // Increased to accommodate 5 days
const CHART_HEIGHT = 400;
const DAY_WIDTH = WEEK_WIDTH / 5; // Now 5 days per week

function GanttChart({ project }) {
  const { projects, updateBooking } = useProjects();

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === project.id) || project;
  }, [projects, project.id]);

  const startDate = moment(currentProject.startDate).startOf('week');
  const endDate = moment(currentProject.endDate).endOf('week');
  const duration = endDate.diff(startDate, 'weeks') + 1;

  const handleUpdate = useCallback((projectId, updatedBooking) => {
    updateBooking(projectId, updatedBooking);
  }, [updateBooking]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const bookingData = e.dataTransfer.getData('text/plain');
    if (bookingData) {
      const booking = JSON.parse(bookingData);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newStartOffset = Math.floor(x / DAY_WIDTH);
      const newStartDate = startDate.clone().add(newStartOffset, 'days');
      const duration = moment(booking.endDate).diff(moment(booking.startDate), 'days');
      const newEndDate = newStartDate.clone().add(duration, 'days');

      handleUpdate(currentProject.id, {
        ...booking,
        startDate: newStartDate.format('YYYY-MM-DD'),
        endDate: newEndDate.format('YYYY-MM-DD'),
      });
    }
  }, [currentProject, handleUpdate, startDate]);

  const renderWeeks = () => {
    const weeks = [];
    for (let i = 0; i < duration; i++) {
      const weekStart = startDate.clone().add(i, 'weeks');
      weeks.push(
        <Box key={i} sx={{ width: WEEK_WIDTH, borderRight: '1px solid #ccc', flexShrink: 0, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ padding: '4px' }}>
            Week {weekStart.format('W')} ({weekStart.format('DD/MM')} - {weekStart.clone().add(4, 'days').format('DD/MM')})
          </Typography>
        </Box>
      );
    }
    return weeks;
  };

  const renderDayLabels = () => {
    const dayLabels = ['M', 'T', 'W', 'T', 'F'];
    return (
      <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
        {dayLabels.map((day, index) => (
          <Box key={index} sx={{ width: DAY_WIDTH, textAlign: 'center', flexShrink: 0 }}>
            <Typography variant="caption">{day}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < duration * 5; i++) {
      days.push(
        <Box
          key={i}
          sx={{
            width: DAY_WIDTH,
            height: '100%',
            borderRight: '1px solid #eee',
          }}
        />
      );
    }
    return days;
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
        startDate={startDate}
      />
    ));
  };

  const renderDeliveries = () => {
    return (currentProject.deliveries || []).map((delivery) => {
      const deliveryDate = moment(delivery.date);
      const offsetDays = deliveryDate.diff(startDate, 'days');
      const adjustedOffset = offsetDays - (Math.floor(offsetDays / 7) * 2); // Adjust for weekends
      return (
        <Box
          key={delivery.id}
          sx={{
            position: 'absolute',
            left: `${adjustedOffset * DAY_WIDTH}px`,
            top: 0,
            width: '2px',
            height: CHART_HEIGHT,
            background: 'linear-gradient(to bottom, rgba(255,0,0,0.2), rgba(255,0,0,1))',
            zIndex: 1000,
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: CHART_HEIGHT / 2,
              left: '50%',
              transform: 'translateX(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
              color: 'red',
              fontWeight: 300,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '2px 4px',
              borderRadius: '2px',
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: WEEK_WIDTH * duration }}>
        <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
          {renderWeeks()}
        </Box>
        {renderDayLabels()}
        <Box sx={{ display: 'flex', height: CHART_HEIGHT, position: 'relative' }}>
          {renderDays()}
          {renderBookings()}
          {renderDeliveries()}
        </Box>
      </Box>
    </Box>
  );
}

export default GanttChart;
