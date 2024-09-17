import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { database, ref, set, get, push, remove } from '../firebase';

const ArtistContext = createContext();

export function useArtists() {
  return useContext(ArtistContext);
}

export function ArtistProvider({ children }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      const artistsRef = ref(database, 'artists');
      const snapshot = await get(artistsRef);
      if (snapshot.exists()) {
        const artistsData = snapshot.val();
        const artistsArray = Object.keys(artistsData).map(key => ({
          id: key,
          ...artistsData[key]
        }));
        console.log('Fetched artists:', artistsArray);
        setArtists(artistsArray);
      } else {
        console.log('No artists found in database');
        setArtists([]);
      }
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const addArtist = useCallback(async (artist) => {
    const artistsRef = ref(database, 'artists');
    const newArtistRef = push(artistsRef);
    const artistWithId = { ...artist, id: newArtistRef.key };
    await set(newArtistRef, artistWithId);
    setArtists(prevArtists => [...prevArtists, artistWithId]);
  }, []);

  const updateArtist = useCallback(async (updatedArtist) => {
    const artistRef = ref(database, `artists/${updatedArtist.id}`);
    await set(artistRef, updatedArtist);
    setArtists(prevArtists => 
      prevArtists.map(artist => 
        artist.id === updatedArtist.id ? updatedArtist : artist
      )
    );
  }, []);

  const deleteArtist = useCallback(async (artistId) => {
    const artistRef = ref(database, `artists/${artistId}`);
    await remove(artistRef);
    setArtists(prevArtists => prevArtists.filter(artist => artist.id !== artistId));
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    const artistRef = ref(database, `artists/${id}`);
    const snapshot = await get(artistRef);
    if (snapshot.exists()) {
      const artist = snapshot.val();
      const updatedArtist = { ...artist, favorite: !artist.favorite };
      await set(artistRef, updatedArtist);
      setArtists(prevArtists => 
        prevArtists.map(a => a.id === id ? updatedArtist : a)
      );
    }
  }, []);

  const value = {
    artists,
    loading,
    addArtist,
    updateArtist,
    deleteArtist,
    toggleFavorite
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
}