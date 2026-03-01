import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBdDDIo3GujkIEVVyOYVRj4K0nLjysyqH0",
    authDomain: "security-cloud-31fdb.firebaseapp.com",
    projectId: "security-cloud-31fdb",
    storageBucket: "security-cloud-31fdb.firebasestorage.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Enable offline persistence so data works without internet
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Multiple tabs open, offline persistence disabled for this tab.");
    } else if (err.code == 'unimplemented') {
        console.warn("Browser does not support offline persistence.");
    }
});

export { db, collection, doc, setDoc, getDoc, onSnapshot };
