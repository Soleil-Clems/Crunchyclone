import { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { md5 } from 'js-md5';
import { useRouter } from 'expo-router';
import AppGradient from "@/components/AppGratient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "@/hooks/AuthProvider";

export default function App() {
    const { user, setUser } = useContext(AuthContext);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!login || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        try {
            const response = await fetch('https://api.betaseries.com/members/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login,
                    password: md5(password),
                    key: process.env.EXPO_PUBLIC_BETASERIES_API_KEY,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const userInfo: any = {
                    token: data.token,
                    id: data.user.id,
                    pseudo: data.user.login,
                    xp: data.user.xp,
                    in_account: data.user.in_account
                }
                setUser(userInfo);
                await AsyncStorage.setItem("user", JSON.stringify(userInfo));
                router.replace("/(tabs)");
            } else {
                Alert.alert('Erreur', "Identifiants incorrect");
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
            console.error(error);
        }
    };

    const handleCreateAccount = async () => {
        if (!login || !password || !email) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        try {
            const response = await fetch('https://api.betaseries.com/members/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login,
                    email,
                    password: md5(password),
                    key: process.env.EXPO_PUBLIC_BETASERIES_API_KEY,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Succès', 'Compte créé avec succès!');
                setIsCreatingAccount(false); 
            } else {
                Alert.alert('Erreur', data.error || "Une erreur est survenue lors de la création du compte.");
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue lors de la création du compte.');
            console.error(error);
        }
    };

    return (
        <View className="flex-1">
            <AppGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']} bg="https://m.media-amazon.com/images/I/71n5FUP1VBL.jpg">
                <View className='flex-1 justify-center'>
                    <Text className='text-3xl text-white font-semibold w-full flex text-center mt-10'>
                        {isCreatingAccount ? "Créer un compte" : "Connexion"}
                    </Text>

                    <View className='mt-8'>
                        {isCreatingAccount && (
                            <TextInput
                                className='text-white border border-white p-2 mb-4'
                                placeholder='Email'
                                placeholderTextColor="#ccc"
                                value={email}
                                onChangeText={setEmail}
                            />
                        )}
                        <TextInput
                            className='text-white border border-white p-2 mb-4'
                            placeholder='Login'
                            placeholderTextColor="#ccc"
                            value={login}
                            onChangeText={setLogin}
                        />

                        <TextInput
                            className='text-white border border-white p-2 mb-4'
                            placeholder='Password'
                            placeholderTextColor="#ccc"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity
                            className='bg-blue-500 p-3 rounded-full mt-4'
                            onPress={isCreatingAccount ? handleCreateAccount : handleLogin}
                        >
                            <Text className='text-white text-center'>
                                {isCreatingAccount ? "Créer un compte" : "Se connecter"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className='mt-4'
                            onPress={() => setIsCreatingAccount(!isCreatingAccount)}
                        >
                            <Text className='text-white text-center'>
                                {isCreatingAccount ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Créez-en un"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AppGradient>
        </View>
    );
}

App.options = {
    headerShown: false,
};
