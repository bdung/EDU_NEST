// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjuuSmZxYbDEAJ-JAxsLnd7TwncPxtP4s",
  authDomain: "webs-a59b6.firebaseapp.com",
  projectId: "webs-a59b6",
  storageBucket: "webs-a59b6.firebasestorage.app",
  messagingSenderId: "474886982496",
  appId: "1:474886982496:web:258309f9fb2d0b03feec05",
  measurementId: "G-1CLQ3RNJGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);