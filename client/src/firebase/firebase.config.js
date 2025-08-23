import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyAfSyVYK1zNnpIqNQgJDA6QZrmIqn1waOs",
	authDomain: "vesthub-mfms.firebaseapp.com",
	projectId: "vesthub-mfms",
	storageBucket: "vesthub-mfms.firebasestorage.app",
	messagingSenderId: "579909118849",
	appId: "1:579909118849:web:96bcc68de482bba01b5680",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
