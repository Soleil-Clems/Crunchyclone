import React from 'react';
import { Slot } from "expo-router";
import AuthProvider from '@/hooks/AuthProvider';
import AuthLayout from '@/routes/HomeRoute';
import "../global.css";

export default function RootLayout() {
    return (

        <AuthProvider>
            <AuthLayout />
        </AuthProvider>
    );
}
