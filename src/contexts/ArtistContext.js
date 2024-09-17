import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { database, ref, set, get, push, remove, onValue } from '../firebase';
import { useAuth } from './AuthContext';

const ArtistContext = createContext();

export function useArtists() {
  return useContext(ArtistContext);
}

export function ArtistProvider({ children }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setArtists([]);
      setLoading(false);
      return;
    }

    const artistsRef = ref(database, 'artists');
    
    const unsubscribe = onValue(artistsRef, (snapshot) => {
      if (snapshot.exists()) {
        const artistsData = snapshot.val();
        const artistsArray = Object.keys(artistsData).map(key => ({
          id: key,
          ...artistsData[key]
        }));
        setArtists(artistsArray);
      } else {
        setArtists([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addArtist = useCallback(async (newArtist) => {
    const artistsRef = ref(database, 'artists');
    const newArtistRef = push(artistsRef);
    await set(newArtistRef, newArtist);
  }, []);

  const updateArtist = useCallback(async (updatedArtist) => {
    const artistRef = ref(database, `artists/${updatedArtist.id}`);
    await set(artistRef, updatedArtist);
  }, []);

  const deleteArtist = useCallback(async (artistId) => {
    const artistRef = ref(database, `artists/${artistId}`);
    await remove(artistRef);
  }, []);

  const value = {
    artists,
    loading,
    addArtist,
    updateArtist,
    deleteArtist,
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
}