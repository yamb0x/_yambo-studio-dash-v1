import React from 'react';
import { Paper, Typography } from '@mui/material';

function GanttChart({ project, bookings }) {
  return (
    <Paper style={{ padding: '1rem', minHeight: '200px' }}>
      <Typography variant="h6">Gantt Chart for {project.name}</Typography>
      <Typography>Start Date: {project.startDate}</Typography>
      <Typography>End Date: {project.endDate}</Typography>
      <Typography>Number of Bookings: {bookings.length}</Typography>
      {/* Implement actual Gantt chart visualization here */}
    </Paper>
  );
}

export default GanttChart;
