/* ==========================================================================
   FIREBASE REALTIME DATABASE CONFIGURATION & BINDINGS
   ========================================================================== */

export const firebaseConfig = {
  apiKey: "AIzaSyAho1e1EQ4CFAdJvNrxAgeab7HQHv65R_Q",
  authDomain: "abhijeet-restaurant.firebaseapp.com",
  databaseURL: "https://abhijeet-restaurant-default-rtdb.firebaseio.com",
  projectId: "abhijeet-restaurant",
  storageBucket: "abhijeet-restaurant.firebasestorage.app",
  messagingSenderId: "943165017196",
  appId: "1:943165017196:web:88eb6080caf03831fb1c49",
  measurementId: "G-CVYRDLG49P"
};

export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};
