import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useDrop } from 'react-dnd';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';

const WEEK_WIDTH = 200; // Fixed width for each week in pixels
const DAY_WIDTH = WEEK_WIDTH / 5; // Width of each day (assuming 5 working days)
const CHART_HEIGHT = 500; // Height of the entire chart

function GanttChart({ project, bookings: initialBookings }) {
  const { updateBooking, addBooking } = useProjects();
  const [bookings, setBookings] = useState(initialBookings || []);

  useEffect(() => {
    setBookings(initialBookings || []);
  }, [initialBookings]);

  const startDate = moment(project.startDate);
  const endDate = moment(project.endDate);
  const duration = endDate.diff(startDate, 'weeks') + 1;

  const [, drop] = useDrop({
    accept: ['BOOKING', 'ARTIST'],
    drop: (item, monitor) => {
      const dropPosition = monitor.getClientOffset();
      const chartRect = document.getElementById('gantt-chart').getBoundingClientRect();
      const dropX = dropPosition.x - chartRect.left;
      const dropY = dropPosition.y - chartRect.top;

      const droppedWeek = Math.floor(dropX / WEEK_WIDTH);
      const droppedDay = Math.floor((dropX % WEEK_WIDTH) / DAY_WIDTH);
      const droppedDate = startDate.clone().add(droppedWeek, 'weeks').add(droppedDay, 'days');

      if (item.type === 'BOOKING') {
        const updatedBooking = {
          ...item.booking,
          startDate: droppedDate.format('YYYY-MM-DD'),
          endDate: droppedDate.clone().add(moment(item.booking.endDate).diff(moment(item.booking.startDate), 'days'), 'days').format('YYYY-MM-DD'),
        };
        updateBooking(updatedBooking);
        setBookings(prevBookings => prevBookings.map(booking => booking.id === updatedBooking.id ? updatedBooking : booking));
      } else if (item.type === 'ARTIST') {
        const newBooking = {
          id: Date.now(),
          projectId: project.id,
          artistId: item.id,
          artistName: item.name,
          startDate: droppedDate.format('YYYY-MM-DD'),
          endDate: droppedDate.clone().add(7, 'days').format('YYYY-MM-DD'),
        };
        addBooking(newBooking);
        setBookings(prevBookings => [...prevBookings, newBooking]);
      }
    },
  });

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
    <Box ref={drop} id="gantt-chart" sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
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
