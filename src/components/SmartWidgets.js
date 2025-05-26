import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Card,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  HealthAndSafety,
  TipsAndUpdates,
  AutoAwesome,
  Speed,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  Group,
  Lightbulb,
  MailOutline,
} from '@mui/icons-material';
import { differenceInDays, format, parseISO, addDays } from 'date-fns';

// Project Health Score Widget
export function ProjectHealthWidget({ projects, calculateProgress, artists }) {
  const theme = useTheme();
  
  const projectsWithHealth = useMemo(() => {
    return projects.map(project => {
      const progress = calculateProgress(project);
      const endDate = parseISO(project.endDate);
      const today = new Date();
      const daysLeft = differenceInDays(endDate, today);
      
      // Calculate health score (0-100)
      let healthScore = 100;
      
      // Timeline factor - compare actual progress to expected progress
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
      
      // Booking factor
      const hasBookings = project.bookings && project.bookings.length > 0;
      if (!hasBookings && progress < 100) {
        healthScore -= 20; // No resources assigned
      }
      
      // Delivery factor
      const hasDeliveries = project.deliveries && project.deliveries.length > 0;
      if (!hasDeliveries) {
        healthScore -= 10; // No milestones set
      }
      
      // Calculate total working days
      const totalWorkingDays = project.bookings ? 
        project.bookings.reduce((total, booking) => {
          const bookingDays = differenceInDays(parseISO(booking.endDate), parseISO(booking.startDate)) + 1;
          return total + bookingDays;
        }, 0) : 0;
      
      // Count deliverables
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
    .slice(0, 3);
  }, [projects, calculateProgress]);
  
  const getHealthColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const getHealthIcon = (score) => {
    if (score >= 80) return <CheckCircle fontSize="small" />;
    if (score >= 50) return <Warning fontSize="small" />;
    return <HealthAndSafety fontSize="small" />;
  };
  
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          Project Health Monitor
        </Typography>
        <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
      </Stack>
      
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {projectsWithHealth.map(project => (
          <Card
            key={project.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderColor: getHealthColor(project.healthScore),
              borderWidth: 1,
              backgroundColor: alpha(getHealthColor(project.healthScore), 0.05),
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" fontWeight={600} noWrap sx={{ flex: 1, fontSize: '0.75rem' }}>
                  {project.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.25}>
                  {React.cloneElement(getHealthIcon(project.healthScore), { sx: { fontSize: 14 } })}
                  <Typography variant="caption" fontWeight={600} color={getHealthColor(project.healthScore)} sx={{ fontSize: '0.75rem' }}>
                    {project.healthScore}%
                  </Typography>
                </Stack>
              </Stack>
              
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
              
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={0.5}>
                  <Chip
                    label={`${project.progress}% done`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                  <Chip
                    label={project.daysLeft > 0 ? `${project.daysLeft} days left` : 'Overdue'}
                    size="small"
                    color={project.daysLeft > 7 ? 'default' : 'warning'}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {project.totalWorkingDays} working days
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {project.deliverableCount} deliverables
                  </Typography>
                </Stack>
              </Stack>
              
              {project.healthScore < 50 && (
                <Typography variant="caption" color="error.main" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                  ⚠️ Needs immediate attention
                </Typography>
              )}
            </Stack>
          </Card>
        ))}
        
        {projectsWithHealth.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All projects are healthy!
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// AI Insights Widget
export function AIInsightsWidget({ projects, artists }) {
  const theme = useTheme();
  
  const insights = useMemo(() => {
    const insights = [];
    const today = new Date();
    
    // Always add the Loom briefing reminder first
    insights.push({
      type: 'info',
      title: 'Brief Kornell on Mobileye',
      message: 'Record a Loom video to update Kornell on the Mobileye ADAS project progress and next steps.',
      icon: <TipsAndUpdates />,
      action: 'Record Loom',
    });
    
    // Find Mobileye ADAS project
    const mobileyeProject = projects.find(p => p.name && p.name.includes('Mobileye ADAS'));
    if (mobileyeProject) {
      const progress = Math.round((today - parseISO(mobileyeProject.startDate)) / (parseISO(mobileyeProject.endDate) - parseISO(mobileyeProject.startDate)) * 100);
      const daysLeft = differenceInDays(parseISO(mobileyeProject.endDate), today);
      
      if (daysLeft < 14 && progress < 75) {
        insights.push({
          type: 'alert',
          title: 'Mobileye ADAS Timeline Risk',
          message: `Only ${daysLeft} days left with ${progress}% completion. Consider adding resources.`,
          icon: <Warning />,
          action: 'Review timeline',
        });
      }
      
      // Check if artists are assigned
      if (mobileyeProject.bookings && mobileyeProject.bookings.length > 0) {
        insights.push({
          type: 'info',
          title: 'Mobileye Team Update',
          message: `${mobileyeProject.bookings.length} artists assigned. Consider daily standups for coordination.`,
          icon: <Group />,
          action: 'Schedule meeting',
        });
      }
    }
    
    // Analyze workload
    const activeProjects = projects.filter(p => {
      const start = parseISO(p.startDate);
      const end = parseISO(p.endDate);
      return today >= start && today <= end;
    });
    
    if (activeProjects.length > 5) {
      insights.push({
        type: 'warning',
        title: 'High Project Load',
        message: `${activeProjects.length} concurrent projects. Risk of resource conflicts.`,
        icon: <Speed />,
        action: 'Review capacity',
      });
    }
    
    // Check for upcoming deadlines
    const upcomingDeadlines = [];
    projects.forEach(project => {
      if (project.deliveries) {
        project.deliveries.forEach(delivery => {
          const deliveryDate = parseISO(delivery.date);
          const daysUntil = differenceInDays(deliveryDate, today);
          if (daysUntil > 0 && daysUntil <= 7) {
            upcomingDeadlines.push({ project, delivery, daysUntil });
          }
        });
      }
    });
    
    if (upcomingDeadlines.length > 3) {
      const mobileyeDeadline = upcomingDeadlines.find(d => d.project.name && d.project.name.includes('Mobileye'));
      if (mobileyeDeadline) {
        insights.push({
          type: 'alert',
          title: 'Mobileye Delivery Soon',
          message: `Mobileye ADAS delivery in ${mobileyeDeadline.daysUntil} days. Ensure QA is scheduled.`,
          icon: <Schedule />,
          action: 'Review deliverables',
        });
      }
    }
    
    // Success pattern
    const completedRecently = projects.filter(p => {
      const endDate = parseISO(p.endDate);
      const daysSinceEnd = differenceInDays(today, endDate);
      return daysSinceEnd >= 0 && daysSinceEnd <= 30;
    });
    
    if (completedRecently.length >= 2) {
      insights.push({
        type: 'success',
        title: 'Strong Delivery Record',
        message: `${completedRecently.length} projects delivered on time. Team performance is excellent.`,
        icon: <TrendingUp />,
        action: 'Celebrate wins',
      });
    }
    
    return insights.slice(0, 4);
  }, [projects, artists]);
  
  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return theme.palette.warning.main;
      case 'alert': return theme.palette.error.main;
      case 'success': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };
  
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          AI Insights
        </Typography>
        <TipsAndUpdates sx={{ fontSize: 18, color: 'primary.main' }} />
      </Stack>
      
      <Stack spacing={1} sx={{ flex: 1, overflowY: 'auto' }}>
        {insights.map((insight, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              p: 1.5,
              borderColor: alpha(getInsightColor(insight.type), 0.3),
              backgroundColor: alpha(getInsightColor(insight.type), 0.05),
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateX(2px)',
                borderColor: getInsightColor(insight.type),
              },
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: alpha(getInsightColor(insight.type), 0.2),
                    color: getInsightColor(insight.type),
                  }}
                >
                  {React.cloneElement(insight.icon, { sx: { fontSize: 14 } })}
                </Avatar>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  {insight.title}
                </Typography>
              </Stack>
              
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                {insight.message}
              </Typography>
              
              <Button
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  color: getInsightColor(insight.type),
                  fontSize: '0.7rem',
                  px: 0.5,
                  py: 0,
                  minHeight: 'auto',
                }}
              >
                {insight.action} →
              </Button>
            </Stack>
          </Card>
        ))}
        
        {insights.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Lightbulb sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No insights available yet
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// Smart Quick Actions Widget
export function QuickActionsWidget({ onAction }) {
  const theme = useTheme();
  
  const actions = [
    {
      label: 'New Project',
      icon: <AutoAwesome />,
      color: 'primary',
      description: 'AI-powered setup',
    },
    {
      label: 'Email Artist',
      icon: <MailOutline />,
      color: 'secondary',
      description: 'Quick message',
    },
    {
      label: 'Find Artist',
      icon: <Group />,
      color: 'success',
      description: 'Smart match',
    },
    {
      label: 'Schedule Review',
      icon: <Schedule />,
      color: 'warning',
      description: 'Timeline check',
    },
    {
      label: 'Generate Report',
      icon: <TipsAndUpdates />,
      color: 'info',
      description: 'Weekly insights',
    },
  ];
  
  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.action.hover, 0.3) }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
          Quick Actions
        </Typography>
      </Box>
      
      <Stack sx={{ flex: 1, p: 1.5, spacing: 1 }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            fullWidth
            onClick={() => onAction?.(action.label)}
            sx={{
              justifyContent: 'center',
              textAlign: 'center',
              p: 1,
              color: 'text.primary',
              backgroundColor: 'transparent',
              borderRadius: 2,
              transition: 'all 0.2s',
              minHeight: 70,
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette[action.color].main, 0.08),
                transform: 'scale(1.02)',
              },
            }}
          >
            <Stack direction="column" spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: (theme) => alpha(theme.palette[action.color].main, 0.1),
                  color: `${action.color}.main`,
                }}
              >
                {React.cloneElement(action.icon, { sx: { fontSize: 18 } })}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                  {action.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.25 }}>
                  {action.description}
                </Typography>
              </Box>
            </Stack>
          </Button>
        ))}
      </Stack>
      
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Press ⌘K for command palette
        </Typography>
      </Box>
    </Box>
  );
}