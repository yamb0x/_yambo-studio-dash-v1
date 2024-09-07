import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { useArtists } from '../../contexts/ArtistContext';

function ArtistList() {
  const { artists } = useArtists();

  return (
    <List>
      {artists.map((artist) => (
        <ListItem key={artist.id}>
          <ListItemText primary={artist.name} />
        </ListItem>
      ))}
    </List>
  );
}

export default ArtistList;
