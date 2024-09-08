import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

function ProjectTabs({ projects, selectedProject, onSelectProject }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs 
        value={selectedProject ? selectedProject.id : false} 
        onChange={(event, newValue) => {
          const selected = projects.find(p => p.id === newValue);
          onSelectProject(selected);
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {projects.map((project) => (
          <Tab
            key={project.id}
            label={project.name}
            value={project.id}
            sx={{
              color: selectedProject && selectedProject.id === project.id ? 'white' : 'inherit',
              backgroundColor: selectedProject && selectedProject.id === project.id ? 'black' : 'transparent',
              '&:hover': {
                backgroundColor: selectedProject && selectedProject.id === project.id ? 'black' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default ProjectTabs;
