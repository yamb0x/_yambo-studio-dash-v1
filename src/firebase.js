import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, remove, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);
// Explicitly pass the database URL to ensure correct region
const database = getDatabase(app, firebaseConfig.databaseURL || undefined);
const auth = getAuth(app);

// Test function to write and read data
export async function testFirebaseConnection() {
  const testRef = ref(database, 'test');
  
  try {
    // Write data
    await set(testRef, { message: "Hello Firebase!" });

    // Read data
    const snapshot = await get(testRef);
    if (!snapshot.exists()) {
      // No data available
    }

    // Remove test data
    await remove(testRef);

    return true;
  } catch (error) {
    console.error("Error testing Firebase connection:", error);
    return false;
  }
}

// Export the database and auth instances
export { database, auth };

// Export the necessary Firebase functions
export { ref, set, get, push, remove, onValue };
