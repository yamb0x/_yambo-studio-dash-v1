import React from 'react';
import { Grid } from '@mui/material';
import ProjectCard from './ProjectCard';
import { useProjects } from '../contexts/ProjectContext';

function ProjectList() {
  const { projects, updateProject } = useProjects();

  const handleEditProject = (project) => {
    // Implement your edit logic here
    console.log('Editing project:', project);
  };

  return (
    <Grid container spacing={2}>
      {projects.map((project) => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <ProjectCard project={project} onEdit={handleEditProject} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProjectList;
