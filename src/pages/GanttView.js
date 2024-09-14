import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ProjectList from '../components/Gantt/ProjectList';
import GanttChart from '../components/Gantt/GanttChart';
import ArtistList from '../components/Gantt/ArtistList';
import RightPanel from '../components/Gantt/RightPanel';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { COLORS } from '../constants';
import moment from 'moment';

function GanttView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const SIDE_PANEL_WIDTH = isMobile ? '100%' : '200px';

  const { 
    projects,
    addBooking, 
    removeBooking, 
    updateBooking,
    addDelivery, 
    editDelivery, 
    deleteDelivery,
    updateProjectBudget 
  } = useProjects();

  console.log('All projects:', projects);
  console.log('Project IDs:', projects.map(p => p.id));

  const { artists } = useArtists();
  const [selectedProject, setSelectedProject] = useState(null);
  const [forcedProject, setForcedProject] = useState(null);
  const [, forceUpdate] = useState();

  console.log('projectId from URL:', projectId);
  console.log('All projects:', projects);

  const activeProjects = useMemo(() => {
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

  console.log('Active projects:', activeProjects);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id.toString() === projectId.toString());
      console.log('Searching for project with ID:', projectId);
      console.log('Found project:', project);
      if (project) {
        setForcedProject(project);
        setSelectedProject(null);  // Clear the selected project when forcing a project
      } else {
        console.log('Project not found, navigating to first active project');
        if (activeProjects.length > 0) {
          navigate(`/gantt/${activeProjects[0].id}`);
        } else {
          navigate('/gantt');
        }
      }
    } else {
      setForcedProject(null);
      if (activeProjects.length > 0 && !selectedProject) {
        setSelectedProject(activeProjects[0]);
      }
    }
  }, [projectId, projects, activeProjects, selectedProject, navigate]);

  const handleSelectProject = useCallback((project) => {
    setSelectedProject(project);
    setForcedProject(null);
    navigate(`/gantt/${project.id}`);
  }, [navigate]);

  const displayedProject = forcedProject || selectedProject || (projectId ? projects.find(p => p.id.toString() === projectId.toString()) : null);

  console.log('Forced project:', forcedProject);
  console.log('Selected project:', selectedProject);
  console.log('Displayed project:', displayedProject);

  const handleAddBooking = useCallback((newBooking) => {
    if (displayedProject) {
      addBooking(displayedProject.id, newBooking);
      forceUpdate({});
    }
  }, [displayedProject, addBooking]);

  const handleUpdateBooking = useCallback((updatedBooking) => {
    if (displayedProject) {
      updateBooking(displayedProject.id, updatedBooking);
      forceUpdate({});
    }
  }, [displayedProject, updateBooking]);

  const handleDeleteBooking = useCallback((bookingId) => {
    if (displayedProject) {
      removeBooking(displayedProject.id, bookingId);
      forceUpdate({});
    }
  }, [displayedProject, removeBooking]);

  const handleAddDelivery = useCallback((newDelivery) => {
    if (displayedProject) {
      addDelivery(displayedProject.id, newDelivery);
      forceUpdate({});
    }
  }, [displayedProject, addDelivery]);

  const handleEditDelivery = useCallback((updatedDelivery) => {
    if (displayedProject) {
      editDelivery(displayedProject.id, updatedDelivery);
      forceUpdate({});
    }
  }, [displayedProject, editDelivery]);

  const handleDeleteDelivery = useCallback((deliveryId) => {
    if (displayedProject) {
      deleteDelivery(displayedProject.id, deliveryId);
      forceUpdate({});
    }
  }, [displayedProject, deleteDelivery]);

  const handleUpdateBudget = useCallback((newBudget) => {
    if (displayedProject) {
      updateProjectBudget(displayedProject.id, newBudget);
      forceUpdate({});
    }
  }, [displayedProject, updateProjectBudget]);

  const handleUpdateRevenue = useCallback((newRevenue) => {
    if (displayedProject) {
      // Implement the logic to update the project's revenue
      forceUpdate({});
    }
  }, [displayedProject]);

  const [, drop] = useDrop({
    accept: 'ARTIST',
    drop: (item, monitor) => {
      if (displayedProject) {
        const dropPosition = monitor.getClientOffset();
        const ganttChartElement = document.getElementById('gantt-chart');
        const ganttRect = ganttChartElement.getBoundingClientRect();
        const dropX = dropPosition.x - ganttRect.left;
        
        const weekWidth = 200; // Make sure this matches the WEEK_WIDTH in GanttChart
        const droppedWeek = Math.floor(dropX / weekWidth);
        const startDate = moment(displayedProject.startDate).add(droppedWeek, 'weeks');
        const endDate = startDate.clone().add(6, 'days');

        const artist = artists.find(a => a.id === item.id);
        const dailyRate = artist ? parseFloat(artist.dailyRate) || 0 : 0;

        const newBooking = {
          id: Date.now(),
          projectId: displayedProject.id,
          artistId: item.id,
          artistName: item.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          dailyRate: dailyRate,
        };

        handleAddBooking(newBooking);
      }
    },
  });

  const artistColors = useMemo(() => {
    if (!displayedProject || !displayedProject.bookings) {
      return {};
    }
    const artists = Array.from(new Set(displayedProject.bookings.map(b => b.artistName)));
    return artists.reduce((acc, artist, index) => {
      acc[artist] = COLORS[index % COLORS.length];
      return acc;
    }, {});
  }, [displayedProject]);

  const handleArtistDrop = useCallback((artist) => {
    // Implement the logic for handling artist drop
    console.log('Artist dropped:', artist);
  }, []);

  if (!displayedProject) {
    return <Typography>No project selected or project not found. Project ID: {projectId}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', width: '100%' }}>
      <Box sx={{ borderBottom: '1px solid #e0e0e0', p: 1 }}>
        <ProjectList 
          projects={activeProjects} 
          selectedProject={selectedProject} 
          onSelectProject={handleSelectProject} 
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: 'calc(100% - 48px)' }}>
        <Box sx={{ 
          width: SIDE_PANEL_WIDTH,
          flexShrink: 0,
          overflowY: 'auto',
          borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
          borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
          padding: 2,
        }}>
          <ArtistList
            artists={artists}
            onArtistDrop={handleArtistDrop}
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : 'calc(100% - 200px)' }}>
          <PanelGroup direction="vertical">
            <Panel>
              <Box ref={drop} sx={{ height: '100%', p: 2, overflowX: 'auto', overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>Gantt Chart</Typography>
                <GanttChart 
                  key={displayedProject.id} 
                  project={displayedProject}
                  onUpdateBooking={handleUpdateBooking}
                  onDeleteBooking={handleDeleteBooking}
                />
              </Box>
            </Panel>
            <PanelResizeHandle style={{ height: '1px', background: '#e0e0e0' }} />
            <Panel defaultSize={30} minSize={10}>
              <Box sx={{ height: '100%', overflowY: 'auto' }}>
                <RightPanel 
                  project={displayedProject}
                  onAddDelivery={handleAddDelivery}
                  onEditDelivery={handleEditDelivery}
                  onDeleteDelivery={handleDeleteDelivery}
                  onUpdateBudget={handleUpdateBudget}
                  onUpdateRevenue={handleUpdateRevenue}
                  artistColors={artistColors} 
                />
              </Box>
            </Panel>
          </PanelGroup>
        </Box>
      </Box>
    </Box>
  );
}

export default GanttView;
