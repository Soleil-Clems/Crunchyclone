import AppGradient from '@/components/AppGratient';
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/hooks/AuthProvider";
import { View, Text, Image, TouchableOpacity, Pressable, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

interface Episode {
    id: number;
    title: string;
    episode: number;
    note: number;
    img: any;
    describe: string;
    season_title: string;
    season: number;
    date: any;
}

interface Comment {
    id: number;
    login: string;
    avatar: string;
    text: string;
    date: string;
}

export default function EpisodeDetail() {
    const { user } = useContext(AuthContext);
    const { episodeId } = useLocalSearchParams();
    const [episode, setEpisode] = useState<Episode | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsVisible, setCommentsVisible] = useState(false);
    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;

    if (!apiKey) {
        throw new Error('La clé API BetaSeries est manquante.');
    }

    if (!user?.token) {
        throw new Error('Token est manquant.');
    }

    useEffect(() => {
        const fetchEpisode = async () => {
            try {
                const options = {
                    method: 'GET',
                    headers: { 'X-BetaSeries-Key': apiKey }
                };

                const response = await fetch(`https://api.betaseries.com/episodes/display?id=${episodeId}`, options);

                if (!response.ok) {
                    throw new Error(`Erreur lors de la récupération de l'épisode: ${response.statusText}`);
                }

                const data = await response.json();
                const fetchEpImg = async (id: number) => {
                    try {
                        const episodeImgResponse = await fetch(`https://api.betaseries.com/pictures/episodes?id=${id}`, options);

                        if (!episodeImgResponse.ok) {
                            throw new Error(`Erreur lors de la récupération de l'image: ${episodeImgResponse.statusText}`);
                        }

                        const imageArrayBuffer = await episodeImgResponse.arrayBuffer();
                        const imageBlob = new Uint8Array(imageArrayBuffer);
                        const base64String = btoa(String.fromCharCode(...imageBlob));

                        return `data:image/jpeg;base64,${base64String}`;
                    } catch (error) {
                        console.log("Erreur lors de la récupération de l'image:", error);
                        return "";
                    }
                };

                const epImg = await fetchEpImg(data.episode.id);

                const info: Episode = {
                    id: data.episode.id,
                    title: data.episode.title,
                    describe: data.episode.show.description,
                    episode: data.episode.episode,
                    note: data.episode.note ? data.episode.note.mean : 0,
                    img: epImg,
                    season_title: data.episode.show.title,
                    season: data.episode.season,
                    date: data.episode.date
                };

                setEpisode(info);
            } catch (error) {
                console.log("Erreur lors de la récupération de l'épisode:", error);
            }
        };

        fetchEpisode();
    }, [episodeId]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const options = {
                    method: 'GET',
                    headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user.token }
                };

                const response = await fetch(`https://api.betaseries.com/comments/comments?type=episode&id=${episodeId}&nbpp=10`, options);
                const data = await response.json();
                setComments(data.comments || []);
            } catch (error) {
                console.log("Erreur lors de la récupération des commentaires:", error);
            }
        };

        fetchComments();
    }, [episodeId]);

    const submitComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir un commentaire valide.');
            return;
        }

        try {
            const options = {
                method: 'POST',
                headers: {
                    'X-BetaSeries-Key': apiKey,
                    'X-BetaSeries-Token': user.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'episode',
                    id: episodeId,
                    text: newComment
                })
            };

            const response = await fetch('https://api.betaseries.com/comments/comment', options);
            if (response.ok) {
                const newCommentData: any = {
                    id: Date.now(),
                    login: user.pseudo,
                    text: newComment,
                    date: new Date().toISOString()
                };
                setComments([...comments, newCommentData]);
                setNewComment('');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du commentaire", error);
        }
    };

    const toggleComments = () => {
        setCommentsVisible(!commentsVisible);
    };

    const renderHeader = () => (
        <View>
            <Image source={{ uri: episode?.img || 'https://via.placeholder.com/500' }} style={{ width: '100%', height: 250 }} />
            <LinearGradient colors={['transparent', '#121212']} style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', padding: 16 }}>
                    {episode?.title || "Titre de l'épisode"}
                </Text>
            </LinearGradient>
            <View style={{ padding: 16, backgroundColor: '#121212' }}>
                <Text style={{ fontSize: 14, color: 'gray', marginTop: 8 }}>Sortie : {episode?.date || 'Non disponible'}</Text>
                <Text style={{ color: 'white', marginTop: 16 }}>{episode?.describe || 'Pas de description disponible.'}</Text>
                <TouchableOpacity
                    onPress={toggleComments}
                    style={{
                        marginTop: 16,
                        backgroundColor: '#FF4500',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                    }}>
                    <Ionicons name={commentsVisible ? "eye-off" : "eye"} size={20} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {commentsVisible ? 'Masquer' : 'Afficher'} les commentaires
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderComments = () => (
        commentsVisible ? (
            <View style={{ padding: 16, backgroundColor: '#1E1E1E' }}>
                {comments.length ? (
                    comments.map((item) => (
                        <View key={item.id} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'center' }}>
                            <Image
                                source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.login}</Text>
                                <Text style={{ color: 'gray', fontSize: 12 }}>{new Date(item.date).toLocaleString()}</Text>
                                <Text style={{ color: 'white', marginTop: 4 }}>{item.text}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: 'gray', textAlign: 'center', marginTop: 16 }}>Aucun commentaire pour cet épisode.</Text>
                )}
                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Ajouter un commentaire"
                    placeholderTextColor="#888"
                    style={{
                        backgroundColor: '#333',
                        color: 'white',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                    }}
                />
                <TouchableOpacity
                    onPress={submitComment}
                    style={{
                        backgroundColor: '#FF4500',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                    }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Soumettre</Text>
                </TouchableOpacity>
            </View>
        ) : null
    );

    return (
        <AppGradient colors={['#000', '#121212']} bg="empty">
            <View style={{ flex: 1 }}>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        padding: 8,
                        borderRadius: 50,
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                    <Ionicons name="caret-back-circle" size={32} color="white" />
                </Pressable>
                    <FlatList
                        ListHeaderComponent={renderHeader}
                        ListFooterComponent={renderComments}
                        data={[]}
                        renderItem={null}
                        keyExtractor={() => String(Math.random())}
                    />
             
            </View>
        </AppGradient>
    );
}
