import React, { useState, useCallback, useRef, useEffect } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import { useDrag } from 'react-dnd';
import { useArtists } from '../../contexts/ArtistContext';

function DraggableArtistItem({ artist }) {
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const hoverTimerRef = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'ARTIST',
    item: { id: artist.id, name: artist.name, type: 'ARTIST' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleMouseEnter = useCallback(() => {
    setHoverIntensity(1);
    clearInterval(hoverTimerRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearInterval(hoverTimerRef.current);
    hoverTimerRef.current = setInterval(() => {
      setHoverIntensity((prevIntensity) => {
        const newIntensity = prevIntensity - 0.05;
        if (newIntensity <= 0) {
          clearInterval(hoverTimerRef.current);
          return 0;
        }
        return newIntensity;
      });
    }, 50); // Slower decay
  }, []);

  useEffect(() => {
    return () => clearInterval(hoverTimerRef.current);
  }, []);

  return (
    <ListItem
      ref={drag}
      button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        transition: 'background-color 0.3s ease',
        backgroundColor: `rgba(0, 0, 0, ${hoverIntensity * 0.1})`,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
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
