import React, { createContext, useState, useContext } from 'react';

const ArtistContext = createContext();

export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState([]);

  const addArtist = (artist) => {
    setArtists([...artists, { ...artist, id: Date.now() }]);
  };

  const updateArtist = (updatedArtist) => {
    setArtists(artists.map(artist => artist.id === updatedArtist.id ? updatedArtist : artist));
  };

  const deleteArtist = (id) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtist, deleteArtist }}>
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtists = () => useContext(ArtistContext);