import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, Divider, Box } from '@mui/material';
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
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Projects</Typography>
            <ProjectList
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Artists</Typography>
            <ArtistList />
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Paper elevation={3} sx={{ p: 2, height: '100%', overflowX: 'auto' }}>
            <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
            {selectedProject ? (
              <GanttChart project={selectedProject} bookings={bookings} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Please select a project</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </DndProvider>
  );
}

export default GanttView;
