import React from 'react';
import { Box, Button } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectList({ 
  selectedProject, 
  onSelectProject, 
  barHeight = 50, 
  borderColor = '#ccc',
  highlightBackgroundColor = 'black',
  highlightTextColor = 'white'
}) {
  const { projects } = useProjects();

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%', 
      height: `${barHeight + 18}px`, // Increased height to include the additional 18px
      marginBottom: '-9px', // This will overlap the top border with the content above
      marginTop: '-9px', // This will overlap the bottom border with the content below
      marginLeft: '-9px', // This will overlap the left border with the content
      marginRight: '-9px', // This will overlap the right border with the content
    }}>
      {projects.map((project, index) => (
        <Button
          key={project.id}
          onClick={() => onSelectProject(project)}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(index / projects.length) * 100}%`,
            width: `${100 / projects.length}%`,
            height: '100%',
            borderRadius: 0,
            borderRight: index < projects.length - 1 ? `1px solid ${borderColor}` : 'none',
            padding: 0, // Remove default padding
            color: 'black', // Set default text color to black
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
              color: 'black', // Ensure text remains black on hover
            },
            ...(selectedProject && selectedProject.id === project.id && {
              backgroundColor: highlightBackgroundColor,
              color: highlightTextColor,
            }),
          }}
        >
          {project.name}
        </Button>
      ))}
    </Box>
  );
}

export default ProjectList;
