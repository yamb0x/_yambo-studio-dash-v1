import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProjectList from '../components/Gantt/ProjectList';
import GanttChart from '../components/Gantt/GanttChart';
import ArtistList from '../components/Gantt/ArtistList';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';

function GanttView() {
  const { projects } = useProjects();
  const { artists } = useArtists();
  const [selectedProject, setSelectedProject] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (selectedProject) {
      // Fetch bookings for the selected project
      // This is a placeholder - replace with actual API call or data fetching logic
      setBookings([]);
    }
  }, [selectedProject]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%' }}>
        <Box sx={{ 
          width: '300px', // Adjust this value to match the width of the title
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
        <Box sx={{ flexGrow: 1, p: 2, overflowX: 'auto', overflowY: 'hidden' }}>
          <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
          {selectedProject ? (
            <GanttChart project={selectedProject} bookings={bookings} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography>Please select a project</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </DndProvider>
  );
}

export default GanttView;
