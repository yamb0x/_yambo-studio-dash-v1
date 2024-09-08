import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectList({ selectedProject, onSelectProject }) {
  const { projects } = useProjects();

  return (
    <List>
      {projects.map((project) => (
        <ListItem
          button
          key={project.id}
          selected={selectedProject && selectedProject.id === project.id}
          onClick={() => onSelectProject(project)}
        >
          <ListItemText primary={project.name} />
        </ListItem>
      ))}
    </List>
  );
}

export default ProjectList;
