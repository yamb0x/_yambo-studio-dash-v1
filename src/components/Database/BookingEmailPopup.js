import React, { useState, useMemo } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Select, MenuItem, Snackbar, Alert 
} from '@mui/material';
import { useProjects } from '../../contexts/ProjectContext';

function BookingEmailPopup({ open, onClose, artistName }) {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

    return projects.filter(project => {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);

      return (
        (startDate <= currentDate && endDate >= currentDate) || // Current projects
        (startDate > currentDate && startDate <= oneMonthFromNow) // Projects starting within a month
      );
    });
  }, [projects]);

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const copyTemplateEmail = () => {
    if (!selectedProject) return;

    const project = filteredProjects.find(p => p.id === selectedProject);
    const firstName = artistName.split(' ')[0];
    const emailTemplate = `Hi there ${firstName},

Clem from Yambo Studio here, I hope you are well!

I'm reaching out because we have an upcoming production that will take place between the ${project.startDate} to ${project.endDate} and we'd love to know if you have availability during this period.

If you are interested, please let me know your availability, and we can discuss the details further based on the project requirements

Hope to hear from you soon!

Thanks and best,
Clem`;

    navigator.clipboard.writeText(emailTemplate).then(() => {
      setSnackbarOpen(true);
      onClose();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Choose Project for Booking</DialogTitle>
        <DialogContent>
          <Select
            value={selectedProject}
            onChange={handleProjectChange}
            fullWidth
          >
            {filteredProjects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={copyTemplateEmail} disabled={!selectedProject}>
            Copy Template Email
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          The template email was successfully copied to your clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}

export default BookingEmailPopup;
