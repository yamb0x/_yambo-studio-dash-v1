import React, { useState, useCallback, useRef, useEffect } from 'react';
import { List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useDrag } from 'react-dnd';
import { useArtists } from '../../contexts/ArtistContext';
import { styled } from '@mui/material/styles';

// Styled components to ensure Basis Grotesque font is applied
const StyledBox = styled(Box)({
  // Remove fontFamily property
});

const StyledListItem = styled(ListItem)({
  // Remove fontFamily property
});

const StyledSelect = styled(Select)({
  // Remove fontFamily property
});

// Keep the existing DraggableArtistItem component unchanged
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

  // Add this console log
  console.log('DraggableArtistItem render:', artist.name, 'isDragging:', isDragging);

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
    <StyledListItem
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
    </StyledListItem>
  );
}

function ArtistList() {
  const { artists } = useArtists();
  const [sortOption, setSortOption] = useState('all');

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const sortedAndFilteredArtists = useCallback(() => {
    return artists.filter((artist) => {
      if (sortOption === 'all') return true;
      if (sortOption === 'favorite') return artist.favorite === true;
      if (sortOption.startsWith('skill:')) {
        const skill = sortOption.split(':')[1];
        return artist.skills && artist.skills.includes(skill);
      }
      if (sortOption === 'under500') return artist.dailyRate < 500;
      if (sortOption === 'under400') return artist.dailyRate < 400;
      if (sortOption === 'under300') return artist.dailyRate < 300;
      return true;
    });
  }, [artists, sortOption]);

  const skillOptions = [
    'Animation', 'Look Development', 'Rigging', 'Creative Direction',
    'Production', 'Simulations', 'CAD', 'Houdini', 'Color Grading',
    'Compositing', '2D Animation'
  ];

  return (
    <StyledBox>
      <FormControl fullWidth margin="normal">
        <InputLabel id="sort-select-label">Filter Artists</InputLabel>
        <StyledSelect
          labelId="sort-select-label"
          id="sort-select"
          value={sortOption}
          label="Filter Artists"
          onChange={handleSortChange}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="favorite">Favorite</MenuItem>
          {skillOptions.map((skill) => (
            <MenuItem key={skill} value={`skill:${skill}`}>{skill}</MenuItem>
          ))}
          <MenuItem value="under500">Under $500</MenuItem>
          <MenuItem value="under400">Under $400</MenuItem>
          <MenuItem value="under300">Under $300</MenuItem>
        </StyledSelect>
      </FormControl>
      <List>
        {sortedAndFilteredArtists().map((artist) => (
          <DraggableArtistItem key={artist.id} artist={artist} />
        ))}
      </List>
    </StyledBox>
  );
}

export default ArtistList;
