import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectList({ selectedProject, onSelectProject }) {
  const { projects } = useProjects();

  return (
    <>
      <Typography variant="h6" sx={{ p: 2 }}>Projects</Typography>
      <List>
        {projects.map((project) => (
          <ListItem
            button
            key={project.id}
            onClick={() => onSelectProject(project)}
            sx={{
              backgroundColor: selectedProject && selectedProject.id === project.id ? 'black' : 'transparent',
              color: selectedProject && selectedProject.id === project.id ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: selectedProject && selectedProject.id === project.id ? 'black' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary={project.name}
              secondary={
                <Typography 
                  component="span" 
                  variant="body2"
                  sx={{ 
                    color: selectedProject && selectedProject.id === project.id ? 'rgba(255, 255, 255, 0.7)' : 'inherit' 
                  }}
                >
                  {`${project.bookings ? project.bookings.length : 0} bookings`}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default ProjectList;
