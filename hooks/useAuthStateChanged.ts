// hooks/useAuthStateChanged.ts

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import firebaseConfig from '@/app/firebase-config'
import { initializeApp } from 'firebase/app'

// Função auxiliar para inicializar o Firebase
const initializeFirebaseAuth = () => {
    const app = initializeApp(firebaseConfig);
    return getAuth(app);
}

const useAuthStateChanged = () => {
    const [userUid, setUserUid] = useState<string>('');
    const [authStateChangedComplete, setAuthStateChangedComplete] = useState<boolean>(false);

    useEffect(() => {
        const auth = initializeFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            if (user) {
                setUserUid(user.uid);
                console.log('logado');
            } else {
                setUserUid('');
                console.log('não logado');
            }
            setAuthStateChangedComplete(true);
        });

        return () => unsubscribe();
    }, []);

    return { userUid, authStateChangedComplete }; // Retorna authStateChangedComplete
}

export default useAuthStateChanged;
