import React, { createContext, useState, useEffect, useContext } from 'react';

export const ArtistContext = createContext();

export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState(() => {
    const storedArtists = localStorage.getItem('artists');
    return storedArtists ? JSON.parse(storedArtists) : [];
  });

  useEffect(() => {
    localStorage.setItem('artists', JSON.stringify(artists));
  }, [artists]);

  const addArtist = (artist) => {
    setArtists([...artists, { ...artist, id: Date.now(), favorite: false }]);
  };

  const updateArtist = (updatedArtist) => {
    setArtists(artists.map(artist => artist.id === updatedArtist.id ? updatedArtist : artist));
  };

  const toggleFavorite = (id) => {
    setArtists(artists.map(artist => 
      artist.id === id ? { ...artist, favorite: !artist.favorite } : artist
    ));
  };

  const deleteArtist = (id) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtist, deleteArtist, toggleFavorite }}>
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtists = () => useContext(ArtistContext);