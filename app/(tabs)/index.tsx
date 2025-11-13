import React, { useEffect, useState } from 'react';
import { FlatList, View, Platform, Alert, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Miniature } from '@/constants/types';
import SeriesCarousel from '@/components/SeriesCarousel';
import AppGradient from '@/components/AppGratient';
import { ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

const Index = () => {
    const currentStatusBarHeight = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;
    const [series, setSeries] = useState<Miniature[]>([]);
    const [banner, setBanner] = useState<Miniature[]>([]);
    const router = useRouter();
    
    const portion = (arr: Miniature[], chunkSize: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;
    
    if (!apiKey) {
        router.replace("/")
        throw new Error('La clé API BetaSeries est manquante.');
    }

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const response = await fetch('https://api.betaseries.com/shows/list?limit=100', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-BetaSeries-Key': apiKey,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    const miniatures: Miniature[] = data.shows
                        .filter((show: any) => show.images?.poster)
                        .map((show: any) => ({
                            id: show.id,
                            title: show.title,
                            img: show.images.poster,
                        }));
                    setSeries(miniatures);
                } else {
                    console.log("Erreur dans la réponse de l'API");
                }
            } catch (error) {
                Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
                console.error(error);
            }
        };

        fetchSeries();
    }, []);
    const groupedSeries = portion(series, 10);

    return (
        <AppGradient colors={['rgba(0,0,0,1)', 'rgba(0,0,0,1)']} bg='empty'>
            <View style={{ flex: 1 }}>
                <FlatList
                    data={groupedSeries}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <SeriesCarousel data={item} />
                    )}
                    onEndReached={() => {
                        
                    }}
                    onEndReachedThreshold={0.5}
                />
            </View>
        </AppGradient>
    );
};

export default Index;
