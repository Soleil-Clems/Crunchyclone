import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/hooks/AuthProvider";
import {
    Text,
    View,
    Image,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AppGradient from "@/components/AppGratient";
import { Link, useRouter } from "expo-router";

const Profil = () => {
    const { user, logout } = useContext(AuthContext);
    const [pseudo, setPseudo] = useState(user?.pseudo);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState("");
    const [infoVisible, setInfoVisible] = useState(false);
    const router = useRouter();
    const [info, setInfo] = useState<any>();
    const [show, setShow] = useState<any>();
    const [friends, setFriends] = useState<any[]>([]);
    const apiKey = process.env.EXPO_PUBLIC_BETASERIES_API_KEY;

    if (!apiKey) {
        throw new Error('La clé API BetaSeries est manquante.');
    }

    if (!user?.token) {
        return router.replace('../');
        throw new Error('Token est manquant.');
    }

   
    const fetchUserInfo = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey }
            };
            const response: any = await fetch(`https://api.betaseries.com/members/infos?id=${user.id}`, options);
            if (response.ok) {
                const data: any = await response.json();
                setInfo({
                    pseudo: data.member.login,
                    xp: data.member.xp,
                    avatar: data.member.avatar ? data.member.avatar : 'https://t4.ftcdn.net/jpg/01/19/32/93/360_F_119329387_sUTbUdeyhk0nuhNw5WaFvOyQFmxeppjX.jpg',
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
    
        fetchUserInfo();

        
        const interval = setInterval(() => {
            fetchUserInfo();
            fetchFriends();  
            fetchList();     
        }, 5000);

     
        return () => clearInterval(interval);
    }, [user.id, apiKey]);

    const fetchList = async () => {
        try {
            const options = {
                method: 'GET',
                headers: { 'X-BetaSeries-Key': apiKey }
            };
            const response = await fetch(`https://api.betaseries.com/shows/member?id=${user.id}`, options);
            if (response.ok) {
                const data = await response.json();
                let list = data.shows.map((serie: any) => ({
                    id: serie.id,
                    title: serie.title,
                    poster: serie.images?.poster || "https://via.placeholder.com/150"
                }));
                setShow(list);
            } else {
                console.error("Erreur de réponse: ", response.statusText);
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
            const response = await fetch(`https://api.betaseries.com/friends/list?id=${user.id}`, options);
            if (response.ok) {
                const data = await response.json();
                setFriends(data.users || []);
            }
        } catch (error) {
            console.log("Erreur lors de la récupération des amis:", error);
        }
    };

    const toggleInfoVisibility = () => {
        setInfoVisible(!infoVisible);
    };

    const handleLogout = () => {
        logout();
        router.replace('../');
    };

    const handleSaveChanges = async () => {
        try {
            const options = {
                method: 'PUT',
                headers: {
                    'X-BetaSeries-Key': apiKey,
                    'X-BetaSeries-Token': user?.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: pseudo, email, password }),
            };
            const response = await fetch(`https://api.betaseries.com/members/update`, options);
            if (response.ok) {
                
            } else {
                console.error("Erreur lors de la mise à jour du profil:", response.statusText);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        }
    };

    return (
        <AppGradient colors={["rgba(0,0,0,1)", "rgba(0,0,0,1)"]} bg="empty">
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar style="light" />
                <ScrollView className="flex-1">
                    <View className="items-center pt-4">
                        <Image
                            source={{ uri: info?.avatar || "https://via.placeholder.com/150" }}
                            className="w-32 h-32 rounded-full border-4 border-white"
                        />
                        <Text className="text-2xl text-white font-bold mt-4">
                            {info?.pseudo || user?.pseudo || 'Me'}
                        </Text>
                        <TouchableOpacity className="mt-2 bg-orange-500 px-4 py-2 rounded-full">
                            <Text className="text-white">Modifier la photo</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="bg-orange-500 mx-6 my-4 py-2 rounded-lg"
                        onPress={toggleInfoVisibility}
                    >
                        <Text className="text-white text-center font-semibold">
                            {infoVisible ? "Masquer les informations" : "Afficher les informations"}
                        </Text>
                    </TouchableOpacity>

                    {infoVisible && (
                        <View className="px-6 mt-8">
                            <InputField
                                label="Pseudo"
                                value={pseudo}
                                secureTextEntry={false}
                                onChangeText={setPseudo}
                                keyboardType='default'
                            />
                            <InputField
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                secureTextEntry={false}
                                keyboardType="email-address"
                            />
                            <InputField
                                label="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                keyboardType='default'
                            />
                            <Pressable onPress={handleLogout}>
                                <Text className="text-gray-400 bg-gray-800 py-2 px-4 rounded-md self-end">Logout</Text>
                            </Pressable>
                            <TouchableOpacity
                                className="bg-orange-500 mx-6 my-8 py-3 rounded-lg"
                                onPress={handleSaveChanges}
                            >
                                <Text className="text-white text-center font-semibold">
                                    Sauvegarder
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="mt-8">
                        <Text className="text-xl text-orange-500 font-bold mb-4 px-6">
                            Ma liste
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
                            Mes amis
                        </Text>
                        <FlatList
                            data={friends}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Link href={`/user/${item.id}`} asChild>
                                    <Pressable>
                                        <View className="mr-4 ml-2 items-center">
                                            <Image
                                                source={{ uri: item.avatar }}
                                                className="w-20 h-20 rounded-full"
                                            />
                                            <Text className="text-white text-center mt-2">
                                                {item.login}
                                            </Text>
                                        </View>
                                    </Pressable>
                                </Link>
                            )}
                            contentContainerStyle={{ paddingLeft: 20 }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AppGradient>
    );
};

const InputField = ({
    label,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
}: {
    label: any,
    value: any,
    onChangeText: any,
    secureTextEntry: any,
    keyboardType: any,
}) => (
    <View className="mb-4">
        <Text className="text-gray-300 mb-2">{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            className="bg-gray-800 text-white py-3 px-4 rounded-lg"
            placeholderTextColor="#9ca3af"
        />
    </View>
);

export default Profil;
