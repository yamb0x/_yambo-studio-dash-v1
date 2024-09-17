import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, remove, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Replace this with your actual Firebase configuration
  apiKey: "AIzaSyAEtA8Q_nMUXGYwgXj3SrPiREGAetKX8jQ",
  authDomain: "yambo-studio-dashboard-v1.firebaseapp.com",
  databaseURL: "https://yambo-studio-dashboard-v1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yambo-studio-dashboard-v1",
  storageBucket: "yambo-studio-dashboard-v1.appspot.com",
  messagingSenderId: "961203853384",
  appId: "1:961203853384:web:b0f26f89b3808e5f63207d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Test function to write and read data
export async function testFirebaseConnection() {
  const testRef = ref(database, 'test');
  
  try {
    // Write data
    await set(testRef, { message: "Hello Firebase!" });
    console.log("Data written successfully");

    // Read data
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log("Data read successfully:", snapshot.val());
    } else {
      console.log("No data available");
    }

    // Remove test data
    await remove(testRef);
    console.log("Test data removed");

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
