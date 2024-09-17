import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { database, ref, set, get, push, remove } from '../firebase';

export const ArtistContext = createContext();

export const ArtistProvider = ({ children }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      const artistsRef = ref(database, 'artists');
      const snapshot = await get(artistsRef);
      if (snapshot.exists()) {
        const artistsData = snapshot.val();
        const artistsArray = Object.keys(artistsData).map(key => ({
          id: key,
          ...artistsData[key]
        }));
        setArtists(artistsArray);
      }
    };
    fetchArtists();
  }, []);

  const addArtist = useCallback(async (artist) => {
    const artistsRef = ref(database, 'artists');
    const newArtistRef = push(artistsRef);
    const newArtist = { ...artist, id: newArtistRef.key, favorite: false };
    await set(newArtistRef, newArtist);
    setArtists(prevArtists => [...prevArtists, newArtist]);
  }, []);

  const updateArtist = useCallback(async (updatedArtist) => {
    const artistRef = ref(database, `artists/${updatedArtist.id}`);
    await set(artistRef, updatedArtist);
    setArtists(prevArtists => prevArtists.map(artist => 
      artist.id === updatedArtist.id ? updatedArtist : artist
    ));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const artistRef = ref(database, `artists/${id}`);
    const snapshot = await get(artistRef);
    if (snapshot.exists()) {
      const artist = snapshot.val();
      const updatedArtist = { ...artist, favorite: !artist.favorite };
      await set(artistRef, updatedArtist);
      setArtists(prevArtists => prevArtists.map(artist => 
        artist.id === id ? updatedArtist : artist
      ));
    }
  }, []);

  const deleteArtist = useCallback(async (id) => {
    const artistRef = ref(database, `artists/${id}`);
    await remove(artistRef);
    setArtists(prevArtists => prevArtists.filter(artist => artist.id !== id));
  }, []);

  return (
    <ArtistContext.Provider value={{ artists, addArtist, updateArtist, deleteArtist, toggleFavorite }}>
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtists = () => useContext(ArtistContext);