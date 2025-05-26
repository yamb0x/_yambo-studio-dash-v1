/**
 * EXPERIMENTAL DASHBOARD
 * 
 * This is an experimental page for testing new features including:
 * - MCP (Model Context Protocol) integration
 * - AI-powered automation tools (Script Optimizer, Timeline Creator)
 * - New widget-based dashboard layout
 * - Drag-and-drop interface
 * 
 * TO REMOVE: Delete this file and remove route from App.js
 * TO MERGE AS MAIN: Replace Dashboard.js with this file's content
 * 
 * Dependencies:
 * - @dnd-kit for drag-and-drop
 * - framer-motion for animations
 * - MCP service layer (src/services/mcpService.js)
 * - Experimental components (AutomationsWidget, SmartWidgets, etc.)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  IconButton, 
  LinearProgress,
  Chip,
  Avatar,
  Stack,
  useTheme,
  alpha,
  Paper,
  Grid,
  Skeleton,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, differenceInDays, addDays, isValid } from 'date-fns';
import { Link } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useArtists } from '../contexts/ArtistContext';
import { useAuth } from '../contexts/AuthContext';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Group from '@mui/icons-material/Group';
import { AIInsightsWidget, QuickActionsWidget } from '../components/SmartWidgets';
import { ArtistsWorkingWidget } from '../components/ArtistsWorkingWidget';
import { QuickLinksWidget } from '../components/QuickLinksWidget';
import { AutomationsWidget } from '../components/AutomationsWidget';

// Safe date parsing helper
const safeParseDateISO = (dateString) => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Invalid date string:', dateString);
    return null;
  }
};

// Widget configuration with sizes - optimized for content
const WIDGET_CONFIG = {
  'ai-insights': { cols: 2, rows: 2, minCols: 2, minRows: 2 },        // Primary focus
  'projects-overview': { cols: 2, rows: 2, minCols: 2, minRows: 2 },  // Fits content better
  'metrics-artists': { cols: 1, rows: 2, minCols: 1, minRows: 2 },    // Important metric
  'upcoming-deadlines': { cols: 1, rows: 2, minCols: 1, minRows: 2 }, // Time-sensitive
  'automations': { cols: 2, rows: 2, minCols: 2, minRows: 2 },        // Actions
  'quick-links': { cols: 1, rows: 1, minCols: 1, minRows: 1 },        // Resources
  'view-all-projects': { cols: 1, rows: 1, minCols: 1, minRows: 1 },  // Project links
};

// Draggable Widget Component
function DraggableWidget({ id, children, isDragging: isCurrentlyDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 350,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const config = WIDGET_CONFIG[id] || { cols: 1, rows: 1 };

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        gridColumn: `span ${config.cols}`,
        gridRow: `span ${config.rows}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`widget-${id}`}
    >
      <Paper
        elevation={isDragging ? 8 : 1}
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          transition: 'all 0.2s ease',
          cursor: isDragging ? 'grabbing' : 'default',
          backgroundColor: 'background.paper',
          '&:hover': {
            borderColor: 'action.hover',
            boxShadow: 3,
            '.drag-handle': {
              opacity: 1,
            }
          },
        }}
      >
        <IconButton
          {...listeners}
          size="small"
          className="drag-handle"
          sx={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            cursor: 'grab',
            opacity: 0.3,
            transition: 'opacity 0.2s',
            padding: '4px',
            '&:hover': {
              opacity: 0.8,
              backgroundColor: 'action.hover',
            },
            '&:active': { 
              cursor: 'grabbing' 
            },
          }}
        >
          <DragIndicatorIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
        </IconButton>
        {children}
      </Paper>
    </motion.div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon, color = 'primary.main', loading = false }) {
  const theme = useTheme();
  const isPositive = change >= 0;
  
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={60} height={32} />
          ) : (
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'text.primary' }}>
              {value}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: (theme) => {
              // Handle theme color paths like 'primary.main'
              if (typeof color === 'string' && color.includes('.')) {
                const [paletteName, shade] = color.split('.');
                return alpha(theme.palette[paletteName]?.[shade] || color, 0.1);
              }
              return alpha(color, 0.1);
            },
            color: color,
            width: 32,
            height: 32,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        </Avatar>
      </Stack>
    </Box>
  );
}

// Merged Projects Overview Component with Health Monitoring
function ProjectsOverview({ projects, calculateProgress, artists }) {
  const theme = useTheme();
  
  const projectsWithHealth = useMemo(() => {
    return projects.map(project => {
      const progress = calculateProgress(project);
      const endDate = parseISO(project.endDate);
      const today = new Date();
      const daysLeft = differenceInDays(endDate, today);
      
      // Calculate health score (0-100)
      let healthScore = 100;
      
      // Timeline factor
      const totalDays = differenceInDays(endDate, parseISO(project.startDate));
      const daysElapsed = totalDays - daysLeft;
      const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
      
      if (daysLeft < 0) {
        healthScore -= 50; // Overdue
      } else if (daysLeft < 7 && progress < 80) {
        healthScore -= 30; // At risk
      } else if (progress < expectedProgress - 10) {
        healthScore -= 20; // Behind schedule
      }
      
      // Resources factor
      const hasBookings = project.bookings && project.bookings.length > 0;
      if (!hasBookings && progress < 100) {
        healthScore -= 20;
      }
      
      // Deliveries factor
      const hasDeliveries = project.deliveries && project.deliveries.length > 0;
      if (!hasDeliveries) {
        healthScore -= 10;
      }
      
      // Calculate working days and deliverables
      const totalWorkingDays = project.bookings ? 
        project.bookings.reduce((total, booking) => {
          const bookingDays = differenceInDays(parseISO(booking.endDate), parseISO(booking.startDate)) + 1;
          return total + bookingDays;
        }, 0) : 0;
      
      const deliverableCount = project.deliveries ? project.deliveries.length : 0;
      
      return {
        ...project,
        healthScore: Math.max(0, Math.min(100, healthScore)),
        progress,
        daysLeft,
        totalWorkingDays,
        deliverableCount,
        status: healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical',
      };
    })
    .filter(p => p.progress > 0 && p.progress < 100)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5);
  }, [projects, calculateProgress]);
  
  const getHealthColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <WorkIcon sx={{ fontSize: 16 }} color="primary" />
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
            Active Projects
          </Typography>
        </Stack>
        <Button
          component={Link}
          to="/gantt"
          size="small"
          sx={{ 
            textTransform: 'none',
            fontSize: '0.7rem',
            px: 0.75,
            py: 0.25,
            minWidth: 'auto'
          }}
        >
          View all →
        </Button>
      </Stack>
      
      <Box sx={{ flex: '0 1 auto', overflowY: 'auto' }}>
        <Stack spacing={1}>
        {projectsWithHealth.map(project => {
          const healthIcon = project.status === 'healthy' ? 
            <CheckCircleIcon sx={{ fontSize: 14 }} /> : 
            project.status === 'warning' ? 
            <WarningIcon sx={{ fontSize: 14 }} /> : 
            <WarningIcon sx={{ fontSize: 14 }} />;
          
          return (
            <Card
              key={project.id}
              variant="outlined"
              sx={{
                p: 1.5,
                borderColor: alpha(getHealthColor(project.healthScore), 0.3),
                backgroundColor: alpha(getHealthColor(project.healthScore), 0.02),
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: getHealthColor(project.healthScore),
                  transform: 'translateX(2px)',
                }
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Link to={`/gantt/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                        {project.name}
                      </Typography>
                    </Link>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.25}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {project.totalWorkingDays} days • {project.deliverableCount} deliveries
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.25}>
                    <Chip
                      icon={healthIcon}
                      label={`${project.healthScore}%`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getHealthColor(project.healthScore), 0.1),
                        color: getHealthColor(project.healthScore),
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20,
                        '& .MuiChip-icon': {
                          color: getHealthColor(project.healthScore),
                          fontSize: 14,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {project.daysLeft > 0 ? `${project.daysLeft}d left` : 'Overdue'}
                    </Typography>
                  </Stack>
                </Stack>
                
                <Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 1.5,
                        backgroundColor: getHealthColor(project.healthScore),
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.65rem' }}>
                    {Math.round(project.progress)}% complete
                  </Typography>
                </Box>
              </Stack>
            </Card>
          );
        })}
        {projectsWithHealth.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main', mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              All projects completed!
            </Typography>
          </Box>
        )}
        </Stack>
      </Box>
    </Box>
  );
}

// Upcoming Deadlines Component
function UpcomingDeadlines({ projects }) {
  const upcomingDeliveries = useMemo(() => {
    const allDeliveries = [];
    const today = new Date();
    
    projects.forEach(project => {
      if (project.deliveries && Array.isArray(project.deliveries)) {
        project.deliveries.forEach(delivery => {
          const deliveryDate = safeParseDateISO(delivery.date);
          if (deliveryDate && deliveryDate > today) {
            allDeliveries.push({
              ...delivery,
              projectName: project.name,
              projectId: project.id,
              daysUntil: differenceInDays(deliveryDate, today),
              parsedDate: deliveryDate,
            });
          }
        });
      }
    });
    
    return allDeliveries
      .sort((a, b) => a.parsedDate - b.parsedDate)
      .slice(0, 5);
  }, [projects]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1.5} sx={{ fontSize: '0.875rem' }}>
        Upcoming Deadlines
      </Typography>
      <Box sx={{ flex: '0 1 auto', overflowY: 'auto' }}>
        <Stack spacing={1}>
        {upcomingDeliveries.map((delivery, index) => (
          <Box
            key={`${delivery.projectId}-${index}`}
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: delivery.daysUntil <= 7 ? 'warning.main' : 'divider',
              backgroundColor: delivery.daysUntil <= 7 ? alpha('#ff9800', 0.05) : 'background.default',
            }}
          >
            <Stack spacing={0.25}>
              <Link 
                to={`/gantt/${delivery.projectId}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="caption" fontWeight={600} noWrap sx={{ fontSize: '0.75rem' }}>
                  {delivery.description || 'Delivery'}
                </Typography>
              </Link>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                {delivery.projectName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.25}>
                {delivery.daysUntil <= 1 && <WarningIcon sx={{ fontSize: 12 }} color="error" />}
                <Typography 
                  variant="caption" 
                  color={delivery.daysUntil <= 1 ? 'error.main' : 'text.secondary'}
                  fontWeight={500}
                  sx={{ fontSize: '0.65rem' }}
                >
                  {delivery.daysUntil === 0 ? 'Today' : 
                   delivery.daysUntil === 1 ? 'Tomorrow' : 
                   `In ${delivery.daysUntil} days`}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        ))}
        {upcomingDeliveries.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            No upcoming deadlines
          </Typography>
        )}
        </Stack>
      </Box>
    </Box>
  );
}


// Activity Feed Component
function ActivityFeed({ projects, artists }) {
  const theme = useTheme();
  
  // Generate real activity based on recent changes
  const activities = useMemo(() => {
    const recentActivities = [];
    const now = new Date();
    
    // Check recent projects
    projects.forEach(project => {
      const startDate = safeParseDateISO(project.startDate);
      if (startDate) {
        const daysSinceStart = differenceInDays(now, startDate);
        
        if (daysSinceStart >= 0 && daysSinceStart <= 7) {
          recentActivities.push({
            id: `project-${project.id}`,
            type: 'project',
            message: `Project "${project.name}" started`,
            time: daysSinceStart === 0 ? 'Today' : `${daysSinceStart} days ago`,
            icon: <WorkIcon fontSize="small" />,
            color: theme.palette.primary.main,
          });
        }
      }
    });

    // Add some mock activities for demo
    recentActivities.push(
      {
        id: 'mock-1',
        type: 'budget',
        message: 'Budget updated for "Website Redesign"',
        time: '2 hours ago',
        icon: <AttachMoneyIcon fontSize="small" />,
        color: theme.palette.success.main,
      },
      {
        id: 'mock-2',
        type: 'artist',
        message: 'New artist "Alex Chen" added to database',
        time: '5 hours ago',
        icon: <PersonIcon fontSize="small" />,
        color: theme.palette.info.main,
      }
    );

    return recentActivities.slice(0, 6);
  }, [projects, theme.palette]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Recent Activity
        </Typography>
        <IconButton size="small">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
        {activities.map((activity) => (
          <Stack
            key={activity.id}
            direction="row"
            spacing={2}
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'action.hover',
                transform: 'translateX(4px)',
              }
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(activity.color, 0.1),
                color: activity.color,
              }}
            >
              {activity.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500}>
                {activity.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// Main Dashboard Component
function DashboardModern() {
  const theme = useTheme();
  const { projects = [] } = useProjects();
  const { artists = [] } = useArtists();
  const { currentUser } = useAuth();
  
  const [widgetOrder, setWidgetOrder] = useState([
    'ai-insights',           // Most important - AI recommendations
    'projects-overview',     // Core functionality - merged with health
    'metrics-artists',       // Key metric
    'upcoming-deadlines',    // Time-sensitive info
    'automations',          // Actions
    'quick-links',          // Resources
    'view-all-projects',    // View all projects with recent links
  ]);

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const calculateProgress = useCallback((project) => {
    if (!project || !project.startDate || !project.endDate) return 0;
    
    const today = new Date();
    const start = safeParseDateISO(project.startDate);
    const end = safeParseDateISO(project.endDate);
    
    if (!start || !end) return 0;
    if (today < start) return 0;
    if (today > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = today.getTime() - start.getTime();
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  }, []);

  const calculateTotalCosts = useCallback((project) => {
    if (!project || !project.bookings || !Array.isArray(project.bookings)) return 0;
    
    return project.bookings.reduce((total, booking) => {
      const dailyRate = booking.dailyRate || 0;
      const duration = booking.duration || 0;
      return total + (dailyRate * duration);
    }, 0);
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const activeProjects = projects.filter(project => {
      const progress = calculateProgress(project);
      return progress > 0 && progress < 100;
    });

    const bookedArtistIds = new Set();
    let nearestDeadline = null;
    
    projects.forEach(project => {
      // Count booked artists
      if (project.bookings && Array.isArray(project.bookings)) {
        project.bookings.forEach(booking => {
          const startDate = safeParseDateISO(booking.startDate);
          const endDate = safeParseDateISO(booking.endDate);
          
          if (startDate && endDate) {
            try {
              if (isWithinInterval(today, { start: startDate, end: endDate })) {
                bookedArtistIds.add(booking.artistId);
              }
            } catch (error) {
              console.error('Error checking booking interval:', error);
            }
          }
        });
      }
      
      // Find nearest deadline
      if (project.deliveries && Array.isArray(project.deliveries)) {
        project.deliveries.forEach(delivery => {
          const deliveryDate = safeParseDateISO(delivery.date);
          if (deliveryDate && deliveryDate > today) {
            if (!nearestDeadline || deliveryDate < nearestDeadline) {
              nearestDeadline = deliveryDate;
            }
          }
        });
      }
    });

    const completedProjects = projects.filter(p => calculateProgress(p) === 100).length;
    const daysUntilDeadline = nearestDeadline ? differenceInDays(nearestDeadline, today) : null;
    
    // Calculate available artists
    const availableArtists = artists.filter(artist => !bookedArtistIds.has(artist.id)).length;

    return {
      activeProjects: activeProjects.length,
      bookedArtists: bookedArtistIds.size,
      availableArtists,
      completedProjects,
      daysUntilDeadline,
    };
  }, [projects, calculateProgress]);

  const widgetComponents = {
    'metrics-artists': (
      <ArtistsWorkingWidget 
        artists={artists} 
        projects={projects}
      />
    ),
    'view-all-projects': (
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
            Recent Projects
          </Typography>
          <Chip 
            label={projects.length} 
            size="small" 
            color="primary"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        </Stack>
        <Box sx={{ flex: '0 1 auto', overflowY: 'auto' }}>
          <Stack spacing={0.5}>
            {projects.slice(-10).reverse().map((project, index) => (
              <Box
                key={project.id}
                component={Link}
                to={`/gantt/${project.id}`}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.3),
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }} noWrap>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {format(parseISO(project.endDate), 'MMM d')}
                </Typography>
              </Box>
            ))}
            {projects.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textAlign: 'center', py: 2 }}>
                No projects yet
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    ),
    'projects-overview': (
      <ProjectsOverview 
        projects={projects}
        calculateProgress={calculateProgress}
        artists={artists}
      />
    ),
    'upcoming-deadlines': <UpcomingDeadlines projects={projects} />,
    'ai-insights': <AIInsightsWidget projects={projects} artists={artists} />,
    'quick-links': <QuickLinksWidget />,
    'automations': <AutomationsWidget projects={projects} artists={artists} />,
  };

  return (
    <>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Left Sidebar - Quick Actions */}
        <Box sx={{ width: 168, flexShrink: 0, height: '100%', overflow: 'auto', borderRight: 1, borderColor: 'divider' }}>
          <QuickActionsWidget onAction={(action) => console.log('Quick action:', action)} />
        </Box>
        
        {/* Main Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        {/* Experimental Warning Banner */}
        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            ⚠️ EXPERIMENTAL FEATURES - This page contains features under development. Use with caution in production.
          </Typography>
        </Box>
        
        {/* Header */}
        <Box mb={2}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome back, {currentUser?.email?.split('@')[0] || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's what's happening with your projects today.
          </Typography>
        </Box>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgetOrder}
          strategy={rectSortingStrategy}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gridAutoRows: 'minmax(140px, auto)',
              // Primary widgets - larger and more prominent
              '& .widget-ai-insights': {
                gridColumn: { md: 'span 2' },
                gridRow: { md: 'span 2' },
              },
              '& .widget-projects-overview': {
                gridColumn: { md: 'span 2' },
                gridRow: { md: 'span 2' },
              },
              // Secondary widgets - medium size
              '& .widget-metrics-artists': {
                gridRow: { md: 'span 2' },
              },
              '& .widget-upcoming-deadlines': {
                gridRow: { md: 'span 2' },
              },
              '& .widget-automations': {
                gridColumn: { md: 'span 2' },
                gridRow: { md: 'span 2' },
              },
              '& .widget-quick-links': {
                // Single column, single row
              },
              // Tertiary widgets - smallest
              '& .widget-view-all-projects': {
                // Single column, single row
              },
            }}
          >
            <AnimatePresence>
              {widgetOrder.map((widgetId) => (
                <DraggableWidget 
                  key={widgetId} 
                  id={widgetId}
                  isDragging={activeId === widgetId}
                >
                  {widgetComponents[widgetId]}
                </DraggableWidget>
              ))}
            </AnimatePresence>
          </Box>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                height: '100%',
                opacity: 0.9,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              {widgetComponents[activeId]}
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>
      </Box>
    </Box>
    </>
  );
}

export default DashboardModern;