import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { useDrag } from 'react-dnd';
import { useArtists } from '../../contexts/ArtistContext';

function DraggableArtistItem({ artist }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'ARTIST',
    item: { id: artist.id, name: artist.name, type: 'ARTIST' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <ListItem
      ref={drag}
      button
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <ListItemText primary={artist.name} />
    </ListItem>
  );
}

function ArtistList() {
  const { artists } = useArtists();

  return (
    <List>
      {artists.map((artist) => (
        <DraggableArtistItem key={artist.id} artist={artist} />
      ))}
    </List>
  );
}

export default ArtistList;
