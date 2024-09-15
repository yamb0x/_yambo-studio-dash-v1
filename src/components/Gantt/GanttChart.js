import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import moment from 'moment';
import { Box, Typography } from '@mui/material';
import DraggableEvent from './DraggableEvent';
import { useProjects } from '../../contexts/ProjectContext';
import { COLORS } from '../../constants';

const WEEK_WIDTH = 250;
const DAY_WIDTH = WEEK_WIDTH / 5;
const WORKING_DAYS_PER_WEEK = 5;
const ROW_HEIGHT = 60;
const CHART_PADDING_TOP = 50;
const ARTIST_COLUMN_WIDTH = 150;
const TIMELINE_INDICATOR_WIDTH = 2;

function GanttChart({ project, onUpdateBooking, onDeleteBooking, onArtistDrop }) {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (chartRef.current) {
      setChartWidth(chartRef.current.offsetWidth);
    }
  }, []);

  const getDateFromPosition = useCallback((x) => {
    if (chartWidth === 0) return project.startDate; // Default to start date if width is not set

    const chartStart = moment(project.startDate);
    const chartEnd = moment(project.endDate);
    const totalDays = chartEnd.diff(chartStart, 'days');
    const daysFromStart = Math.floor((x / chartWidth) * totalDays);
    return moment(project.startDate).add(daysFromStart, 'days').format('YYYY-MM-DD');
  }, [chartWidth, project.startDate, project.endDate]);

  const [, drop] = useDrop({
    accept: 'ARTIST',
    drop: (item, monitor) => {
      console.log('Artist dropped in GanttChart:', item);
      const dropPos = monitor.getClientOffset();
      const chartRect = chartRef.current.getBoundingClientRect();
      const relativeX = dropPos.x - chartRect.left;
      const date = getDateFromPosition(relativeX);
      onArtistDrop(item, date);
    },
  });

  console.log('GanttChart render, project:', project);

  const { projects, updateBooking } = useProjects();
  const [draggedBooking, setDraggedBooking] = useState(null);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === project.id) || project;
  }, [projects, project.id]);

  const projectStartDate = moment(currentProject.startDate);
  const chartStartDate = projectStartDate.clone().startOf('isoWeek');
  const endDate = moment(currentProject.endDate).endOf('isoWeek');
  const totalDays = endDate.diff(chartStartDate, 'days') + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  const indicatorOffset = projectStartDate.diff(chartStartDate, 'days') * DAY_WIDTH;

  const groupedBookings = useMemo(() => {
    if (!currentProject || !currentProject.bookings || !Array.isArray(currentProject.bookings)) {
      return {};
    }

    return currentProject.bookings.reduce((acc, booking) => {
      if (!acc[booking.artistName]) {
        acc[booking.artistName] = [];
      }
      acc[booking.artistName].push(booking);
      return acc;
    }, {});
  }, [currentProject.bookings]);

  const artistColors = useMemo(() => {
    return Object.keys(groupedBookings).reduce((acc, artist, index) => {
      acc[artist] = COLORS[index % COLORS.length];
      return acc;
    }, {});
  }, [groupedBookings]);

  const handleUpdate = useCallback((projectId, updatedBooking) => {
    updateBooking(projectId, updatedBooking);
  }, [updateBooking]);

  const handleDragStart = useCallback((booking) => {
    setDraggedBooking(booking);
  }, []);

  const handleDeleteBooking = useCallback((bookingId) => {
    onDeleteBooking(project.id, bookingId);
  }, [onDeleteBooking, project.id]);

  const renderWeekHeaders = useCallback(() => {
    const weekHeaders = [];
    weekHeaders.push(
      <Box key="artist-column" sx={{ width: ARTIST_COLUMN_WIDTH, flexShrink: 0 }} />
    );

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    for (let week = 0; week < totalWeeks; week++) {
      const weekStart = chartStartDate.clone().add(week, 'weeks');
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
  }, [totalWeeks, chartStartDate]);

  const renderDays = useCallback(() => {
    const days = [];
    for (let i = 0; i < totalWeeks * WORKING_DAYS_PER_WEEK; i++) {
      const currentDate = chartStartDate.clone().add(i, 'days');
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
            backgroundColor: i % WORKING_DAYS_PER_WEEK === WORKING_DAYS_PER_WEEK - 1 ? '#ccc' : '#ccc',
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
  }, [totalWeeks, chartStartDate]);

  const renderGanttChart = useMemo(() => {
    return (
      <Box 
        id="gantt-chart" 
        sx={{ 
          overflowX: 'auto',
          overflowY: 'visible',
          position: 'relative',
          height: 'auto',
          minHeight: '100%',
          '& #drag-preview': {
            display: 'none !important',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: ARTIST_COLUMN_WIDTH + TIMELINE_INDICATOR_WIDTH + (WEEK_WIDTH * totalWeeks), 
          height: `${(Object.keys(groupedBookings).length * ROW_HEIGHT) + CHART_PADDING_TOP}px`,
          position: 'relative'
        }}>
          {/* Green Debug Indicator (Fixed at Gantt Start) */}
          <Box
            sx={{
              position: 'absolute',
              left: `${ARTIST_COLUMN_WIDTH}px`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: 'green',
              zIndex: 3,
            }}
          />
          {/* Week headers and Blue Timeline Indicator (Project Start) */}
          <Box 
            sx={{ 
              position: 'sticky', 
              top: 0, 
              zIndex: 2, 
              backgroundColor: 'white',
              marginLeft: `-${indicatorOffset}px`, // Shift headers to align with green indicator
            }}
          >
            <Box sx={{ display: 'flex', borderBottom: '1px solid #ccc', position: 'relative' }}>
              {renderWeekHeaders()}
              {/* Blue Timeline Indicator (Project Start) */}
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
            </Box>
          </Box>
          {/* Chart content */}
          <Box sx={{ 
            paddingTop: `${CHART_PADDING_TOP}px`, 
            position: 'relative', 
            height: `calc(100% - ${CHART_PADDING_TOP}px)`,
            '& .day-separator': {
              pointerEvents: 'none',
            },
            marginLeft: `-${indicatorOffset}px`, // Shift content to align with green indicator
          }}>
            {renderDays()}
            {Object.entries(groupedBookings).map(([artistName, bookings], index) => (
              <Box 
                key={artistName} 
                sx={{ 
                  position: 'absolute', 
                  top: `${index * ROW_HEIGHT}px`, 
                  left: 0, 
                  right: 0, 
                  height: `${ROW_HEIGHT}px`, 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                {bookings.map((booking) => (
                  <DraggableEvent
                    key={booking.id}
                    booking={booking}
                    project={currentProject}
                    weekWidth={WEEK_WIDTH}
                    dayWidth={DAY_WIDTH}
                    rowHeight={ROW_HEIGHT}
                    onUpdate={handleUpdate}
                    startDate={chartStartDate}
                    onDragStart={handleDragStart}
                    artistColumnWidth={ARTIST_COLUMN_WIDTH}
                    timelineIndicatorWidth={TIMELINE_INDICATOR_WIDTH}
                    projectStartDate={projectStartDate}
                    color={artistColors[artistName]}
                    artistName={artistName}
                    onDelete={handleDeleteBooking}
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
  }, [project, chartWidth, groupedBookings, artistColors, handleUpdate, handleDragStart, handleDeleteBooking, renderWeekHeaders, renderDays, draggedBooking, indicatorOffset, currentProject, projectStartDate, chartStartDate]);

  return (
    <div 
      ref={(node) => {
        chartRef.current = node;
        drop(node);
      }} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0, 0, 255, 0.1)' // Temporary blue background
      }}
    >
      {renderGanttChart}
    </div>
  );
}

export default GanttChart;
