// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUOPenXgKlFdmbOxCgNj9sYy6snh3iOLI",
  authDomain: "news-a601f.firebaseapp.com",
  projectId: "news-a601f",
  storageBucket: "news-a601f.appspot.com",
  messagingSenderId: "487384428633",
  appId: "1:487384428633:web:1029c98bed0efb0b4e8148",
  measurementId: "G-GDESPE4Q42"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const Storage = getStorage(app)

export { Storage }