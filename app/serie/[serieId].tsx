import React, { useContext, useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { AuthContext } from "@/hooks/AuthProvider";
import { useLocalSearchParams, router, Link } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import LoadingScreen from '@/components/LoadingScreen';
import AppGradient from '@/components/AppGratient';

interface Detail {
    title: string;
    gender: string;
    describe: string;
    note: number;
    poster: string;
    seasons: Season[];
}

interface Season {
    number: number;
    title: string;
    episodes: Episode[];
}

interface Episode {
    id: number;
    title: string;
    episode: number;
    img: string;
    season_title: string;
    seen: boolean;
}

export default function SerieDetail() {
    const { user } = useContext(AuthContext);
    const { serieId } = useLocalSearchParams();
    const [serie, setSerie] = useState<Detail | null>(null);
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showTrash, setShowTrash] = useState(false);
    const [archive, setArchive] = useState(false);
    const [loading, setLoading] = useState(true);
    const notfound = "https://media.istockphoto.com/id/938023424/vector/404-page-not-found-concept-set-vector-design-elements.jpg?s=612x612&w=0&k=20&c=c9SLBdutGGyVUehweCt72xTG0vuW-CasxfQzXb9URxU=";
    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;
    const [clickedEpisodeId, setClickedEpisodeId] = useState<number | null>(null);
    const [isBoxVisible, setIsBoxVisible] = useState<number | null>(null);
    const [seen, setSeen] = useState<number[]>([])
    const [addSeries, setAddedSeries] = useState<boolean>(false)
    const [save, setSave] = useState<boolean>(false)

    
    if (!apiKey) {
        throw new Error('La clé API BetaSeries est manquante.');
    }

    if (!user?.token) {
        throw new Error('Token est manquant.');
    }


    const handleAddSerie = async (serieId: any) => {
        try {
            const options = { method: 'POST', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token } };
            const response = await fetch(`https://api.betaseries.com/shows/show?id=${serieId}`, options);
            if (response.ok) {

                setAddedSeries(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la série:", error);
        }
    };


    const handleRemoveSerie = async (serieId: any) => {
        try {
            const options = { method: 'DELETE', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token } };
            const response = await fetch(`https://api.betaseries.com/shows/show?id=${serieId}`, options);
            if (response.ok) {

                setAddedSeries(false);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la série:", error);
        }
    };


    const toggleBox = (id: number) => {
        setIsBoxVisible(isBoxVisible === id ? null : id);
    };

    const handleClick = (id: number) => {
        setClickedEpisodeId(clickedEpisodeId === id ? null : id);
    };

    useEffect(() => {


        fetchSerie();
    }, [serieId]);

    const fetchSerie = async () => {
        try {
            const options = { method: 'GET', headers: { 'X-BetaSeries-Key': apiKey } };


            const response = await fetch(`https://api.betaseries.com/shows/display?id=${serieId}`, options);
            const data = await response.json();


            const episodesResponse = await fetch(`https://api.betaseries.com/shows/episodes?id=${serieId}`, options);
            const episodesData = await episodesResponse.json();


            const seasons: Season[] = [];
            await Promise.all(episodesData.episodes.map(async (ep: any) => {
                let season = seasons.find(s => s.number === ep.season);
                if (!season) {
                    season = {
                        number: ep.season,
                        title: `${ep.season}. ${ep.show_slug}` || `Saison ${ep.season}`,
                        episodes: []
                    };
                    seasons.push(season);
                }


                const fetchEpImg = async (id: number) => {
                    try {
                        const episodeImgResponse = await fetch(`https://api.betaseries.com/pictures/episodes?id=${id}`, options);
                        const imageArrayBuffer = await episodeImgResponse.arrayBuffer();
                        const imageBlob = new Uint8Array(imageArrayBuffer);
                        const base64String = btoa(String.fromCharCode(...imageBlob));

                        return `data:image/jpeg;base64,${base64String}`;
                    } catch (error) {
                        console.log("Erreur lors de la récupération de l'image:", error);
                        return "";
                    }
                };

                const isSeen = async (id: number) => {
                    try {
                        const response = await fetch(`https://api.betaseries.com/episodes/search?show_id=${serieId}&number=${id}`, options);
                        const data: any = response.json()

                        if (!response.ok) {
                            return false;
                        }

                        return data.episode.user.seen;
                    } catch (error) {
                        console.log("Erreur lors de la récupération de l'image:", error);
                        return "";
                    }
                };


                const episodeImage = await fetchEpImg(ep.id);
                let see = await isSeen(ep.id)


                season.episodes.push({
                    id: ep.id,
                    title: ep.title,
                    episode: ep.episode,
                    img: episodeImage,
                    season_title: ep.season_title || `Saison ${ep.season}`,
                    seen: see,
                });
            }));

            const detail: Detail = {
                title: data.show.title,
                describe: data.show.description,
                poster: data.show.images.poster,
                note: data.show.notes.mean,
                gender: Object.values(data.show.genres).join(' • '),
                seasons: seasons.sort((a, b) => a.number - b.number)
            };

            setSerie(detail);
            setLoading(false);
            if (seasons.length > 0) {
                setSelectedSeason(seasons[0].number);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };


    if (loading) {
        return <LoadingScreen black={true} />;
    }

    const toggleDropdown = () => {
        if (serie && serie.seasons.length > 1) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const selectSeason = (seasonNumber: number) => {
        setSelectedSeason(seasonNumber);
        setIsDropdownOpen(false);
    };

    const toggleShowTrash = () => {
        setShowTrash(prevState => !prevState);
    };

    const handleArchiveSerie = async () => {
        try {
            const options = { method: 'POST', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user.token } };
            const response = await fetch(`https://api.betaseries.com/shows/archive?id=${serieId}`, options);
            const data = await response.json();

            if (response.ok) {
                setArchive(!archive)
            }
        } catch (error) {
            console.error("Erreur lors de l'archivage", error);
        }
    };

    const handleSeenEp = async (epId: number) => {
        try {
            const options = { method: 'POST', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user.token } };
            const response = await fetch(`https://api.betaseries.com/episodes/watched?id=${epId}`, options);
            const data = await response.json();
           
            if (response.ok) {
                setSeen((prevSeen) => [...prevSeen, epId]);
                fetchSerie();
            }
        } catch (error) {
            console.error("Erreur lors du visionnage de l'episode", error);
        }
    }

    const handleUnSeenEp = async (epId: number) => {
        try {
            const options = { method: 'DELETE', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user.token } };
            const response = await fetch(`https://api.betaseries.com/episodes/watched?id=${epId}`, options);
            const data = await response.json();
           
            if (response.ok) {
                setSeen((prevSeen) => prevSeen.filter((seenId) => seenId !== epId));
                fetchSerie();
            }
        } catch (error) {
            console.error("Erreur lors du visionnage de l'episode", error);
        }
    }

    const handleDesArchiveSerie = async () => {
        try {
            const options = { method: 'DELETE', headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user.token } };
            const response = await fetch(`https://api.betaseries.com/shows/archive?id=${serieId}`, options);
            const data = await response.json();

            if (response.ok) {
                setArchive(!archive)
            }
        } catch (error) {
            console.error("Erreur lors de l'archivage", error);
        }
    };

    const renderSeasonSelector = () => {
        if (!serie || serie.seasons.length === 0) return null;

        if (serie.seasons.length === 1) {
            return (
                <View className='bg-zinc-950 h-10 flex flex-row p-2 items-center border-t-2 border-b-2 border-zinc-800'>
                    <Text className='text-white text-md font-semibold'>
                        {serie.seasons[0].title.toUpperCase()}
                    </Text>
                </View>
            );
        }

        return (
            <>
                <TouchableOpacity
                    onPress={toggleDropdown}
                    className='bg-zinc-950 h-10 flex flex-row p-2 items-center border-t-2 border-b-2 border-zinc-800'
                >
                    <Text className="flex mr-2 text-zinc-600">
                        <Ionicons name={isDropdownOpen ? "caret-up" : "caret-down"} size={22} />
                    </Text>
                    <Text className='text-white text-md font-semibold'>
                        {serie.seasons.find((s: any) => s.number === selectedSeason)?.title.toUpperCase() || "SÉLECTIONNER UNE SAISON"}
                    </Text>
                </TouchableOpacity>
                {isDropdownOpen && (
                    <View className="bg-zinc-900">
                        {serie.seasons.map((season: any) => (
                            <TouchableOpacity
                                key={season.number}
                                onPress={() => selectSeason(season.number)}
                                className="p-2 border-b border-zinc-800"
                            >
                                <Text className="text-white">{season.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </>
        );
    }

    return (
        <AppGradient colors={['rgba(0,0,0,1)', 'rgba(0,0,0,1)']} bg="empty">
            <View className="relative">
                <Pressable
                    onPress={() => router.back()}
                    className='w-10 flex m-2 items-center justify-center h-8 z-20 rounded-full overflow-hidden'>
                    <Text className="flex text-white bg-black rounded-full overflow-hidden">
                        <Ionicons name="caret-back-circle-sharp" size={32} />
                    </Text>
                </Pressable>

                <View className='absolute flex flex-row items-center mb-4 w-full h-screen'>
                    <Image
                        source={{ uri: serie?.poster || notfound }}
                        className="w-full h-full z-10"
                    />
                </View>

                <ScrollView contentContainerStyle={{ paddingTop: 500 }} className="relative text-white z-20">
                    <View className="rounded-tl-lg rounded-tr-lg">
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }} className="p-4 rounded-tl-lg rounded-tr-lg">
                            <Text className="text-2xl font-bold text-white">
                                {serie?.title || "Titre de la serie"}
                            </Text>
                            <Text className="text-muted text-white">{serie?.gender || "Genres de la serie"}</Text>
                            <View className="flex flex-row items-center mt-2">
                                <Text className="text-yellow-400">★★★★☆</Text>
                                <Text className="text-muted ml-2 text-white">Moyenne : {serie?.note || 0} (34.4K)</Text>
                            </View>
                        </View>

                        <View className='bg-black px-4'>
                            <TouchableOpacity className="bg-secondary text-secondary-foreground mt-2 p-2 rounded">

                            </TouchableOpacity>

                            <Text className="mt-4 text-white">
                                {serie?.describe || "Description de la serie"}
                            </Text>


                            <TouchableOpacity onPress={toggleShowTrash} className="text-xs font-semibold mt-6 text-crunchy text-center">
                                <Text className='text-crunchy'>{showTrash ? "MASQUER" : "EN SAVOIR PLUS"}</Text>
                            </TouchableOpacity>

                            {showTrash && (
                                archive ? (
                                    <TouchableOpacity onPress={handleDesArchiveSerie} className="flex self-end bg-crunchy text-accent-foreground my-2 p-3 items-center justify-center rounded flex w-[12%]">
                                        <MaterialCommunityIcons name="delete-restore" size={20} color="black" />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={handleArchiveSerie} className="flex self-end bg-gray-700 text-accent-foreground my-2 p-3 items-center justify-center rounded flex w-[12%]">
                                        <Fontisto name="trash" size={20} color="black" />
                                    </TouchableOpacity>
                                )
                            )}


                            <View className="mt-4">
                                <Text className="text-md font-semibold text-white border-b-2 border-crunchy w-[70px]">ÉPISODES</Text>
                                {renderSeasonSelector()}

                                {selectedSeason !== null && serie?.seasons
                                    .find((s: any) => s.number === selectedSeason)?.episodes

                                    .sort((a: any, b: any) => a.episode - b.episode)
                                    .map((ep: any) => (
                                        <View key={ep.id} className="flex flex-row justify-between items-center py-2">


                                            <Link href={`/episode/${ep.id}`} asChild>
                                                <Pressable className="text-white flex flex-row items-center gap-2" onPress={() => handleClick(ep.id)}>
                                                    <Text className="text-white">{ep.episode} </Text>
                                                    <View className='w-36 h-20'>
                                                        <Image
                                                            source={{ uri: ep?.img || notfound }}
                                                            className="w-full h-full z-10"
                                                        />
                                                    </View>
                                                    <Text className="text-white">{ep.title}</Text>
                                                </Pressable>
                                            </Link>

                                            <View className="relative p-2">

                                                <TouchableOpacity>
                                                    <Pressable onPress={() => toggleBox(ep.id)} className="p-2 bg-gray-800 rounded">
                                                        <Ionicons name="ellipsis-vertical" size={20} color="white" />
                                                    </Pressable>
                                                </TouchableOpacity>


                                                {isBoxVisible === ep.id && (
                                                    <View className="absolute top-10 right-0 bg-gray-900 p-4 rounded-lg shadow-lg z-10 w-[200px]">
                                                        {/* {ep.seen ? */}
                                                        <TouchableOpacity className="mb-2 p-2 bg-gray-700 rounded">
                                                            <Pressable onPress={() => handleUnSeenEp(ep.episode)}>
                                                                <Text className="text-white">Marquer comme non vu</Text>
                                                            </Pressable>
                                                        </TouchableOpacity>
                                                        {/* : */}
                                                        <TouchableOpacity className="mb-2 p-1 bg-gray-700 rounded">
                                                            <Pressable onPress={() => handleSeenEp(ep.episode)}>
                                                                <Text className="text-white">Marquer comme vu</Text>
                                                            </Pressable>
                                                        </TouchableOpacity>
                                                        {/* } */}


                                                   

                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                            </View>

                            <View className="flex flex-row gap-2 mb-20 w-full">
                                <TouchableOpacity className="bg-crunchy text-accent-foreground my-2 p-3 rounded w-[88%]">
                                    <Text className="text-center">LECTURE E1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => (addSeries ? handleRemoveSerie(serieId) : handleAddSerie(serieId))}
                                    className="bg-crunchy text-accent-foreground my-2 p-3 items-center justify-center rounded flex w-[12%]"
                                >
                                    <Fontisto name="favorite" size={20} color={addSeries ? "white" : "black"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </AppGradient>
    );
}
