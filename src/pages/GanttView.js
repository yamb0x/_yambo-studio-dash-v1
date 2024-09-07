import React, { useState, useEffect } from 'react';
import { Grid, Typography } from '@mui/material';
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
      // This is a placeholder - replace with actual API call
      setBookings([]);
    }
  }, [selectedProject]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Typography variant="h6">Projects</Typography>
        <ProjectList
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
        <Typography variant="h6">Artists</Typography>
        <ArtistList />
      </Grid>
      <Grid item xs={9}>
        <Typography variant="h6">Gantt Chart</Typography>
        {selectedProject ? (
          <GanttChart project={selectedProject} bookings={bookings} />
        ) : (
          <Typography>Please select a project</Typography>
        )}
      </Grid>
    </Grid>
  );
}

export default GanttView;
