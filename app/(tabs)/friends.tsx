import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppGradient from '@/components/AppGratient';
import { Link } from 'expo-router';

const Friends = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false); 

    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;


    const searchUsers = async () => {
        if (searchQuery.trim() === '') return;

        setLoading(true);
        setSearchPerformed(true);
        try {
            const response = await fetch(`https://api.betaseries.com/members/search?login=${searchQuery}&key=${apiKey}`);
            const data = await response.json();

            if (data && data.users) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };


    const cancelSearch = () => {
        setSearchQuery('');
        setUsers([]);
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
                            placeholder="Rechercher un ami"
                            placeholderTextColor="gray"
                            className="flex-1 text-white p-2"
                        />
                        <TouchableOpacity onPress={searchUsers} className="bg-crunchy p-2 rounded ml-2">
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
                    ) : searchPerformed && users.length > 0 ? (
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (

                                <Link href={`/user/${item.id}`} asChild>
                                    <Pressable>
                                        <View className="p-2 bg-gray-800 rounded mb-2">
                                            <Text className="text-white text-lg">{item.login}</Text>
                                            <Text className="text-gray-400">ID: {item.id}</Text>
                                        </View>
                                    </Pressable>
                                </Link>
                            )}
                        />
                    ) : searchPerformed && users.length === 0 ? (
                        <Text className="text-white">Aucun résultat trouvé</Text>
                    ) : (
                        <Text className="text-gray-400">Entrez un nom pour commencer une recherche.</Text>
                    )}
                </View>
            </SafeAreaView>
        </AppGradient>
    );
};

export default Friends;
