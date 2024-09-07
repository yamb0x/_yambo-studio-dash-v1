import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProjectList from '../components/Gantt/ProjectList';
import GanttChart from '../components/Gantt/GanttChart';
import ArtistList from '../components/Gantt/ArtistList';
import { useProjects } from '../contexts/ProjectContext';
import moment from 'moment';
import { useArtists } from '../contexts/ArtistContext';
import RightPanel from '../components/Gantt/RightPanel';

const SIDE_PANEL_WIDTH = 300; // Set this to your desired width

function GanttView() {
  const { projects, addBooking, removeBooking } = useProjects();
  const { artists } = useArtists();  // Add this line
  const [selectedProject, setSelectedProject] = useState(null);
  const [, forceUpdate] = useState();

  useEffect(() => {
    console.log("Selected Project:", selectedProject);
    console.log("Bookings:", selectedProject?.bookings);
  }, [selectedProject]);

  const handleAddBooking = useCallback((newBooking) => {
    addBooking(newBooking);
    forceUpdate({});
  }, [addBooking]);

  const handleRemoveBooking = useCallback((bookingId) => {
    if (selectedProject) {
      console.log("Removing booking:", bookingId);
      removeBooking(selectedProject.id, bookingId);
      setSelectedProject(prevProject => ({
        ...prevProject,
        bookings: prevProject.bookings.filter(booking => booking.id !== bookingId)
      }));
      forceUpdate({});
    }
  }, [removeBooking, selectedProject]);

  const [, drop] = useDrop({
    accept: 'ARTIST',
    drop: (item, monitor) => {
      if (selectedProject) {
        const dropPosition = monitor.getClientOffset();
        const ganttChartElement = document.getElementById('gantt-chart');
        const ganttRect = ganttChartElement.getBoundingClientRect();
        const dropX = dropPosition.x - ganttRect.left;
        
        const weekWidth = 200; // Make sure this matches the WEEK_WIDTH in GanttChart
        const droppedWeek = Math.floor(dropX / weekWidth);
        const startDate = moment(selectedProject.startDate).add(droppedWeek, 'weeks');
        const endDate = startDate.clone().add(6, 'days');

        const artist = artists.find(a => a.id === item.id);
        const dailyRate = parseFloat(artist ? artist.dailyRate : 0);

        const newBooking = {
          id: Date.now(),
          projectId: selectedProject.id,
          artistId: item.id,
          artistName: item.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          dailyRate: dailyRate,  // This should now be a number
        };

        handleAddBooking(newBooking);
      }
    },
  });

  const handleAddDelivery = (delivery) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        deliveries: [...(selectedProject.deliveries || []), delivery],
      };
      // Update the project in your state management system
      // This might involve calling a function from your ProjectContext
      // For example:
      // updateProject(updatedProject);
      setSelectedProject(updatedProject);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%' }}>
      {/* Left Panel */}
      <Box sx={{ 
        width: SIDE_PANEL_WIDTH,
        borderRight: '1px solid #e0e0e0', 
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ p: 2 }}>Projects</Typography>
          <ProjectList
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
        </Paper>
        <Paper elevation={0} sx={{ borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ p: 2 }}>Artists</Typography>
          <ArtistList />
        </Paper>
        <Paper elevation={0} sx={{ borderRadius: 0, flexGrow: 1, bgcolor: '#f0f0f0', minHeight: '200px' }}>
          <Typography variant="h6" sx={{ p: 2, bgcolor: '#e0e0e0' }}>Debug: Booked Artists</Typography>
          {selectedProject ? (
            selectedProject.bookings && selectedProject.bookings.length > 0 ? (
              <List>
                {selectedProject.bookings.map((booking) => (
                  <ListItem
                    key={booking.id}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => {
                          console.log("Delete button clicked for booking:", booking.id);
                          handleRemoveBooking(booking.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={booking.artistName}
                      secondary={`${booking.startDate} - ${booking.endDate}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ p: 2 }}>No bookings for this project</Typography>
            )
          ) : (
            <Typography sx={{ p: 2 }}>Select a project to see bookings</Typography>
          )}
        </Paper>
      </Box>

      {/* Center Panel (Gantt Chart) */}
      <Box ref={drop} sx={{ flex: 1, p: 2, overflowX: 'auto', overflowY: 'hidden' }}>
        <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
        {selectedProject ? (
          <GanttChart key={selectedProject.id} project={selectedProject} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography>Please select a project</Typography>
          </Box>
        )}
      </Box>

      {/* Right Panel */}
      <Box sx={{ 
        width: SIDE_PANEL_WIDTH, 
        borderLeft: '1px solid #e0e0e0',
        flexShrink: 0,
        overflowY: 'auto'
      }}>
        {selectedProject && (
          <RightPanel 
            project={selectedProject} 
            onAddDelivery={handleAddDelivery}
          />
        )}
      </Box>
    </Box>
  );
}

export default function WrappedGanttView() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GanttView />
    </DndProvider>
  );
}
