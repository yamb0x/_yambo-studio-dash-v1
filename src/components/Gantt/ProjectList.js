import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectList({ 
  projects,
  selectedProject, 
  onSelectProject, 
  barHeight = 50, 
  borderColor = '#ccc',
  highlightBackgroundColor = 'black',
  highlightTextColor = 'white'
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%', 
      height: `${barHeight + 18}px`,
      marginBottom: '-9px',
      marginTop: '-9px',
      marginLeft: '-9px',
      marginRight: '-9px',
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
            borderRight: index < projects.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
            padding: 0,
            color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              color: theme.palette.text.primary,
            },
            ...(selectedProject && selectedProject.id === project.id && {
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
              color: theme.palette.text.primary,
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
