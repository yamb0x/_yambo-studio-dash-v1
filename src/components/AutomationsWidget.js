/**
 * EXPERIMENTAL COMPONENT
 * Part of the experimental dashboard features
 * Remove when deleting experimental features
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ScriptOptimizer } from './ScriptOptimizer';
import { TimelineCreator } from './TimelineCreator';

export function AutomationsWidget({ projects = [], artists = [] }) {
  const [scriptOptimizerOpen, setScriptOptimizerOpen] = useState(false);
  const [timelineCreatorOpen, setTimelineCreatorOpen] = useState(false);
  
  const automations = [
    {
      title: 'Script Optimizer',
      description: 'AI-powered script refinement and versions',
      icon: <AutoAwesomeIcon />,
      status: 'ready',
      action: 'Optimize Script',
    },
    {
      title: 'Timeline Creator',
      description: 'Generate smart timelines from past projects',
      icon: <ScheduleIcon />,
      status: 'ready',
      action: 'Create Timeline',
    },
    {
      title: 'Team Matching',
      description: 'AI-powered artist recommendations',
      icon: <SmartToyIcon />,
      status: 'coming',
      action: 'Find Artists',
    },
    {
      title: 'Research Projects',
      description: 'Use Claude MCP to research project requirements',
      icon: <SearchIcon />,
      status: 'coming',
      action: 'Start Research',
    },
  ];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'success';
      case 'beta': return 'warning';
      case 'coming': return 'default';
      default: return 'default';
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <AutoAwesomeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
            Automations
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          Connect to Claude via MCP
        </Typography>
      </Box>
      
      <Stack spacing={1.5} sx={{ flex: 1, p: 1.5, pt: 1, overflow: 'auto' }}>
        {automations.map((automation, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              p: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-1px)',
                boxShadow: 1,
              },
            }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {React.cloneElement(automation.icon, { 
                    sx: { fontSize: 18, color: 'primary.main' } 
                  })}
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                    {automation.title}
                  </Typography>
                </Stack>
                <Chip
                  label={automation.status}
                  size="small"
                  color={getStatusColor(automation.status)}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
              
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.3 }}>
                {automation.description}
              </Typography>
              
              <Button
                size="small"
                variant="text"
                startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                disabled={automation.status === 'coming'}
                onClick={() => {
                  if (automation.title === 'Script Optimizer') {
                    setScriptOptimizerOpen(true);
                  } else if (automation.title === 'Timeline Creator') {
                    setTimelineCreatorOpen(true);
                  } else {
                    // Feature coming soon
                  }
                }}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  mt: 0.25,
                  px: 0.5,
                  py: 0,
                  minHeight: 'auto',
                }}
              >
                {automation.action}
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>
      
      <Box sx={{ p: 1.5, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          sx={{
            borderStyle: 'dashed',
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '0.7rem',
            py: 0.5,
          }}
        >
          Configure MCP Connection
        </Button>
      </Box>
      
      <ScriptOptimizer 
        open={scriptOptimizerOpen}
        onClose={() => setScriptOptimizerOpen(false)}
      />
      
      <TimelineCreator 
        open={timelineCreatorOpen}
        onClose={() => setTimelineCreatorOpen(false)}
      />
    </Box>
  );
}