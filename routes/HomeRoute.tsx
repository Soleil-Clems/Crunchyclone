import React, { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '@/hooks/AuthProvider';
import LoadingScreen from '@/components/LoadingScreen';

export default function AuthLayout() {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {

        if (!loading) {
            if (user) {
                router.replace('/(tabs)/');
            } else {
                router.replace('/');
            }
        }
    }, [user, loading]);

    if (loading) {
        return <LoadingScreen />;
    }


    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="serie" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}
