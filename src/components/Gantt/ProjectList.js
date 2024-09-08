import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectList({ selectedProject, onSelectProject }) {
  const { projects } = useProjects();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={selectedProject ? selectedProject.id : false} 
        onChange={(event, newValue) => {
          const project = projects.find(p => p.id === newValue);
          onSelectProject(project);
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {projects.map((project) => (
          <Tab key={project.id} label={project.name} value={project.id} />
        ))}
      </Tabs>
    </Box>
  );
}

export default ProjectList;
