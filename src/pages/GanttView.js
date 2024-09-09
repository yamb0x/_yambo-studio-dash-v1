import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { COLORS } from '../constants'; // Make sure you have this file with color constants

const SIDE_PANEL_WIDTH = 300; // Set this to your desired width

function GanttView() {
  const { 
    projects, 
    addBooking, 
    removeBooking, 
    addDelivery, 
    editDelivery, 
    deleteDelivery,
    updateProjectBudget 
  } = useProjects();
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

  const handleEditDelivery = useCallback((updatedDelivery) => {
    if (selectedProject) {
      editDelivery(selectedProject.id, updatedDelivery);
      setSelectedProject(prevProject => ({
        ...prevProject,
        deliveries: prevProject.deliveries.map(delivery =>
          delivery.id === updatedDelivery.id ? updatedDelivery : delivery
        )
      }));
    }
  }, [selectedProject, editDelivery]);

  const handleDeleteDelivery = useCallback((deliveryId) => {
    if (selectedProject) {
      deleteDelivery(selectedProject.id, deliveryId);
      setSelectedProject(prevProject => ({
        ...prevProject,
        deliveries: prevProject.deliveries.filter(delivery => delivery.id !== deliveryId)
      }));
    }
  }, [selectedProject, deleteDelivery]);

  const handleUpdateBudget = useCallback((newBudget) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, budget: newBudget };
      // Update the project in your state or send to backend
      // For example:
      // updateProject(updatedProject);
      setSelectedProject(updatedProject);
    }
  }, [selectedProject]);

  const handleUpdateRevenue = useCallback((newRevenue) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, revenue: newRevenue };
      // Update the project in your state or send to backend
      // For example:
      // updateProject(updatedProject);
      setSelectedProject(updatedProject);
    }
  }, [selectedProject]);

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

  const handleAddDelivery = useCallback((newDelivery) => {
    if (selectedProject) {
      addDelivery(selectedProject.id, newDelivery);
      setSelectedProject(prevProject => ({
        ...prevProject,
        deliveries: [...(prevProject.deliveries || []), newDelivery]
      }));
    }
  }, [selectedProject, addDelivery]);

  const artistColors = useMemo(() => {
    if (!selectedProject || !selectedProject.bookings) {
      return {};
    }
    const artists = Array.from(new Set(selectedProject.bookings.map(b => b.artistName)));
    return artists.reduce((acc, artist, index) => {
      acc[artist] = COLORS[index % COLORS.length];
      return acc;
    }, {});
  }, [selectedProject]);

  const handleSelectProject = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleArtistDrop = useCallback((artist) => {
    // Implement the logic for handling artist drop
    console.log('Artist dropped:', artist);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', width: '100%' }}>
      <Box sx={{ borderBottom: '1px solid #e0e0e0', p: 1 }}>
        <ProjectList selectedProject={selectedProject} onSelectProject={handleSelectProject} />
      </Box>
      <Box sx={{ display: 'flex', height: '100%' }}> {/* Update this line */}
        {/* Left Panel */}
        <Box sx={{ 
          width: SIDE_PANEL_WIDTH, 
          overflowY: 'auto',
          marginRight: 4,
          borderRight: '1px solid #e0e0e0',
          paddingRight: 3,
        }}>
          <ArtistList
            artists={artists}
            onArtistDrop={handleArtistDrop}
          />
        </Box>

        {/* Center Panel (Gantt Chart) */}
        <Box ref={drop} sx={{ flex: 1, p: 2, overflowX: 'auto', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Gantt Chart</Typography>
          {selectedProject ? (
            <GanttChart key={selectedProject.id} project={selectedProject} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography>Please select a project</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Panel (former Right Panel) */}
      {selectedProject && (
        <Box sx={{ 
          height: '30%', // Adjust this value to change the height of the bottom panel
          borderTop: '1px solid #e0e0e0',
          overflowY: 'auto',
          display: 'flex',
        }}>
          <RightPanel 
            project={selectedProject} 
            onAddDelivery={handleAddDelivery}
            onEditDelivery={handleEditDelivery}
            onDeleteDelivery={handleDeleteDelivery}
            onUpdateBudget={handleUpdateBudget}
            onUpdateRevenue={handleUpdateRevenue}
            artistColors={artistColors} 
          />
        </Box>
      )}
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
