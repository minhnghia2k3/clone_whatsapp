import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAHe6rOPyD6sSgUP7UhclhONFXgrBwU_GU",
    authDomain: "whatsapp-clone-b6331.firebaseapp.com",
    projectId: "whatsapp-clone-b6331",
    storageBucket: "whatsapp-clone-b6331.appspot.com",
    messagingSenderId: "114833768554",
    appId: "1:114833768554:web:a36d57d3c6005ba3274a13",
    measurementId: "G-ZVQ6EZQE9L"
};

// Init firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);