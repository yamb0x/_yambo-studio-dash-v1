import React from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import DraggableEvent from './DraggableEvent';

const WEEK_WIDTH = 200; // Fixed width for each week in pixels
const DAY_WIDTH = WEEK_WIDTH / 5; // Width of each day (assuming 5 working days)
const CHART_HEIGHT = 500; // Height of the entire chart

function GanttChart({ project, bookings }) {
  const startDate = moment(project.startDate);
  const endDate = moment(project.endDate);
  const duration = endDate.diff(startDate, 'weeks') + 1;

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
            flexShrink: 0, // Prevent week from shrinking
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
          flexShrink: 0, // Prevent week from shrinking
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
              flexShrink: 0, // Prevent day from shrinking
            }}
          >
            <Typography variant="caption">{day}</Typography>
          </Box>
        ))}
      </Box>
    ));
  };

  const renderBookings = () => {
    return bookings.map((booking, index) => (
      <DraggableEvent
        key={booking.id}
        booking={booking}
        project={project}
        weekWidth={WEEK_WIDTH}
        style={{ top: index * 30 }} // Adjust this value to change vertical spacing between bookings
      />
    ));
  };

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
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

export default GanttChart;
