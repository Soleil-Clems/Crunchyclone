import React, { useContext, useState } from "react";
import { AuthContext } from "@/hooks/AuthProvider";
import { Pressable, Text, View, Image, FlatList } from 'react-native';
import { Miniature } from '@/constants/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

const SeriesCarousel = ({ data }: { data: Miniature[] }) => {
    const { user } = useContext(AuthContext);
    const [addedSeries, setAddedSeries] = useState<number[]>([]);
    const router = useRouter();

    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;

    if (!apiKey) {
        router.replace("/")
        throw new Error('La clé API BetaSeries est manquante.');
    }

    if (!user?.token) {
        router.replace("/")
        throw new Error('Token est manquant.');
    }
  


    const handleAddSerie = async (serieId: number) => {
        try {
            const options = { method: 'POST', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token } };
            const response = await fetch(`https://api.betaseries.com/shows/show?id=${serieId}`, options);
            if (response.ok) {

                setAddedSeries(prevAdded => [...prevAdded, serieId]);
            } else {
                const data = await response.json();
                if (data.errors?.[0]?.code === 203) {
                    setAddedSeries(prevAdded => [...prevAdded, serieId]);
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la série:", error);
        }
    };


    const handleRemoveSerie = async (serieId: number) => {
        try {
            const options = { method: 'DELETE', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token } };
            const response = await fetch(`https://api.betaseries.com/shows/show?id=${serieId}`, options);
            if (response.ok) {

                setAddedSeries(prevAdded => prevAdded.filter(id => id !== serieId));
            } else {
                const data = await response.json();
                if (data.errors?.[0]?.code === 204) {
                    setAddedSeries(prevAdded => prevAdded.filter(id => id !== serieId));
                }
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la série:", error);
        }
    };

    return (
        <View className="my-2">
            <FlatList
                data={data}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item }) => (
                    <View className="mr-4 ml-2 w-40" key={item.id.toString()}>
                        <Link href={`/serie/${item.id}`} asChild>
                            <Pressable>
                                <Image
                                    source={{ uri: item.img }}
                                    className="w-40 h-60 rounded-lg"
                                />
                            </Pressable>
                        </Link>
                        <View className="flex flex-row py-2 justify-between items-center  text-white w-36">
                            <Link href={`/serie/${item.id}`} asChild>
                                <Pressable className="w-full-4/5 ">
                                    <Text numberOfLines={1} className="text-white flex  rounded-sm ">
                                        {item.title}
                                    </Text>
                                </Pressable>
                            </Link>
                            {addedSeries.includes(item.id) ? (
                                <Pressable className='flex  justify-center items-center z-10' onPress={() => handleRemoveSerie(item.id)}>
                                    <Ionicons name="checkmark-done-circle" size={24} color="green" />
                                </Pressable>
                            ) : (
                                <Pressable className='flex  justify-center rounded-sm bg-slate-800 w-8 items-center z-10' onPress={() => handleAddSerie(item.id)}>
                                    <Ionicons name="add-circle" size={24} color="orange" />
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingLeft: 20 }}
                horizontal
            />
        </View>
    );
};

export default SeriesCarousel;
