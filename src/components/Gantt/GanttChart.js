import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import moment from 'moment';
import { useDrop } from 'react-dnd';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 200;
const DAY_WIDTH = WEEK_WIDTH / 5;
const CHART_HEIGHT = 500;

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

  const handleDrop = (e) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData('bookingId');
    if (bookingId) {
      const booking = currentProject.bookings.find(b => b.id.toString() === bookingId);
      if (booking) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newStartOffset = Math.round((x / WEEK_WIDTH) * 7);
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
  };

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

  return (
    <Box 
      id="gantt-chart" 
      sx={{ overflowX: 'auto', overflowY: 'hidden' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc', minWidth: WEEK_WIDTH * duration }}>
        {renderWeeks()}
      </Box>
      <Box sx={{ display: 'flex', height: CHART_HEIGHT, position: 'relative', minWidth: WEEK_WIDTH * duration }}>
        {renderDays()}
        {renderBookings()}
      </Box>
    </Box>
  );
}

export default React.memo(GanttChart);
