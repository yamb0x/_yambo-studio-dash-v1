import React, { useMemo, useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 250;
const DAY_WIDTH = WEEK_WIDTH / 5;
const ROW_HEIGHT = 60;
const CHART_PADDING_TOP = 50;

function GanttChart({ project }) {
  const { projects, updateBooking } = useProjects();
  const [draggedBooking, setDraggedBooking] = useState(null);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === project.id) || project;
  }, [projects, project.id]);

  const startDate = moment(currentProject.startDate).startOf('week');
  const endDate = moment(currentProject.endDate).endOf('week');
  const duration = endDate.diff(startDate, 'weeks') + 1;

  // Group bookings by artist
  const groupedBookings = useMemo(() => {
    const groups = {};
    currentProject.bookings.forEach(booking => {
      if (!groups[booking.artistName]) {
        groups[booking.artistName] = [];
      }
      groups[booking.artistName].push(booking);
    });
    return groups;
  }, [currentProject.bookings]);

  const handleUpdate = useCallback((projectId, updatedBooking) => {
    updateBooking(projectId, updatedBooking);
  }, [updateBooking]);

  const handleDragStart = useCallback((booking) => {
    setDraggedBooking(booking);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (draggedBooking) {
      const ganttChartElement = document.getElementById('gantt-chart');
      const rect = ganttChartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newStartOffset = Math.floor(x / DAY_WIDTH);
      
      const dragPreview = document.getElementById('drag-preview');
      if (dragPreview) {
        dragPreview.style.left = `${newStartOffset * DAY_WIDTH}px`;
      }
    }
  }, [draggedBooking]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (draggedBooking) {
      const ganttChartElement = document.getElementById('gantt-chart');
      const rect = ganttChartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newStartOffset = Math.floor(x / DAY_WIDTH);
      const newStartDate = startDate.clone().add(newStartOffset, 'days');
      const duration = moment(draggedBooking.endDate).diff(moment(draggedBooking.startDate), 'days');
      const newEndDate = newStartDate.clone().add(duration, 'days');

      handleUpdate(currentProject.id, {
        ...draggedBooking,
        startDate: newStartDate.format('YYYY-MM-DD'),
        endDate: newEndDate.format('YYYY-MM-DD'),
      });

      setDraggedBooking(null);
    }
  }, [currentProject.id, draggedBooking, handleUpdate, startDate]);

  const renderWeeks = () => {
    const weeks = [];
    for (let i = 0; i < duration; i++) {
      const weekStart = startDate.clone().add(i, 'weeks');
      weeks.push(
        <Box key={i} sx={{ width: WEEK_WIDTH, borderRight: '1px solid #ccc', textAlign: 'center', padding: '5px' }}>
          Week {weekStart.format('DD/MM')}
        </Box>
      );
    }
    return weeks;
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < duration * 5; i++) {
      days.push(
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: i * DAY_WIDTH,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: i % 5 === 4 ? '#ccc' : '#eee',
          }}
        />
      );
    }
    return days;
  };

  const renderDeliveries = () => {
    // ... (keep existing renderDeliveries function)
  };

  return (
    <Box 
      id="gantt-chart" 
      sx={{ overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: WEEK_WIDTH * duration, 
        height: (Object.keys(groupedBookings).length * ROW_HEIGHT) + CHART_PADDING_TOP,
        position: 'relative'
      }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
            {renderWeeks()}
          </Box>
        </Box>
        <Box sx={{ paddingTop: CHART_PADDING_TOP, position: 'relative' }}>
          {renderDays()}
          {Object.entries(groupedBookings).map(([artistName, bookings], artistIndex) => (
            <Box 
              key={artistName} 
              sx={{ 
                position: 'absolute', 
                top: artistIndex * ROW_HEIGHT, 
                left: 0, 
                right: 0, 
                height: ROW_HEIGHT, 
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Typography 
                sx={{ 
                  position: 'sticky', 
                  left: 0, 
                  width: '150px', 
                  paddingLeft: '10px',
                  backgroundColor: 'white',
                  zIndex: 1
                }}
              >
                {artistName}
              </Typography>
              {bookings.map((booking) => (
                <DraggableEvent
                  key={booking.id}
                  booking={booking}
                  project={currentProject}
                  weekWidth={WEEK_WIDTH}
                  dayWidth={DAY_WIDTH}
                  rowHeight={ROW_HEIGHT}
                  onUpdate={handleUpdate}
                  startDate={startDate}
                  onDragStart={handleDragStart}
                />
              ))}
            </Box>
          ))}
          {renderDeliveries()}
        </Box>
      </Box>
      {draggedBooking && (
        <Box
          id="drag-preview"
          sx={{
            position: 'absolute',
            height: `${ROW_HEIGHT - 10}px`,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            border: '2px dashed #007bff',
            pointerEvents: 'none',
            zIndex: 1001,
          }}
        />
      )}
    </Box>
  );
}

export default GanttChart;
