import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Mock timezone data - replace with real data from artists
const artistTimezones = {
  'Marina Chen': 'America/Los_Angeles',
  'Alex Kumar': 'Asia/Tokyo',
  'Sophie Laurent': 'Europe/Paris',
  'Jake Wilson': 'America/New_York',
  'Emma Davis': 'Europe/London',
};

export function ArtistsWorkingWidget({ artists, projects }) {
  const theme = useTheme();
  
  const workingArtists = useMemo(() => {
    const today = new Date();
    const artistsMap = new Map();
    
    projects.forEach(project => {
      if (project.bookings) {
        project.bookings.forEach(booking => {
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          
          if (today >= startDate && today <= endDate) {
            const artist = artists.find(a => a.id === booking.artistId);
            if (artist && !artistsMap.has(artist.id)) {
              artistsMap.set(artist.id, {
                ...artist,
                projectName: project.name,
                timezone: artistTimezones[artist.name] || 'UTC',
              });
            }
          }
        });
      }
    });
    
    return Array.from(artistsMap.values());
  }, [artists, projects]);
  
  const getLocalTime = (timezone) => {
    try {
      return formatInTimeZone(new Date(), timezone, 'HH:mm');
    } catch {
      return format(new Date(), 'HH:mm');
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
            Artists Working
          </Typography>
          <Chip 
            label={workingArtists.length} 
            size="small" 
            color="primary"
            sx={{ fontWeight: 600, height: 20, fontSize: '0.75rem' }}
          />
        </Stack>
      </Box>
      
      <Divider />
      
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {workingArtists.map((artist, index) => (
          <React.Fragment key={artist.id}>
            <ListItem sx={{ px: 1.5, py: 0.75 }}>
              <ListItemAvatar sx={{ minWidth: 32 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 12 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                      {artist.name}
                    </Typography>
                    <Stack alignItems="flex-end" spacing={0.1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {artist.projectName}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.25}>
                        <AccessTimeIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                          {getLocalTime(artist.timezone)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                }
              />
            </ListItem>
            {index < workingArtists.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
        
        {workingArtists.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No artists currently working
            </Typography>
          </Box>
        )}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          size="small"
          sx={{
            borderStyle: 'dashed',
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '0.75rem',
            py: 0.5,
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          Add an Intern
        </Button>
      </Box>
    </Box>
  );
}