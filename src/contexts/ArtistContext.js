import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { database, ref, set, push, remove, onValue } from '../firebase';
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
    }, (error) => {
      console.error('Firebase artists read error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addArtist = useCallback(async (newArtist) => {
    try {
      const artistsRef = ref(database, 'artists');
      const newArtistRef = push(artistsRef);
      await set(newArtistRef, newArtist);
    } catch (error) {
      console.error('Error adding artist:', error);
      throw error;
    }
  }, []);

  const updateArtist = useCallback(async (updatedArtist) => {
    try {
      const artistRef = ref(database, `artists/${updatedArtist.id}`);
      await set(artistRef, updatedArtist);
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
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