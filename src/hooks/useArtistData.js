import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase'; // Adjust this import based on your Firebase setup

export function useArtistData(artistId) {
  const [artistData, setArtistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArtistData() {
      if (!artistId) {
        setIsLoading(false);
        return;
      }

      const artistRef = ref(database, `artists/${artistId}`);
      try {
        const snapshot = await get(artistRef);
        if (snapshot.exists()) {
          setArtistData(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtistData();
  }, [artistId]);

  return { artistData, isLoading };
}
