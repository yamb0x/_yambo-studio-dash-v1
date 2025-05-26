// PLAY Dashboard Component - Can be easily removed by deleting this file and its imports
import React from 'react';
import { Box, Typography } from '@mui/material';

export function PlaySection() {
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 64, // Below header
        left: 0,
        right: 0,
        height: 48,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        zIndex: 1100,
      }}
    >
      <Typography variant="h6" fontWeight={700} letterSpacing={2}>
        PLAY
      </Typography>
    </Box>
  );
}