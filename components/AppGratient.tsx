import React from 'react';
import { ImageBackground, SafeAreaView, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AppGradient = ({ children, colors, bg }: { children: any, colors: string[], bg: any }) => {
    const currentStatusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

    return (
        <ImageBackground
            source={{ uri: bg }}
            resizeMode='cover'
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={colors as string[]}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1, marginHorizontal: 5, paddingTop: currentStatusBarHeight, justifyContent: 'space-between' }}>
                    {children}
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

export default AppGradient;
