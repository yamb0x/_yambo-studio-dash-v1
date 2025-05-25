import React, { useState, useCallback, useRef, useEffect } from 'react';
import { List, ListItem, ListItemText, TextField, Box, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
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


// Keep the existing DraggableArtistItem component unchanged
function DraggableArtistItem({ artist, showFinancialInfo }) {
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const hoverTimerRef = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'ARTIST',
    item: { ...artist, type: 'ARTIST' }, // Pass the full artist object including dailyRate
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Remove or comment out this console.log
  // console.log('DraggableArtistItem render:', artist.name, 'isDragging:', isDragging);

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
      <ListItemText 
        primary={artist.name} 
        secondary={showFinancialInfo ? `$${artist.dailyRate}/day` : artist.skills} 
      />
    </StyledListItem>
  );
}

function ArtistList({ showFinancialInfo }) {
  const { artists } = useArtists();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredArtists = useCallback(() => {
    if (!searchTerm.trim()) {
      return artists;
    }
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return artists.filter((artist) => {
      return (
        artist.name.toLowerCase().includes(lowercaseSearch) ||
        (artist.skills && artist.skills.some(skill => 
          skill.toLowerCase().includes(lowercaseSearch)
        )) ||
        (artist.country && artist.country.toLowerCase().includes(lowercaseSearch))
      );
    });
  }, [artists, searchTerm]);

  return (
    <StyledBox>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search artists..."
        value={searchTerm}
        onChange={handleSearchChange}
        size="small"
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          }
        }}
      />
      <List>
        {filteredArtists().map((artist) => (
          <DraggableArtistItem key={artist.id} artist={artist} showFinancialInfo={showFinancialInfo} />
        ))}
      </List>
    </StyledBox>
  );
}

export default ArtistList;
