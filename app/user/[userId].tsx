import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/hooks/AuthProvider";
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AppGradient from "@/components/AppGratient";

const User = () => {
    const { user } = useContext(AuthContext);
    const { userId } = useLocalSearchParams<any>();
    const [info, setInfo] = useState<any>();
    const [show, setShow] = useState<any>();
    const [friends, setFriends] = useState<any[]>([]);
    const [isFriend, setIsFriend] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;

    if (!apiKey) {
        throw new Error('La clé API BetaSeries est manquante.');
    }

    if (!user?.token) {
        throw new Error('Token est manquant.');
    }

    const fetchUserData = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey }
            };
            const response = await fetch(`https://api.betaseries.com/members/infos?id=${userId}`, options);
            if (response.ok) {
                const data = await response.json();
                setInfo({
                    pseudo: data.member.login,
                    xp: data.member.xp,
                    avatar: data.member.avatar || 'https://t4.ftcdn.net/jpg/01/19/32/93/360_F_119329387_sUTbUdeyhk0nuhNw5WaFvOyQFmxeppjX.jpg',
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchShowList = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey }
            };
            const response = await fetch(`https://api.betaseries.com/shows/member?id=${userId}`, options);
            if (response.ok) {
                const data = await response.json();
                const list = data.shows.map((serie: any) => ({
                    id: serie.id,
                    title: serie.title,
                    poster: serie.images?.poster || "URL_DE_LA_PLACEHOLDER_IMAGE"
                }));
                setShow(list);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des séries: ", error);
        }
    };

    const fetchFriends = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/list?id=${userId}`, options);
            if (response.ok) {
                const data = await response.json();
                setFriends(data.users || []);
            }
        } catch (error) {
            console.log("Erreur lors de la récupération des amis:", error);
        }
    };

    const checkFriendStatus = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/list?id=${user.id}`, options);
            if (response.ok) {
                const data = await response.json();
                const userIdInt = parseInt(userId, 10);
                const friendExists = data.users.some((friend: any) => friend.id === userIdInt);
                setIsFriend(friendExists);
            }
        } catch (error) {
            console.log("Erreur lors de la récupération des amis:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchShowList();
        fetchFriends();
        checkFriendStatus();
        const interval = setInterval(() => {
            fetchUserData();
            fetchShowList();
            fetchFriends();
            checkFriendStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, [userId, user?.token, apiKey]);

    const handleAddFriend = async () => {
        try {
            const options = {
                method: 'POST',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/friend?id=${userId}`, options);
            if (response.ok) {
                setIsFriend(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout en ami:", error);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            const options = {
                method: 'DELETE',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/friend?id=${userId}`, options);
            if (response.ok) {
                setIsFriend(false);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression en ami:", error);
        }
    };

    const handleBlockUser = async () => {
        try {
            const options = {
                method: 'POST',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/block?id=${userId}`, options);
            if (response.ok) {
                setIsBlocked(true);
            }
        } catch (error) {
            console.error("Erreur lors du blocage:", error);
        }
    };

    const handleUnblockUser = async () => {
        try {
            const options = {
                method: 'DELETE',
                headers: { 'X-BetaSeries-Key': apiKey, 'X-BetaSeries-Token': user?.token }
            };
            const response = await fetch(`https://api.betaseries.com/friends/block?id=${userId}`, options);
            if (response.ok) {
                setIsBlocked(false);
            }
        } catch (error) {
            console.error("Erreur lors du déblocage:", error);
        }
    };

    return (
        <AppGradient colors={["rgba(0,0,0,1)", "rgba(0,0,0,1)"]} bg="empty">
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar style="light" />
                <ScrollView className="flex-1">
                    <View className="items-center pt-4">
                        <Image
                            source={{ uri: info?.avatar }}
                            className="w-32 h-32 rounded-full border-4 border-white"
                        />
                        <Text className="text-2xl text-white font-bold mt-4">
                            {info?.pseudo || 'Me'}
                        </Text>

                        {isBlocked ? (
                            <TouchableOpacity
                                onPress={handleUnblockUser}
                                className="bg-blue-500 px-4 py-2 rounded-full mt-4"
                            >
                                <Text className="text-white font-bold">Débloquer</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                {isFriend ? (
                                    <View className="flex flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={handleRemoveFriend}
                                            className="bg-red-500 px-4 py-2 rounded-full mt-4"
                                        >
                                            <Text className="text-white font-bold">Supprimer</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleBlockUser}
                                            className="bg-gray-500 px-4 py-2 rounded-full mt-4"
                                        >
                                            <Text className="text-white font-bold">Bloquer</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleAddFriend}
                                        className="bg-orange-500 px-4 py-2 rounded-full mt-4"
                                    >
                                        <Text className="text-white font-bold">Ajouter comme ami</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>

                    <View className="mt-8">
                        <Text className="text-xl text-orange-500 font-bold mb-4 px-6">
                            Sa liste
                        </Text>
                        <FlatList
                            data={show}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View className="mr-4 ml-2 w-40">
                                    <Image
                                        source={{ uri: item.poster }}
                                        className="w-40 h-60 rounded-lg"
                                    />
                                    <Text className="text-white font-semibold mt-2">
                                        {item.title}
                                    </Text>
                                </View>
                            )}
                            contentContainerStyle={{ paddingLeft: 20 }}
                        />
                    </View>

                    <View className="mt-8">
                        <Text className="text-xl text-orange-500 font-bold mb-4 px-6">
                            Ses amis
                        </Text>
                        <FlatList
                            data={friends}
                            horizontal
                            showsHorizontalScrollIndicator={false}  
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View className="mr-4 ml-2 items-center">
                                    <Image
                                        source={{ uri: item.avatar }}
                                        className="w-20 h-20 rounded-full"
                                    />
                                    <Text className="text-white text-center mt-2">
                                        {item.login}
                                    </Text>
                                </View>
                            )}
                            contentContainerStyle={{ paddingLeft: 20 }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AppGradient>
    );
};

export default User;
