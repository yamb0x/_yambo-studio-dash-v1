import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Select, MenuItem, Chip, InputLabel, FormControl } from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

const projectTypes = ['Commercial', 'Art', 'Studio'];

function ProjectForm({ project = {}, onClose }) {
  const { addProject, updateProject } = useProjects();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    projectType: [],
    ...project
  });
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleProjectTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prevData => ({
      ...prevData,
      projectType: typeof value === 'string' ? value.split(',') : value,
    }));
    setOpen(false);  // Close the dropdown after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (project.id) {
      // Make sure editingProject.id is correctly set
      await updateProject({ ...formData, id: project.id });
    } else {
      await addProject(formData);
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
      <TextField
        fullWidth
        label="Budget ($)"
        name="budget"
        type="number"
        value={formData.budget}
        onChange={handleChange}
        InputProps={{
          startAdornment: '$',
        }}
        required
      />
      <FormControl fullWidth>
        <InputLabel id="project-type-label">Project Type</InputLabel>
        <Select
          labelId="project-type-label"
          id="project-type"
          multiple
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          value={formData.projectType}
          onChange={handleProjectTypeChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {projectTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        {project.id ? 'Update Project' : 'Add Project'}
      </Button>
    </Box>
  );
}

export default ProjectForm;
