import React, { useState, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import ProjectTabs from '../components/Gantt/ProjectTabs';
import ArtistList from '../components/Gantt/ArtistList';
import GanttChart from '../components/Gantt/GanttChart';
import RightPanel from '../components/Gantt/RightPanel';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { COLORS } from '../constants';

const SIDE_PANEL_WIDTH = 300;

function GanttView() {
  const { projects, addProject, updateProject } = useProjects();
  const { artists } = useArtists();
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSelectProject = useCallback((project) => {
    if (project && project.id) {
      setSelectedProject(project);
    }
  }, []);

  const handleAddProject = useCallback((newProject) => {
    addProject(newProject);
  }, [addProject]);

  const handleUpdateBooking = useCallback((updatedBooking) => {
    if (selectedProject) {
      const updatedBookings = selectedProject.bookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      );
      const updatedProject = { ...selectedProject, bookings: updatedBookings };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleDeleteBooking = useCallback((bookingId) => {
    if (selectedProject) {
      const updatedBookings = selectedProject.bookings.filter(booking => booking.id !== bookingId);
      const updatedProject = { ...selectedProject, bookings: updatedBookings };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleAddDelivery = useCallback((newDelivery) => {
    if (selectedProject) {
      const updatedDeliveries = [...selectedProject.deliveries, newDelivery];
      const updatedProject = { ...selectedProject, deliveries: updatedDeliveries };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleEditDelivery = useCallback((updatedDelivery) => {
    if (selectedProject) {
      const updatedDeliveries = selectedProject.deliveries.map(delivery =>
        delivery.id === updatedDelivery.id ? updatedDelivery : delivery
      );
      const updatedProject = { ...selectedProject, deliveries: updatedDeliveries };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleDeleteDelivery = useCallback((deliveryId) => {
    if (selectedProject) {
      const updatedDeliveries = selectedProject.deliveries.filter(delivery => delivery.id !== deliveryId);
      const updatedProject = { ...selectedProject, deliveries: updatedDeliveries };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleUpdateBudget = useCallback((newBudget) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, budget: newBudget };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

  const handleUpdateRevenue = useCallback((newRevenue) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, revenue: newRevenue };
      setSelectedProject(updatedProject);
      updateProject(updatedProject);
    }
  }, [selectedProject, updateProject]);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', width: '100%' }}>
      <ProjectTabs
        projects={projects || []}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
      />
      <Box sx={{ display: 'flex', height: 'calc(100% - 48px)' }}>
        {/* Left Panel */}
        <Box sx={{ width: SIDE_PANEL_WIDTH, borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
          <ArtistList
            artists={artists || []}
            onArtistDrop={handleArtistDrop}
          />
        </Box>

        {/* Main Gantt Chart Area */}
        <Box sx={{ flex: 1, overflowX: 'auto' }}>
          {selectedProject && (
            <GanttChart
              project={selectedProject}
              onUpdateBooking={handleUpdateBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}
        </Box>
      </Box>

      {/* Bottom Panel */}
      {selectedProject && (
        <Box sx={{ 
          height: '30%',
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

export default GanttView;
