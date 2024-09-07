import React, { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function ProjectForm({ project = {}, onClose }) {
  const { addProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    ...project
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (project.id) {
      updateProject(formData);
    } else {
      addProject(formData);
    }
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1 } }}>
      <TextField
        fullWidth
        label="Project Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <TextField
        fullWidth
        label="Start Date"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        fullWidth
        label="End Date"
        name="endDate"
        type="date"
        value={formData.endDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        {project.id ? 'Update Project' : 'Add Project'}
      </Button>
    </Box>
  );
}

export default ProjectForm;
