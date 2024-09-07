import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { useDrop } from 'react-dnd';
import ProjectList from '../components/Gantt/ProjectList';
import GanttChart from '../components/Gantt/GanttChart';
import ArtistList from '../components/Gantt/ArtistList';
import { useProjects } from '../contexts/ProjectContext';
import moment from 'moment';

function GanttView() {
  const { projects, addBooking } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [, forceUpdate] = useState();

  const handleAddBooking = useCallback((newBooking) => {
    addBooking(newBooking);
    forceUpdate({});
  }, [addBooking]);

  const [, drop] = useDrop({
    accept: 'ARTIST',
    drop: (item, monitor) => {
      if (selectedProject) {
        const dropPosition = monitor.getClientOffset();
        const ganttChartElement = document.getElementById('gantt-chart');
        const ganttRect = ganttChartElement.getBoundingClientRect();
        const dropX = dropPosition.x - ganttRect.left;
        
        const weekWidth = 200; // Make sure this matches the WEEK_WIDTH in GanttChart
        const droppedWeek = Math.floor(dropX / weekWidth);
        const startDate = moment(selectedProject.startDate).add(droppedWeek, 'weeks');
        const endDate = startDate.clone().add(6, 'days');

        const newBooking = {
          id: Date.now(),
          projectId: selectedProject.id,
          artistId: item.id,
          artistName: item.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        };

        handleAddBooking(newBooking);
      }
    },
  });

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%' }}>
      <Box sx={{ 
        width: '300px',
        borderRight: '1px solid #e0e0e0', 
        overflowY: 'auto',
        flexShrink: 0
      }}>
        <Paper elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
          <Typography variant="h6" sx={{ p: 2 }}>Projects</Typography>
          <ProjectList
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ p: 2 }}>Artists</Typography>
          <ArtistList />
        </Paper>
      </Box>
      <Box ref={drop} sx={{ flexGrow: 1, p: 2, overflowX: 'auto', overflowY: 'hidden' }}>
        <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
        {selectedProject ? (
          <GanttChart key={selectedProject.id} project={selectedProject} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Please select a project</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default GanttView;
