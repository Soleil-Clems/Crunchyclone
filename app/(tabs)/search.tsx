import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, FlatList, Image, SafeAreaView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppGradient from '@/components/AppGratient';
import { Link } from 'expo-router';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;


    const searchContent = async () => {
        if (searchQuery.trim() === '') return;

        setLoading(true);
        setSearchPerformed(true);
        try {
            const options = { method: 'GET', headers: { 'X-BetaSeries-Key': `${apiKey}` } };
            const response = await fetch(`https://api.betaseries.com/search/all?query=${searchQuery}`, options);
            const data = await response.json();


            const combinedResults = [...(data.movies || []), ...(data.shows || [])];
            setResults(data.shows);
            // setResults(combinedResults);
        } catch (error) {
            console.error('Erreur lors de la recherche des films ou séries:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelSearch = () => {
        setSearchQuery('');
        setResults([]);
        setSearchPerformed(false);
    };

    return (
        <AppGradient colors={["rgba(0,0,0,1)", "rgba(0,0,0,1)"]} bg="empty">
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar style="light" />

                <View className="p-4 flex-1">

                    <View className="flex flex-row items-center bg-gray-800 p-2 rounded mb-4">
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Rechercher un film ou une série"
                            placeholderTextColor="gray"
                            className="flex-1 text-white p-2"
                        />
                        <TouchableOpacity onPress={searchContent} className="bg-crunchy p-2 rounded ml-2">
                            <Text className="text-white">Chercher</Text>
                        </TouchableOpacity>
                        {searchPerformed && (
                            <TouchableOpacity onPress={cancelSearch} className="bg-red-500 p-2 rounded ml-2">
                                <Text className="text-white">Annuler</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    {loading ? (
                        <Text className="text-white">Recherche en cours...</Text>
                    ) : searchPerformed && results.length > 0 ? (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Link href={`/serie/${item.id}`} asChild>
                                    <Pressable>
                                        <View className="p-2 bg-gray-800 rounded mb-2 flex flex-row">

                                            <View>
                                                <Text className="text-white text-lg font-bold">
                                                    {item.title || item.show_title}
                                                </Text>

                                            </View>
                                        </View>
                                    </Pressable>
                                </Link>

                            )}
                        />
                    ) : searchPerformed && results.length === 0 ? (
                        <Text className="text-white">Aucun résultat trouvé</Text>
                    ) : (
                        <Text className="text-gray-400">Entrez un titre pour commencer une recherche.</Text>
                    )}
                </View>
            </SafeAreaView>
        </AppGradient>
    );
};

export default Search;
