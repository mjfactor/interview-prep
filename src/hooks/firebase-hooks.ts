import * as React from "react"
import { auth, onAuthStateChanged, User } from '@/lib/firebase'; // Adjust path if needed
import { useRouter } from 'next/navigation'; // Adjust path if needed
function useUser() {
    const [user, setUser] = React.useState<User | null>(null);
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

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

export { useUser, useSignOut };
