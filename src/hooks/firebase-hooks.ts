"use client"

import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User } from '@/lib/firebase'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // Adjust path if needed
function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs only once

    return user;
}


function useSignOut() {
    const router = useRouter();
    const signOut = async () => {
        try {
            await auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    return signOut;
}

export { useAuth, useSignOut };
