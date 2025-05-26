import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Snackbar,
  alpha,
  useTheme,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupsIcon from '@mui/icons-material/Groups';
import FolderIcon from '@mui/icons-material/Folder';
import CollectionsIcon from '@mui/icons-material/Collections';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';

export function QuickLinksWidget() {
  const theme = useTheme();
  const [copiedItem, setCopiedItem] = useState(null);
  
  const links = [
    {
      label: 'Discord Invitation',
      value: 'https://discord.gg/yambo-studio',
      icon: <GroupsIcon />,
    },
    {
      label: 'Folder Structures & Pipeline',
      value: 'https://drive.google.com/folder/pipeline',
      icon: <FolderIcon />,
    },
    {
      label: 'Objects Folio',
      value: 'https://yambo.studio/objects-folio',
      icon: <CollectionsIcon />,
    },
    {
      label: 'Studio Folio 2025',
      value: 'https://yambo.studio/folio-2025',
      icon: <CollectionsIcon />,
    },
  ];
  
  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.value);
    setCopiedItem(item.label);
    setTimeout(() => setCopiedItem(null), 2000);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
            Quick Links
          </Typography>
        </Stack>
      </Box>
      
      <Box sx={{ flex: 1, p: 1.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {links.map((link, index) => (
          <Box
            key={index}
            sx={{
              p: 1,
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.3),
                transform: 'translateY(-1px)',
              },
            }}
            onClick={() => handleCopy(link)}
          >
            {React.cloneElement(link.icon, { 
              sx: { 
                fontSize: 20, 
                color: 'primary.main', 
                mb: 0.5 
              } 
            })}
            <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
              {link.label}
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Snackbar
        open={!!copiedItem}
        autoHideDuration={2000}
        onClose={() => setCopiedItem(null)}
        message={`Copied ${copiedItem}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}