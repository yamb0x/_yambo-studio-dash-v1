import React, { useMemo, useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 250;
const DAY_WIDTH = WEEK_WIDTH / 5;
const WORKING_DAYS_PER_WEEK = 5;
const ROW_HEIGHT = 60;
const CHART_PADDING_TOP = 50;
const ARTIST_COLUMN_WIDTH = 150;
const TIMELINE_INDICATOR_WIDTH = 2;

function GanttChart({ project }) {
  const { projects, updateBooking } = useProjects();
  const [draggedBooking, setDraggedBooking] = useState(null);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === project.id) || project;
  }, [projects, project.id]);

  const projectStartDate = moment(currentProject.startDate);
  const startDate = projectStartDate.clone().startOf('isoWeek');
  const endDate = moment(currentProject.endDate).endOf('isoWeek');
  const totalDays = endDate.diff(startDate, 'days') + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  const indicatorOffset = projectStartDate.diff(startDate, 'days') * DAY_WIDTH;

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

  const renderWeekHeaders = () => {
    const weekHeaders = [];
    weekHeaders.push(
      <Box key="artist-column" sx={{ width: ARTIST_COLUMN_WIDTH, flexShrink: 0 }} />
    );

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    for (let week = 0; week < totalWeeks; week++) {
      const weekStart = startDate.clone().add(week, 'weeks');
      const weekEnd = weekStart.clone().add(4, 'days');
      
      weekHeaders.push(
        <Box 
          key={week} 
          sx={{ 
            width: WEEK_WIDTH, 
            borderRight: '1px solid #ccc', 
            borderLeft: week === 0 ? '1px solid #ccc' : 'none',
            textAlign: 'center', 
            padding: '5px 5px 15px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', marginBottom: '5px' }}>
            Week {week + 1} ({weekStart.format('DD/MM')} - {weekEnd.format('DD/MM')})
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {dayNames.map((day, index) => (
              <Typography key={index} variant="caption" sx={{ width: `${DAY_WIDTH}px`, textAlign: 'center' }}>
                {day}
              </Typography>
            ))}
          </Box>
          {[0, 1, 2, 3, 4].map(day => (
            <Box
              key={day}
              sx={{
                position: 'absolute',
                left: `${day * DAY_WIDTH}px`,
                bottom: 0,
                width: '1px',
                height: '5px',
                backgroundColor: '#ccc'
              }}
            />
          ))}
        </Box>
      );
    }
    return weekHeaders;
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < totalWeeks * WORKING_DAYS_PER_WEEK; i++) {
      const currentDate = startDate.clone().add(i, 'days');
      days.push(
        <Box
          key={i}
          className="day-separator"
          sx={{
            position: 'absolute',
            left: `${i * DAY_WIDTH}px`,
            top: 0,
            bottom: 0,
            width: '1px !important',
            backgroundColor: i % WORKING_DAYS_PER_WEEK === WORKING_DAYS_PER_WEEK - 1 ? '#ccc' : '#eee',
            height: '100% !important',
            zIndex: 1,
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: '-20px', 
              left: '2px', 
              fontSize: '0.7rem' 
            }}
          >
            {currentDate.format('DD')}
          </Typography>
        </Box>
      );
    }
    return days;
  };

  return (
    <Box 
      id="gantt-chart" 
      sx={{ 
        overflowX: 'auto',
        overflowY: 'visible',
        position: 'relative',
        height: 'auto',
        minHeight: '100%'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: ARTIST_COLUMN_WIDTH + TIMELINE_INDICATOR_WIDTH + (WEEK_WIDTH * totalWeeks), 
        height: `${(Object.keys(groupedBookings).length * ROW_HEIGHT) + CHART_PADDING_TOP}px`,
        position: 'relative'
      }}>
        {/* Timeline Indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: `${ARTIST_COLUMN_WIDTH + indicatorOffset}px`,
            top: 0,
            bottom: 0,
            width: `${TIMELINE_INDICATOR_WIDTH}px`,
            backgroundColor: 'blue',
            zIndex: 3,
          }}
        />
        {/* Week headers */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
            {renderWeekHeaders()}
          </Box>
        </Box>
        {/* Chart content */}
        <Box sx={{ 
          paddingTop: `${CHART_PADDING_TOP}px`, 
          position: 'relative', 
          height: `calc(100% - ${CHART_PADDING_TOP}px)`,
          '& .day-separator': {
            pointerEvents: 'none',
          }
        }}>
          {renderDays()}
          {Object.entries(groupedBookings).map(([artistName, bookings], artistIndex) => (
            <Box 
              key={artistName} 
              sx={{ 
                position: 'absolute', 
                top: `${artistIndex * ROW_HEIGHT}px`, 
                left: 0, 
                right: 0, 
                height: `${ROW_HEIGHT}px`, 
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <Typography 
                sx={{ 
                  position: 'sticky', 
                  left: 0, 
                  width: ARTIST_COLUMN_WIDTH,
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
                  artistColumnWidth={ARTIST_COLUMN_WIDTH}
                  timelineIndicatorWidth={TIMELINE_INDICATOR_WIDTH}
                  projectStartDate={projectStartDate}
                />
              ))}
            </Box>
          ))}
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
