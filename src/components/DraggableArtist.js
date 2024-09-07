import React from 'react';
import { useDrag } from 'react-dnd';
import { ListItem, ListItemText, ListItemSecondaryAction, Rating, Checkbox } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

function DraggableArtist({ artist }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'ARTIST',
    item: { id: artist.id, name: artist.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <ListItem
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
    >
      <ListItemText primary={artist.name} />
      <ListItemSecondaryAction>
        <Rating value={artist.stars} readOnly />
        <Checkbox
          checked={artist.favorite}
          icon={<FavoriteBorder />}
          checkedIcon={<Favorite />}
          readOnly
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default DraggableArtist;
