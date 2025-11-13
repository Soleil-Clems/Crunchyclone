import React, { useState, createContext, useEffect, useCallback, ReactNode, Dispatch, SetStateAction } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native'

interface User {
    id: string;
    pseudo: string;
    token:string;
}

type AuthContextType = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    logout: () => void;
    loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    logout: () => { },
    loading: true
});

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userJson = await AsyncStorage.getItem("user");
                if (userJson) {
                    const storedUser: User = JSON.parse(userJson);
                    setUser(storedUser);
                    setLoading(false);
                }else{
                    router.replace('/')
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(()=>{
        if(typeof user === null){
            router.replace('/');
        }
    },[user])

    const logout = useCallback(async () => {
        try {
            await AsyncStorage.removeItem("user");
            setUser(null);
            
           
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
